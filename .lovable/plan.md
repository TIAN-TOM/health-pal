
## 横幅悬浮显示手动切换箭头

为首页 `HomeBanner` 增加鼠标悬浮时浮现的左右箭头，支持手动切换天气 / 倒数日幻灯片，且不破坏原有的 5 秒自动轮播。

### 视觉与交互

```text
        hover ↓
┌─────────────────────────────────────────────────────────┐
│ ‹  ☁ 悉尼 17° 多云  💧67%  🌬6.5m/s              ›    │
└─────────────────────────────────────────────────────────┘
   ↑ 半透明圆形按钮            手动点击 → 切换并重置自动播放计时
```

- **默认状态**：箭头隐藏（`opacity-0`），保持现有简洁观感
- **悬浮状态**：左右两个 24×24 圆形按钮淡入（`opacity-100`，150ms 过渡）
- **位置**：左右边缘内 8px，垂直居中，叠在内容之上（`absolute z-10`）
- **样式**：半透明黑底 + 白色 chevron（`bg-background/70 backdrop-blur-sm hover:bg-background/90`），符合现有暗色主题
- **可访问性**：`aria-label="上一张/下一张"`，键盘 Tab 可聚焦
- **触屏**：移动端不显示箭头（`hidden md:flex`），保留滑动手势

### 行为细节

- 仅当 `slides.length > 1` 时渲染箭头
- 点击箭头调用 embla `api.scrollPrev() / scrollNext()`
- 自动播放配置加 `stopOnMouseEnter: true` + `stopOnInteraction: false`：鼠标移入暂停，移出后恢复 5s 轮播；点击箭头不会永久停掉自动播放
- 不复用 `CarouselPrevious/Next`（默认样式带边框且定位在容器外 `-left-12`），改为内联自定义按钮放在轮播容器内

### 技术实现

**单文件改动：`src/components/HomeBanner.tsx`**

1. 在外层 wrapper 加 `group relative` 类
2. Autoplay 插件参数补充：
   ```ts
   Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
   ```
3. 在 `<Carousel>` 内、`<CarouselContent>` 旁新增两个绝对定位按钮：
   ```tsx
   {slides.length > 1 && (
     <>
       <button
         onClick={() => api?.scrollPrev()}
         className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center"
         aria-label="上一张"
       >
         <ChevronLeft className="h-4 w-4" />
       </button>
       {/* 右箭头同理，使用 ChevronRight + scrollNext */}
     </>
   )}
   ```
4. 通过 `setApi` 已暴露的 `api` 引用调用 prev/next（组件已有 `setApi` 逻辑用于圆点指示器）

### 更新日志

按项目规范在 `src/data/updateLog.ts` 顶部新增 `2.9.15` 条目：「首页横幅支持鼠标悬浮显示手动切换箭头」，并同步更新 `src/components/__tests__/UpdateLog.test.tsx` 期望版本号。

### 验证步骤

1. 桌面端打开首页，鼠标悬浮横幅 → 左右箭头淡入，移开 → 淡出
2. 点击箭头 → 立即切换幻灯片，圆点同步高亮
3. 鼠标停在横幅上 → 自动轮播暂停；移开 1–5 秒后恢复
4. 移动端（<768px）→ 不显示箭头，滑动手势仍可用
5. 仅 1 张幻灯片时（无倒数日）→ 箭头不渲染
6. `npm run test` 全部通过
