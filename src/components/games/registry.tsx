import { lazy } from 'react';
import { buildGameMeta, type GameMeta } from './types';

// 所有游戏组件懒加载，避免一次性把 7000+ 行游戏代码打入主包
const EnhancedFlappyBird = lazy(() => import('@/components/games/EnhancedFlappyBird'));
const EnhancedGomoku = lazy(() => import('@/components/games/EnhancedGomoku'));
const BreakoutGame = lazy(() => import('@/components/games/BreakoutGame'));
const MemoryCardGame = lazy(() => import('@/components/games/MemoryCardGame'));
const SnakeGame = lazy(() => import('@/components/games/SnakeGame'));
const Game2048 = lazy(() => import('@/components/games/Game2048'));
const BubblePopGame = lazy(() => import('@/components/games/BubblePopGame'));
const MultiplayerGomoku = lazy(() => import('@/components/games/MultiplayerGomoku'));
const TetrisGame = lazy(() => import('@/components/games/TetrisGame'));
const BomberPopGame = lazy(() => import('@/components/games/BomberPopGame'));

export const GAMES: GameMeta[] = [
  buildGameMeta({
    id: 'memory-cards',
    name: '记忆翻牌',
    description: '挑战你的记忆力，找到相同的卡片配对',
    icon: '🧠',
    component: MemoryCardGame,
    strategy: {
      heading: '🧠 记忆力挑战游戏',
      bullets: [
        '翻开两张卡片，寻找相同图案配对',
        '记住卡片位置，减少翻牌次数',
        '全部配对完成即获胜',
      ],
      highlight: '💡 提升记忆力和专注力的好帮手',
    },
  }),
  buildGameMeta({
    id: 'flappy-bird',
    name: '小鸟会飞',
    description: '经典的飞鸟游戏，收集道具，体验特殊效果',
    icon: '🐦',
    component: EnhancedFlappyBird,
    strategy: {
      heading: '🐦 增强版飞鸟冒险',
      bullets: [
        '点击屏幕控制小鸟上升，松开下降',
        '穿越绿色管道，避免碰撞',
        '收集特殊道具：护盾、双倍得分等',
        '击败怪物获得额外奖励',
      ],
      highlight: '🎯 挑战反应速度和手眼协调',
    },
  }),
  buildGameMeta({
    id: 'gomoku',
    name: '五子棋',
    description: '与智能电脑对战五子棋，可调节难度等级',
    icon: '⚫',
    component: EnhancedGomoku,
    strategy: {
      heading: '⚫ 智能五子棋对战',
      bullets: [
        '轮流下棋，率先连成五子获胜',
        '支持简单、中等、困难三种难度',
        '可撤销上一步操作',
        'AI智能分析，提供策略挑战',
      ],
      highlight: '🧠 锻炼逻辑思维和策略规划',
    },
  }),
  buildGameMeta({
    id: 'multiplayer-gomoku',
    name: '多人五子棋',
    description: '在线实时对战，邀请好友一起下棋',
    icon: '👥',
    component: MultiplayerGomoku,
    strategy: {
      heading: '👥 在线五子棋对战',
      bullets: [
        '创建或加入游戏房间',
        '实时与其他玩家对战',
        '观战模式，学习高手对局',
        '聊天功能，交流心得',
      ],
      highlight: '🌐 体验真实的线上竞技乐趣',
    },
  }),
  buildGameMeta({
    id: 'breakout',
    name: '打砖块',
    description: '控制挡板弹球击碎彩色砖块，关卡不断升级',
    icon: '🧱',
    component: BreakoutGame,
    strategy: {
      heading: '🧱 经典打砖块重制',
      bullets: [
        '移动挡板反弹球击碎砖块',
        '不同颜色砖块有不同分值',
        '多关卡设计，难度递增',
        '特殊道具：多球、加长挡板等',
      ],
      highlight: '🎯 考验反应速度和预判能力',
    },
  }),
  buildGameMeta({
    id: 'snake',
    name: '贪吃蛇',
    description: '经典贪吃蛇游戏，吃食物长大，避免撞墙',
    icon: '🐍',
    component: SnakeGame,
    strategy: {
      heading: '🐍 超级贪吃蛇冒险',
      bullets: [
        '方向键控制蛇的移动方向',
        '普通食物：红色苹果+10分',
        '特殊食物：金色+50分，速度调节等',
        '神奇道具：无敌模式、慢动作、双倍得分',
        '动态障碍物增加挑战性',
      ],
      highlight: '🏆 挑战高分记录，成为蛇王！',
    },
  }),
  buildGameMeta({
    id: '2048',
    name: '2048',
    description: '滑动数字方块，合并相同数字，挑战2048',
    icon: '🎯',
    component: Game2048,
    strategy: {
      heading: '🎯 数字合并挑战',
      bullets: [
        '滑动屏幕移动数字方块',
        '相同数字碰撞后合并翻倍',
        '目标：合成2048数字获胜',
        '可继续挑战更高数字',
      ],
      highlight: '🔢 提升数学思维和空间规划',
    },
  }),
  buildGameMeta({
    id: 'bubble-pop',
    name: '泡泡消消乐',
    description: '快速点击彩色气泡，连击获得更高分数',
    icon: '🫧',
    component: BubblePopGame,
    strategy: {
      heading: '🫧 缤纷泡泡消除乐园',
      bullets: [
        '快速点击彩色气泡进行消除',
        '连击消除获得加分奖励',
        '特殊气泡：冻结时间、双倍得分',
        '气泡会缓慢移动增加难度',
        '分层颜色系统，策略性消除',
      ],
      highlight: '⚡ 锻炼手速和快速决策能力',
    },
  }),
  buildGameMeta({
    id: 'tetris',
    name: '俄罗斯方块',
    description: '经典俄罗斯方块游戏，消除完整行获得高分',
    icon: '🧩',
    component: TetrisGame,
    strategy: {
      heading: '🧩 经典俄罗斯方块',
      bullets: [
        '旋转和移动下落的方块',
        '填满完整行即可消除得分',
        '速度会随等级提升而加快',
        '预览下一个方块，提前规划',
      ],
      highlight: '🏗️ 训练空间想象和快速反应',
    },
  }),
  buildGameMeta({
    id: 'bomber-pop',
    name: 'Q版泡泡堂',
    description: '可爱兔子放炸弹炸毁箱子和敌人，消灭所有敌人获胜',
    icon: '💣',
    component: BomberPopGame,
    strategy: {
      heading: '💣 Q版泡泡堂冒险',
      bullets: [
        '方向键 / WASD 移动，空格 / Enter 放炸弹',
        '像素风画面，多关卡 + 倒计时挑战',
        '道具：💣炸弹+1 🔥范围+1 👟踢炸弹 ⚡速度+',
        '敌人 AI 升级：会躲避炸弹、会追击玩家',
        '通关保留所有道具，进入下一关挑战',
        '通关奖励真实积分（每日上限 100）',
      ],
      highlight: '💥 经典俯视角解压玩法',
    },
  }),
];
