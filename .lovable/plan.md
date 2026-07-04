
# 下一步升级计划（已确认）

基于你的选择：邮件提醒全量、AI 周报纳入 Sprint 3、无障碍仅补 aria + 修高危对比度、SEO/图标资产与 Sprint 3 并行推进。

---

## Sprint 3 收尾（本轮聚焦）

### 1. EmptyState 全面铺开
覆盖以下页面的空数据分支：家庭日历、家庭消息、家庭提醒、家庭费用、积分商城、通知中心、教育中心、糖尿病记录、用药管理、医疗记录。统一图标 + 说明 + CTA（"去添加/打卡/商城"）。

### 2. 邮件提醒（全量，复用 Resend）
- 新增表 `user_notification_preferences`（列：`user_id`、`email_reminders_enabled`、`checkin_streak`、`medication`、`medical_followup`、`family_calendar`、`created_at`、`updated_at`），带 RLS + GRANT。
- 新增 Edge Function `send-reminder-email`：接收类型参数，走 Resend Gateway 发信，含 Zod 校验、JWT 校验、CORS。
- 新增 Edge Function `daily-reminder-scheduler`（`verify_jwt = false`，由 pg_cron 每天早 8 点北京时间触发）：扫描四类触发条件（连续 3 天未打卡、当日未完成用药提醒、24h 内复诊记录、24h 内家庭日历事件），聚合后调用 `send-reminder-email`。
- 设置里新增"通知偏好"卡片，四个开关 + 总开关。

### 3. AI 健康周报（Lovable AI Gateway）
- 新增 Edge Function `generate-weekly-report`：读取过去 7 天 `meniere_records`、`diabetes_records`、`daily_checkins`，用 `google/gemini-3-flash-preview` 生成 200 字摘要 + 3 条建议，返回 JSON（Zod 校验响应结构）。
- 新增表 `ai_weekly_reports`（`user_id`、`week_start`、`summary`、`suggestions jsonb`、`generated_at`），带 RLS + GRANT，用户只能读自己的。
- 前端：首页顶部（仅周日显示）新增可折叠 `WeeklyReportCard`，点击生成/展开；设置 → 健康管理里加"历史周报"入口。
- 免费不设付费墙。

### 4. 无障碍：aria + 高危对比度
- 补 aria-label：SOS 按钮、底部导航图标按钮、卡片右上角操作、日历翻页箭头、Games 页面图标按钮。
- 用 Playwright + axe-core 跑一次首页/设置/记录页/家庭页，仅修 WCAG AA critical/serious 对比度问题（替换硬编码 `text-gray-*` 为语义 token）。
- 一次性审计，不做 CI 常驻。

---

## Sprint 4 起步（与 Sprint 3 并行）

### 5. SEO 与站点资产
- `public/sitemap.xml` 补 `/privacy` `/terms` `/disclaimer`（已加）+ 检查 lastmod。
- `index.html` 与三个 legal 页面各自 `<title>` / `<meta description>` / `og:*` / `twitter:card`。
- 首页注入 `WebApplication` JSON-LD（含名称、描述、语言、offers=free）。

### 6. PWA 图标资产
- 生成 512×512 与 192×192 PWA 图标（`imagegen`，主题色纯色底 + 心形/胶囊简洁图标），落到 `public/icons/`。
- 生成 180×180 `apple-touch-icon.png`。
- 更新 `manifest.webmanifest` 图标路径，`index.html` 引用。

### 7. 更新日志
- 每完成一项立即写入 `src/data/updateLog.ts`，同步更新 `UpdateLog.test.tsx`。
- 版本节奏：2.13.0（邮件提醒 + 通知偏好 + EmptyState 铺开）、2.13.1（AI 周报）、2.13.2（无障碍与 SEO/图标）。

---

## 技术清单（供参考）

| 变更类型 | 项目 |
|----------|------|
| 新表 | `user_notification_preferences`、`ai_weekly_reports` |
| 新 Edge Function | `send-reminder-email`、`daily-reminder-scheduler`、`generate-weekly-report` |
| Cron | pg_cron 每天 08:00 CST → `daily-reminder-scheduler` |
| 新前端组件 | `NotificationPreferences`、`WeeklyReportCard`、`WeeklyReportHistory`、批量 EmptyState 接入 |
| 新资源 | `public/icons/icon-192.png`、`icon-512.png`、`apple-touch-icon.png` |
| 依赖 | 无新增 npm；axe 通过 Playwright 一次性脚本使用，不入包 |

准备好后进入 build 模式按序落地。
