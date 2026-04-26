
## Q版泡泡堂 ×《Bomb It 4》系统化复刻方案

> 对标参考：FreeOnlineGames 的 Bomb It 4，目标在现有像素美术 + 网格回合架构基础上，做到玩法骨架的 1:1 复刻，画风继续沿用本项目原创 Q 版像素风（避免侵权）。

---

### 一、现状摘要（已具备）
- 11×13 网格、tick 100ms 主循环、border + 偶数格固定墙
- 玩家移动 / 放炸弹 / 链式爆炸 / 踢炸弹 / 危险格 AI
- 4 种道具：bomb+1、range+1、kick、speed+1
- 3 档敌人智能（随机 / 躲避 / 追击）
- 关卡递增（敌人数、智能、密度、时限），通关保留能力 + 真实积分奖励

### 二、与 Bomb It 4 的差距 → 本次要补齐的功能模块

| 模块 | 现状 | 目标（参考 Bomb It 4） |
|---|---|---|
| 角色 | 1 种（兔子） | 4 种可选角色，每个有独特被动 |
| 道具 | 4 种 | 9 种（新增 5 种） |
| 关卡主题 | 1 种（草地） | 4 种主题 + 主题专属机关 |
| 特殊砖块 | 仅普通箱子 | 新增传送门、陷阱坑、单向传送带 |
| 游戏模式 | 仅街机闯关 | 街机 / 竞技（vs CPU）/ 生存 三模式 |
| 敌人 | 3 种智能等级 | 5 种敌人变种 + 每 5 关 Boss |
| UI/反馈 | HUD + Toast | 角色选择页 + 模式选择页 + 关卡过场 + 飘字反馈 |
| 音效 | 5 种音色 | 9 种音色，区分道具/受伤/胜利 |

---

### 三、详细设计规格

#### 1) 角色系统（新增）
4 个可选角色，每个自带 **1 项被动能力 + 1 套像素皮肤色板**（复用 `PixelPlayer`，仅改主色 + 配饰）：

| 角色 | 像素特征 | 被动 |
|---|---|---|
| 🐰 兔奇（默认） | 白底粉腮 | 初始 +1 速度等级 |
| 🐱 猫蛋 | 橘黄色 + 黑条纹 | 初始 +1 炸弹数 |
| 🐻 熊大 | 棕色 + 圆耳 | 多承受 1 次伤害（HP=2） |
| 🦊 狐狸阿凯 | 红色 + 长尾 | 初始 +1 爆炸范围 |

实现要点：
- 新增 `src/components/games/bomberPop/characters.ts` 导出 `CHARACTERS: CharacterMeta[]`
- `PixelPlayer` 增加 `variant` prop，按角色返回不同色板
- 开始页加角色选择九宫格，选择后存到 `localStorage('bomber-pop-character')`

#### 2) 道具系统扩展（4 → 9）
新增 5 种道具，沿用 `PowerUpType` 联合类型扩展：

| 类型 | 图标 | 效果 |
|---|---|---|
| `pierce` | ⚡️穿透火焰 | 爆炸不再被箱子阻挡，可贯穿一格 |
| `remote` | 📱遥控器 | 炸弹改为手动引爆（再次按空格触发最早一颗） |
| `shield` | 🛡️护盾 | 一次性免疫爆炸/敌人碰撞 |
| `life` | ❤️生命 | HP +1（上限 3） |
| `freeze` | ❄️冻结 | 5 秒内全场敌人停止移动 |

实现要点：
- `types.ts` 扩展 `PowerUpType` + 在 `POWER_UP_LABEL` 加映射
- `BomberPopGame` 新增状态 `hp`、`hasShield`、`isRemote`、`freezeTicks`
- `mapGenerator.ts` 高关卡稀有度更高（pierce/freeze 仅 ≥3 关出现）

#### 3) 关卡主题与特殊砖块
4 种主题循环（每 3 关换主题），主题决定 `PixelTile` 的 grass 配色 + 引入对应机关：

