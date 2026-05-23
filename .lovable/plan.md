# 全站响应式审查与优化计划

## 一、现状诊断

通过对全站布局类的统计，主要问题如下：

1. **几乎所有页面写死 `max-w-md`（约 30+ 文件）**
   - `HomePage`、`PageLayout`、`Settings`、`AuthPage`、`ResetPassword`、所有记录类页面、`DailyDataHub`、`MyPurchases`、`UserManual`、`UpdateLog`、`Games` 等。
   - 后果：在平板 / 桌面（≥768px）时内容被锁死在约 448px 宽，两侧大片留白，体验非常"手机壳"。

2. **断点几乎未使用**
   - 全项目 `md:` / `lg:` / `xl:` 使用极少（仅 `AdminPanel`、`Games`、`FamilyDashboard` 等少数处）。
   - `FunctionCards` 永远 2 列；`Games` 列表桌面也只 2 列；管理后台表格未做横向滚动保护。

3. **固定像素 / 不可伸缩组件**
   - `HomeBanner`、`WeatherAlertBanner` 受 `max-w-md` 限制，但内部使用了固定像素高度。
   - 部分游戏（`BomberPopGame`、`TetrisGame`、`Game2048`、`MultiplayerGomoku`）画布大小固定，未根据视口缩放。
   - `BeijingClock`、`UserWelcomeWithClock` 在窄屏可能换行错位（需复核）。

4. **横向滚动与触控目标**
   - 管理面板的 `TabsList grid-cols-8` 在 <500px 会挤压；
   - `CalendarHeader` 按钮组在 320px 可能溢出；
   - 部分按钮 `size="sm"` 在移动端点击区域 <44px。

5. **图片与媒体**
   - 大多数 `<img>` 未带 `max-w-full h-auto`，依赖外层裁剪；
   - 暂未发现 `srcSet` / `sizes`，但当前业务图片极少，影响有限。

6. **横屏 / 安全区**
   - 没有 `env(safe-area-inset-*)` 处理（iPhone 刘海/底部 Home 条）；
   - 没有 `landscape:` 适配（横屏时纵向空间不足）。

## 二、优化目标

- **手机（<640px）**：保持现有体验，零回归。
- **平板（≥768px）**：内容区扩到 `max-w-3xl`，关键栅格升级为 2~3 列。
- **桌面（≥1024px）**：内容区 `max-w-5xl`，首页功能卡 3~4 列，管理后台善用宽屏。
- **iOS 安全区**：顶/底部留出 `env(safe-area-inset-*)`。
- **不破坏现有视觉**：移动端 UI 保持一致，仅向上扩展。

## 三、实施方案

### Step 1 — 引入统一响应式容器
新建 `src/components/layout/ResponsiveContainer.tsx`：

```tsx
// 取代散落各处的 max-w-md
<div className="mx-auto w-full px-4 max-w-md md:max-w-3xl lg:max-w-5xl">
```

- 提供 `size` 变体：`narrow`（默认 md/2xl/3xl）、`wide`（md/3xl/5xl）、`full`。
- 改造 `PageLayout` 内部使用此容器，所有 `PageLayout` 子页面自动获益。

### Step 2 — 改造首页与核心入口
- `HomePage`：外层容器升级；功能卡区域 `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`。
- `FunctionCards`：保持单卡视觉不变，只调整父级 grid。
- `UserWelcomeWithClock`：在 ≥md 时分两列（左欢迎语 + 右时钟/SOS）。
- `HomeBanner` / `WeatherAlertBanner`：宽度跟随容器；轮播图最大高度按断点提升。

### Step 3 — 列表/数据型页面升级
- `Games`：`md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`。
- `MyPurchases`、`UpdateLog`、`UserManual`、`EducationCenter` 等长列表：≥md 切换为两列卡片，长文页保持单列但 `max-w-3xl`。
- `FamilyDashboard` 已部分响应式，统一到新容器。

### Step 4 — 管理后台
- `AdminPanel` TabsList 在 <md 改为可横向滚动；
- 表格统一包 `overflow-x-auto`；
- `EnhancedUserDetailView` 在桌面用 2 列布局。

### Step 5 — 游戏画布
- 抽出工具 `useResponsiveCanvasSize(maxWidth)`：监听 `ResizeObserver`，按容器宽度计算 cell/board 尺寸。
- 改造 `BomberPopGame`、`Game2048`、`TetrisGame`、`MultiplayerGomoku`、`SnakeGame`、`Gomoku`、`BubblePopGame`、`MemoryCardGame` 使其画布在 320–960px 区间平滑缩放，桌面不再"小手机框"。

### Step 6 — 全局基础设施
- `index.css`：
  - `body { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }`（或封装到根容器）。
  - 新增 `.touch-target { @apply min-h-[44px] min-w-[44px]; }` 工具类，针对小图标按钮统一应用。
- `tailwind.config.ts`：补 `screens.xs: '420px'` 便于细分窄屏。

### Step 7 — 横屏适配
- `EmergencyMode`、`BreathingExercise`、所有游戏页：使用 `landscape:` 调整布局（横屏下两列：左控件/右主区）。

### Step 8 — 验证
- 在 320 / 375 / 414 / 768 / 1024 / 1440 六档使用 `browser--set_viewport_size` 截图巡检关键页（Home / Settings / RecordHub / AdminPanel / Games / 游戏内）。
- 跑 `bunx vitest run` 确认无回归。
- 控制台无溢出/裁剪警告。

### Step 9 — 同步更新日志
- `src/data/updateLog.ts` 增加 `2.10.2` 条目（类型：改进）：「全站响应式优化：引入 ResponsiveContainer，平板/桌面布局升级，游戏画布自适应，补充 iOS 安全区」。
- 更新 `UpdateLog.test.tsx` 期望版本。
- 更新 `mem://index.md`（在 Core 中加入"使用 ResponsiveContainer 替代裸 max-w-md"约束）。

## 四、技术要点（开发者向）

- 不直接全局替换 `max-w-md`；改 `PageLayout`、`HomePage` 即可覆盖 80% 页面，剩余少数自定义页（`AuthPage`、`ResetPassword`、游戏顶层）单独迁移。
- 容器宽度建议梯度：`max-w-md` (448) → `md:max-w-3xl` (768) → `lg:max-w-5xl` (1024)。`wide` 变体用于管理后台和数据中心。
- 游戏画布缩放：保持逻辑网格不变，只改像素 `cellSize`，避免触碰玩法逻辑。
- 测试集中在视觉层；不修改任何业务逻辑、数据库、Edge Function。

## 五、范围与不做的事

- 不调整配色 / 字体 / 设计 token。
- 不重构组件 API；只动布局类与少数容器结构。
- 不动 Supabase / RLS / Edge Function。
- 不引入新的 UI 库；继续 Tailwind + 现有 shadcn 组件。
