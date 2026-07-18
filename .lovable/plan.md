## 背景

自上一次更新日志记录（`2.14.0` MCP 接入）之后，通过 GitHub 直接提交了 19 次，涉及安全修复、架构重构、无障碍、性能与工程化，但更新日志一直没有跟上。本轮的目标：

1. 汇总所有 `2.14.0` 之后的 GitHub 改动。
2. 二次检查（构建/测试/关键代码走查）确认没有回归。
3. 追加一条集中的 `2.15.0` 更新日志条目并同步测试。

## 近期 GitHub 提交分组一览

**A. 高危缺陷与安全修复**
- `bb889ad` 修复 16 处高危遗留缺陷：紧急模式、EmergencySMS、admin 用户管理、联系人服务、日历数据、语音录制、呼吸练习、俄罗斯方块等。
- `79552b6` 修复积分 RPC，加固邮件与周报 Edge Function。
- `ff4d356` 处理跨模块 review 发现的问题（HistoryView / RecordDetail / WeeklyReportCard / FamilyMemberForm 等）。

**B. 数据层重构（TanStack Query 全面接入）**
- `4735c7d` 剩余 admin、家庭、公告、汇率、体检、个人资料等迁到 TanStack Query，配套新增服务层（`adminUserDetailService` / `announcementsService` / `educationService` / `feedbackService` / `profileService` 等）。
- `ec7fc5c` 教育中心、我的订单、用药管理迁到 TanStack Query。
- `4b67a6a` 鉴权错误处理、数据层、北京时间统一，补充服务/工具单测。

**C. 架构与工程化**
- `33c8957` 去除死代码，精简 shadcn ui 未使用组件，启用严格 TS，大幅缩减打包体积（约 -10k 行）。
- `5e2ffb6` URL 驱动的伪路由 + 页面注册表，改善浏览器前进后退体验。
- `95f60ae` HistoryView 分页；提醒调度器批量发送；Gomoku 纯函数抽离并加测试。
- `c57cde5` BomberPop AI 与炸弹逻辑抽成纯模块，覆盖新单测。
- `424c6fa` 抽取共享 `useHighScore` hook，lint 错误归零。
- `6e8c171` 修正呼吸练习阶段计时、若干游戏闭包陈旧值问题。
- `9385b18` typecheck 脚本改为真正执行 `tsc -b`。
- `6f18dfb` 修复测试套件、加 GitHub Actions CI、生产剥离 console、修 lint。
- `68bc95f` `bc71ac4` `7bef9b1` 迁移标记、eslint 忽略 `.claude`、本地 npm 环境等杂项。

**D. 用户体验与无障碍**
- `edb41a3` 老年友好 & 可访问性大改：57 个文件补齐 aria、焦点态、放大触控热区、放大字号影响、公告/首页/表单/记录页可访问性提升。

**E. 未完工**
- `3616809` "Work in progress"：只更新了 `bun.lock` 与 `supabase/functions/mcp/index.ts`（MCP 打包产物同步）。属于中间态提交，无需单独列入用户可见的更新日志。

## 二次检查

- **构建/类型检查**：本地跑 `bun run build` 与 `bunx tsgo`，确认严格 TS 打开后没有残留错误。
- **测试**：`bunx vitest run` 全量执行，重点关注 `bomberPop`、`gomoku`、`breathing`、`useHighScore`、以及新迁 TanStack Query 的服务单测是否绿。
- **关键路径走查**（读代码即可，不动业务）：
  1. `BreathingExercise`：确认阶段计时按 `breathing.ts` 的纯函数计算，无闭包旧值。
  2. `HistoryView` 分页：状态更新是否正确清空、切换筛选是否重置游标。
  3. `daily-reminder-scheduler`：批量发送逻辑是否仍满足"24h 内至多一封"约束，`config.toml` 的 `verify_jwt` 未被改动。
  4. `EmergencySMS` / `contactsService` 修复后，紧急短信仍能读取联系人并回退到剪贴板。
  5. `useAuth` 错误分支与 `useCalendarData` 的 TanStack Query 化不破坏首页流。
- **回归安全项**：不重复触发已在 memory 里记录过的问题（RLS、Zod 校验、SOS 按钮位置、YYYYMMDD 日期选择器、`ResponsiveContainer` 断点）。

## 待修改文件

1. `src/data/updateLog.ts`
   - 在数组头部新增 `2.15.0`（日期 `2026-07-18`）条目，按四个分组（安全修复 / 数据层重构 / 架构工程化 / 老年友好与无障碍）各 1 条摘要 item，避免陈列式罗列 19 条提交。
2. `src/components/__tests__/UpdateLog.test.tsx`
   - `latest version is 2.14.0` 断言改为 `2.15.0` 与 "综合升级"/合适的 type 名称。

## 实施步骤

1. 跑 `bun run build` + `bunx vitest run` 采集当前基线。
2. 走查上述关键文件，如发现真实回归，先在计划外单独反馈，不与日志同步耦合。
3. 编辑 `src/data/updateLog.ts` 追加 `2.15.0` 条目。
4. 更新 `UpdateLog.test.tsx` 版本断言。
5. 再次 `bunx vitest run` 确认全绿。
6. 简短告知用户完成，附本轮共记录的 4 组要点。

## 备注（技术）

- 不改动业务逻辑与 UI，只做：审阅 + 更新日志文案 + 单测断言对齐。
- 若 `vitest`/`build` 报出 pre-existing failure，会在回复中单独列出而不是隐匿或强行修复，交由用户决定是否进入下一轮。