| 主题 | 配色 | 专属机关 |
|---|---|---|
| 🌿 森林（1–3 关） | 绿 #a7f3d0 | 无机关，纯入门 |
| 🏖️ 沙滩（4–6 关） | 沙黄 #fde68a | **流沙格**：踩上后下一步必须沿同方向滑动 |
| ❄️ 冰原（7–9 关） | 浅蓝 #bae6fd | **冰面**：玩家/敌人移动惯性 +1 格 |
| 🔥 火山（10+ 关） | 暗红 #fecaca | **熔岩喷口**：每 8 秒随机一格喷火 1 格 |

实现要点：
- `levelConfig.ts` 增加 `theme: 'forest' | 'beach' | 'ice' | 'volcano'`
- `mapGenerator.ts` 按主题生成额外 `specialCells: { x, y, kind }[]`
- `PixelTile` 新增 kind: `sand | ice | lava-vent`
- 主循环中根据 specialCells 触发滑动 / 惯性 / 喷火逻辑

#### 4) 游戏模式（核心扩展）
开始页改为模式选择 → 角色选择 → 进入：

**A. 街机模式 Arcade**（现有强化版）
- 共 15 关，每 5 关一个 Boss
- 新 Boss 类型：`mega-enemy`（HP=3，体积 1×1 但需要被爆炸命中 3 次）

**B. 竞技模式 Battle**
- 1 张固定中等地图，玩家 vs 3 个 CPU
- 无敌人种类区别，所有人按 Bomberman 规则放炸弹互炸
- 最后存活者胜，3 局 2 胜；不计积分，仅刷新 `localStorage('bomber-pop-battle-wins')`

**C. 生存模式 Survival**
- 单张固定地图，敌人每 30 秒刷新一波（每波 +1 智能等级）
- 计存活时间，超过历史最佳记录给积分奖励（封顶 30）

实现要点：
- 抽出 `useBomberCore(mode, character)` 自定义 Hook 集中状态机
- `BomberPopGame.tsx` 仅负责渲染 + 路由模式
- `MODE_CONFIGS` 常量定义每模式的胜负条件 / 关卡序列 / 积分规则

#### 5) 敌人扩展
现有 3 智能等级保留，新增 2 种敌人变种：

| 变种 | 行为 |
|---|---|
| 💨 速度敌人 | 移动间隔 -50%，但不躲炸弹 |
| 🧱 坦克敌人 | HP=2，移动慢 |

`Enemy` 接口扩展 `kind: 'normal' | 'fast' | 'tank' | 'boss'` + `hp`，命中后 hp-1，hp=0 才死亡。

#### 6) UI 与交互
- **开始页重构**：3 步流程 = 模式 → 角色 → Go，每步用 Card 大按钮，带角色立绘 + 被动说明
- **HUD 增强**：左上角加 ❤️×N（HP 心形），冻结剩余秒数实时倒计时，遥控器图标常驻
- **关卡过场**：通关后弹出 1.5 秒过场卡 "STAGE 2 — BEACH 🏖️" 再切换主题
- **飘字反馈**：吃道具 / 击杀敌人时，在角色头顶冒出 +30 / +100 数字（CSS animate-fade-in 上移消失）
- **Boss 战提示**：Boss 出场前棋盘红光闪烁 + "BOSS!" 标题动画

#### 7) 操作控制（保持兼容）
- 桌面：方向键/WASD + 空格放炸弹；新增 **R 键** = 遥控引爆（仅持有 remote 时有效），**Q 键** = 使用冻结道具
- 移动端：原十字键 + 红色炸弹键不变；新增第二个圆形按钮：当持遥控器/冻结时显示对应图标，否则隐藏

