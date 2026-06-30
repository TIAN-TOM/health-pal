
# 距离可商业化落地 App 的差距与下一阶段完善计划

当前“健康生活伴侣”已具备较完整的健康记录、家庭协作、积分商城、教育中心、小游戏等模块，工程层面也具备 Supabase RLS、Zod 校验、服务端积分等基础。但要作为面向 C 端正式商用的健康类产品发布，仍存在以下差距。

## 一、合规与法律（最高优先级，未达成无法上架）

1. **医疗免责与资质声明缺失**
   - 健康/血糖/用药类应用在中国大陆属"医疗器械软件/互联网健康服务"敏感品类，需要明确写明"非医疗器械、不替代专业诊断"。
   - 计划：新增 `/disclaimer` 页面 + 首次启动强制确认弹窗 + 注册时勾选条款。
2. **隐私政策 / 用户协议 / 儿童保护条款** 当前缺失。
   - 计划：新增 `/privacy`、`/terms`、`/children` 三个独立路由页面，footer 与注册页链接接入；记录用户同意时间戳到 `user_agreements` 表。
3. **个人信息保护合规（GDPR/《个人信息保护法》）**
   - 数据导出（已有）✅；缺：账号注销、数据删除请求、敏感数据访问日志、同意撤回。
   - 计划：Settings 增加"注销账号"流程（Edge Function 软删 + 30 天硬删），新增 `data_access_logs` 表。
4. **第三方数据来源标注**：Open-Meteo、汇率等需在关于页注明。

## 二、稳定性与质量

1. **测试覆盖严重不足**：仅 `UpdateLog.test.tsx`、`Games.test.tsx`、`bomberPop.test.ts` 三个测试。
   - 计划：为核心服务（`pointsService`、`meniereRecordService`、`dailyCheckinService`、`makeupCheckinService`）补 Vitest 单测；为关键流程（登录、打卡、记录提交、积分消费）补 Playwright E2E。
2. **错误监控缺失**：无 Sentry / 类似上报。
   - 计划：接入 Sentry（或自建 Edge Function 上报），分前端错误、Edge Function 错误两条管道。
3. **性能与可观测性**：未做 Lighthouse、首屏指标监控；图片未统一 lazy/WebP。
   - 计划：引入 `@vite-pwa` 之前先做一次 Lighthouse 体检；统一图片压缩 & `loading="lazy"`。
4. **离线与弱网体验**：已是 SPA 但无 PWA / 离线读缓存。
   - 计划：按 PWA Skill 实施"可安装 + 关键页面 NetworkFirst"，覆盖弱网就诊场景。

## 三、安全

1. 运行最新 `security--run_security_scan`，处理所有 critical / high。
2. 审计 RLS：尤其家庭模块（`family_*` 表）跨成员可见性、`user_item_inventory`、`points_transactions` 写权限。
3. 速率限制：登录、积分相关 RPC、Edge Function 需加 IP/用户级 rate limit（Supabase Edge + Upstash 或内置）。
4. Edge Function 输入用 Zod 校验，统一 CORS 白名单。

## 四、产品体验缺口

1. **新手引导（Onboarding）** 缺失：首次登录直接进首页，没有功能导览/初始化向导（家庭、紧急联系人、基础病史）。
2. **空状态设计**：多个模块（记录列表、家庭日历、商城）首次进入是空白，需统一空状态插画 + CTA。
3. **通知体系**：仅站内通知，无邮件/微信/短信触达；提醒（吃药、就诊）依赖用户主动打开。
   - 计划：Web Push（PWA 后接 FCM）+ 邮件提醒（Resend 已接入 admin，可复用）。
4. **国际化**：已有 `LanguageContext` 但实际多处中文硬编码。需要决定是否上英文版（影响出海/App Store 审核）。
5. **无障碍**：缺 `aria-*` 系统化覆盖、对比度审计；老年用户字号开关已有但未全局生效。

## 五、商业化基础

1. **付费模型未定**：当前积分体系是内循环（签到换补签卡）。商业化需选型：
   - 订阅（家庭高级版：多成员、AI 健康报告、导出 PDF）→ Stripe/Paddle。
   - 增值道具购买（积分包）→ 同上。
   - 计划：先与用户确认商业模式，再调用 `payments--recommend_payment_provider`。
2. **数据/AI 价值化**：可基于已有记录提供"AI 健康摘要"、"每周报告"。Lovable AI Gateway 已可直接接入。
3. **分析埋点**：缺 PostHog/GA。需要留存、转化、付费漏斗数据才能迭代商业化。
4. **运营后台**：`AdminPanel` 已有，但缺少营收、订阅、退款、内容审核流。

## 六、发布与渠道

1. **Web 发布**：已有 `health-pal.lovable.app`，建议绑定自有域名 + 完整 SEO（`llms.txt` 已有，缺 sitemap 中各路由、OG image、结构化数据 JSON-LD）。
2. **移动端**：健康类强烈建议 Capacitor 打包到 App Store / Google Play / 国内安卓商店（国内上架需 ICP + 软著 + 卫健委备案，工作量很大，需要单独评估）。
3. **客服与反馈闭环**：已有 `UserFeedback`，缺工单状态、回复通知给用户。

---

## 下一阶段实施路线（建议分 4 个 Sprint，每个约 1-2 周）

### Sprint 1：合规与上架前置（必须）
- 隐私政策 / 用户协议 / 医疗免责页面 + 注册同意 + 首次弹窗
- 账号注销 & 数据删除 Edge Function
- 运行安全扫描并修复所有 high/critical
- 接入 Sentry 错误监控

### Sprint 2：质量与可观测
- 核心服务单测 + 关键流程 E2E
- 埋点（PostHog 推荐）
- Lighthouse 优化（图片、字体、路由懒加载复核）
- PWA 可安装 + 关键页 NetworkFirst（不做激进离线）

### Sprint 3：体验与留存
- Onboarding 引导 + 统一空状态
- Web Push / 邮件提醒（吃药、复诊、打卡断签提醒）
- AI 健康周报（Lovable AI Gateway，付费墙占位）
- 无障碍与字号全局生效审计

### Sprint 4：商业化与发布
- 与用户确认订阅/增值模型 → 接入 Stripe 或 Paddle
- 自有域名 + SEO（sitemap、OG、JSON-LD）
- Capacitor 打包评估 + 应用商店素材
- 后台增加营收/订阅看板

---

## 我需要您确认的几点

1. 商业化形态偏向：**家庭订阅会员**、**一次性高级功能解锁**、还是**积分包内购**？
2. 目标市场：**仅中国大陆**、**仅海外**、还是**两者都要**？（决定合规 + i18n 工作量）
3. 是否计划上**移动应用商店**（影响是否现在就上 Capacitor / 软著备案）？
4. 是否同意将 **Sprint 1（合规上架前置）** 作为下一步立即开工的内容？

确认后我会按你选定的范围进入 build 模式逐项落地，并同步写入 `updateLog`。
