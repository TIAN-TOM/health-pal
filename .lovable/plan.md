# 修复"暂无可显示的横幅内容" — 方案 C

## 根因

1. Open-Meteo 返回 **429 Too Many Requests**（"Daily API request limit exceeded"），`weather` 始终为 `null`。
2. 数据库中没有有效的倒数日事件，`countdowns` 为空。
3. `HomeBanner.slides` 为空 → 走 placeholder 分支显示"暂无可显示的横幅内容"。

## 修复策略

**A. 多 API 顺序回退** → **B. localStorage 持久缓存兜底** → **C. 全部失败则隐藏横幅而不是显示占位**。

---

## 1. 新建 `src/services/weatherProviders.ts`

抽出"按城市经纬度获取当前天气"的多提供方实现，每个 provider 返回统一的 `WeatherData` 结构（无 forecast / yesterday，仅 current）。

按顺序尝试：
1. **Open-Meteo**（现有，主力，免 Key）
2. **wttr.in**（`https://wttr.in/{lat},{lon}?format=j1`，免 Key，作为 1 级回退；解析 `current_condition[0]`，把 WWO 天气码映射到现有 `weatherCodeMap` 的近似 emoji/描述）
3. **MET Norway Locationforecast**（`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=..&lon=..`，免 Key，需要 `User-Agent` header；浏览器端会被 UA 限制，作为 2 级回退；若 CORS/UA 失败则跳过）

```text
getCurrentWeather(city)
  ├─ try openMeteo  → ok? return
  ├─ try wttrIn     → ok? return
  ├─ try metNo      → ok? return
  └─ throw AllProvidersFailed
```

每个 provider 内部 5 秒超时（`AbortController`），避免单个慢响应拖垮整体。

## 2. 改造 `src/services/weatherService.ts`

- `getWeatherData(city, includeForecast)`：
  - **当 `includeForecast=false`**（HomeBanner 用）：调用 `getCurrentWeather(city)` 走多 provider 链；任一成功即返回并写入内存缓存 + **localStorage 持久缓存** (`weather_cache_{city}`，含 `timestamp`)。
  - **当 `includeForecast=true`**（WeatherDetail 用）：仍走 Open-Meteo（含 forecast/yesterday），失败时回退到 `getCurrentWeather` 仅返回当前天气（forecast/yesterday 设 `undefined`，UI 已对 optional 兼容）。
- 抛错前先尝试 localStorage：若有 24 小时内的旧数据，返回它并加 `stale: true` 标记（写入 console.warn），UI 仍能展示。
- 真正全部失败才 throw。

## 3. 改造 `src/components/HomeBanner.tsx`

- `slides` 计算保持现状，但**移除 `placeholder` 分支**。
- 渲染前：
  ```ts
  if (slides.length === 0) return null;
  ```
- 顶层早返 `null` 时父级 `HomePage` 自然收起空白（当前已是普通块级，无需额外间距处理）。
- `weatherLoading` 失败后置为 `false` 即可，无需额外状态。

## 4. 更新 Memory

更新 `mem://features/weather-module`，记录"多 provider 回退顺序 + localStorage 持久兜底，HomeBanner 在无内容时隐藏"。

## 5. 更新日志

在 `src/data/updateLog.ts` 顶部新增 `2.10.1`：「天气服务接入多源回退（wttr.in / MET Norway），离线缓存兜底，横幅无内容时自动隐藏」。同步修改 `src/components/__tests__/UpdateLog.test.tsx` 期望版本号。

## 6. 验证

1. 模拟 Open-Meteo 失败（DevTools 阻断 `api.open-meteo.com`）→ 横幅仍显示天气（来自 wttr.in）。
2. 同时阻断 open-meteo 与 wttr.in → 显示 MET Norway 结果或 localStorage 缓存。
3. 全部阻断且无缓存且无倒数日 → 横幅整体不渲染（不再出现"暂无可显示的横幅内容"）。
4. WeatherDetail 页正常加载 forecast（主路径未变）。
5. `npm run test` 通过。

## 技术要点

- 所有 provider 在浏览器端调用；MET Norway 对 `User-Agent` 有要求，浏览器无法设置 UA，所以**实际可能始终失败 → 放最后并 swallow 错误**，主要靠 Open-Meteo + wttr.in。
- 不引入 API Key（保持零配置）。如后续要更稳，可考虑接入需 Key 的 OpenWeatherMap，作为后续迭代。
- localStorage key 命名：`weather_cache_v1_{cityName}`，过期阈值 24h。