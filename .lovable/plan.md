## 目标
在全站增加一个深色 / 浅色 / 跟随系统的主题切换功能，用户的选择持久保存。

## 方案

### 1. 主题管理（核心）
新增 `src/contexts/ThemeContext.tsx`：
- 提供 `theme: 'light' | 'dark' | 'system'`、`setTheme`、`resolvedTheme`
- 初始值：localStorage `theme` → 否则 `system`
- 通过给 `<html>` 加/去 `dark` class 切换（配合现有 `tailwind.config.ts` 的 `darkMode: ['class']`）
- 监听 `prefers-color-scheme` 变化，`system` 模式下自动跟随
- 在 `index.html` 头部加一段内联脚本，首屏即应用主题，避免闪烁

在 `src/App.tsx` 里用 `ThemeProvider` 包裹整个应用（放在 `AuthProvider` 外层）。

### 2. UI 切换入口
- **设置页**：新增 `src/components/settings/AppearanceSettings.tsx` 卡片，三按钮分组（浅色 / 深色 / 跟随系统），插入 `Settings.tsx` 的 `PersonalSettingsCard` 下方。
- **首页右上角**：在 `HomePage.tsx` 现有 SOS 按钮旁加一个小的太阳/月亮图标按钮，点击在 light ↔ dark 之间切换（不改变 SOS 布局结构和首页网格）。

图标使用 lucide-react 的 `Sun` / `Moon` / `Monitor`。

### 3. 颜色令牌适配
当前 `index.css` 已经有完整的 `.dark` 语义令牌（background/foreground/card/...），但大量组件用了硬编码颜色（`bg-gradient-to-br from-blue-50 to-green-50`、`text-gray-800`、`bg-white` 等），深色下会很难看。

为了最小化改动 + 视觉可用，分两步：
- **本次只做**：在 `index.css` 的 `.dark` 下追加一段"渐变背景兼容"——通过 CSS 变量 `--page-gradient` 暴露浅色/深色两套页面背景渐变；再加少量"覆盖兜底"规则（如 `.dark` 下把 `from-blue-50 to-green-50` 的渐变父容器替换映射），避免动 30+ 文件。
- **后续可选**：把页面外壳的 `bg-gradient-to-br from-blue-50 to-green-50` 统一替换为 `bg-background` 或新令牌 `bg-page`，把 `text-gray-800/600/500` 换成 `text-foreground/muted-foreground`。本计划不执行此大范围替换，只在更新日志里登记为后续任务。

具体本次会调整：
- `index.css`：新增 `--page-gradient` 浅/深两套值；新增 `.app-page-bg` 工具类使用该变量；在 `.dark` 下提高 `body`/`card` 等基础对比度。
- 顶层壳层组件（`Settings.tsx`、`PageLayout.tsx` 等若使用相同渐变）替换为 `app-page-bg` 类（仅替换页面最外层容器，不动内部业务样式）。范围约 5 个文件，挑选最常见入口页。

### 4. 持久化与同步
- 选择写入 `localStorage.theme`
- （可选，本次不做）写入 Supabase `user_preferences.theme`，跨设备同步——为避免改 DB schema，本次仅本地持久化。

### 5. 更新日志
- `src/data/updateLog.ts` 增加 `2.10.3` 条目："🌙 新增全局深色模式切换（设置页 + 首页快捷按钮）"
- 同步 `src/components/__tests__/UpdateLog.test.tsx`
- 同步 `mem://index.md` Core 区加一行：深色模式由 ThemeContext 统一管理，切换 `<html>.dark` class。

## 技术细节

```tsx
// ThemeContext 关键逻辑
const apply = (t: 'light'|'dark') => {
  document.documentElement.classList.toggle('dark', t === 'dark');
};
const resolved = theme === 'system'
  ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : theme;
```

```html
<!-- index.html 防闪烁脚本 -->
<script>
  (function(){
    var t = localStorage.getItem('theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  })();
</script>
```

## 不在本次范围
- 不批量替换 30+ 组件里的硬编码颜色（如 `text-gray-800`、`from-blue-50`）。深色下这些区域会回退到设计令牌或保持原色——本次只保证全局壳层、卡片、文本主区域可读。
- 不动 Supabase schema。
- 不修改首页网格布局（按既定约束）。

## 文件清单
新增：`src/contexts/ThemeContext.tsx`、`src/components/settings/AppearanceSettings.tsx`
修改：`src/App.tsx`、`index.html`、`src/index.css`、`src/components/Settings.tsx`、`src/components/HomePage.tsx`、`src/components/layout/PageLayout.tsx`、`src/data/updateLog.ts`、`src/components/__tests__/UpdateLog.test.tsx`、`mem://index.md`