#### 8) 音效系统增强
`sound.ts` 扩展 `playSound` 调用预设：
```ts
SFX = {
  step: [220, 0.05, 'square'],
  bomb_place: [180, 0.1, 'square'],
  explode: [80, 0.4, 'sawtooth'],
  pickup: [660, 0.18, 'sine'],
  hurt: [120, 0.5, 'triangle'],
  win: [880, 0.5, 'sine'],
  lose: [80, 0.6, 'sawtooth'],
  freeze: [440, 0.3, 'sine'],
  boss: [200, 0.6, 'sawtooth'],
}
```
所有 sfx 调用改用枚举 key，集中管理。

---

### 四、文件改动清单

**新增**
- `src/components/games/bomberPop/characters.ts`（角色元数据）
- `src/components/games/bomberPop/modes.ts`（模式配置）
- `src/components/games/bomberPop/specialCells.ts`（流沙/冰面/熔岩逻辑）
- `src/components/games/bomberPop/StartScreen.tsx`（3 步开始页：模式→角色）
- `src/components/games/bomberPop/Hud.tsx`（独立 HUD 组件，含 HP / 冻结倒计时）
- `src/components/games/bomberPop/FloatingText.tsx`（飘字反馈）

**修改**
- `src/components/games/bomberPop/types.ts`（扩展 PowerUpType / Enemy.kind / LevelConfig.theme）
- `src/components/games/bomberPop/levelConfig.ts`（按 mode + level 输出主题与 Boss 标记）
- `src/components/games/bomberPop/mapGenerator.ts`（输出 specialCells，竞技/生存模式固定地图）
- `src/components/games/bomberPop/sound.ts`（SFX 预设表）
- `src/components/games/bomberPop/PixelArt.tsx`（主题色板、角色变体、Boss 像素图）
- `src/components/games/BomberPopGame.tsx`（拆分为模式状态机 + 渲染）
- `src/components/games/__tests__/bomberPop.test.ts`（覆盖：角色被动初始能力、新道具效果、主题切换、Boss HP 衰减）
- `src/data/updateLog.ts`（新增 `2.10.0` 大版本：泡泡堂 Bomb It 4 风格扩展）
- `src/components/__tests__/UpdateLog.test.tsx`（同步版本号期望）

**保留不动**
- `registry.tsx`（id 仍为 `bomber-pop`）
- `Games.tsx`、`GameStrategyTooltip`（仅 strategy 文案在 registry 内更新）

---

### 五、实现里程碑（建议按顺序提交）

1. **类型与基础数据层**：types / characters / modes / sound 预设表
2. **生成器与主题**：levelConfig + mapGenerator + specialCells + PixelArt 主题色
3. **核心循环重构**：拆 useBomberCore Hook、HP 与新道具状态接入
4. **UI 三件套**：StartScreen（模式→角色）+ Hud（HP/冻结）+ FloatingText
5. **三种模式落地**：街机 Boss / 竞技 CPU / 生存波次
6. **测试 + 更新日志 + Strategy 文案**

---

### 六、验证步骤
1. 开始页可选模式 → 选角色 → 进入；返回键回到模式选择
2. 街机第 5 关出现 Boss，需被爆炸命中 3 次才死亡
3. 沙滩主题踩上沙地后强制滑动 1 格；冰原主题滑动 +1 格
4. 拾取 ❄️ 道具后敌人停止 5 秒、HUD 显示倒计时
5. 拾取 🛡️ 后被爆炸命中只扣盾不死亡
6. 遥控器模式下空格仅放炸弹，按 R 引爆最早一颗
7. 竞技 3 CPU 模式可玩 3 局 2 胜
8. 生存模式每 30 秒刷新一波，HUD 显示存活时间
9. `npm run test` 全部通过，TypeScript 无报错
10. 移动端 375px 全功能可玩，按钮不溢出

### 七、版权与原创声明
- 所有像素美术继续由 SVG `<rect>` 自绘，不引用 Bomb It 4 任何素材
- 仅借鉴玩法骨架（角色被动 / 模式 / 道具），具体数值与命名为本项目原创
- 角色名（兔奇/猫蛋/熊大/狐狸阿凯）为原创，与原作角色无关
