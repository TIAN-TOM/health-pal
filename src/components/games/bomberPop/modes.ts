import type { GameMode } from './types';

export interface ModeMeta {
  id: GameMode;
  name: string;
  emoji: string;
  description: string;
  /** 是否计入街机积分奖励 */
  pointsEnabled: boolean;
}

export const MODES: ModeMeta[] = [
  {
    id: 'arcade',
    name: '街机闯关',
    emoji: '🎯',
    description: '15 关递进，每 5 关一个 Boss，通关有真实积分奖励',
    pointsEnabled: true,
  },
  {
    id: 'battle',
    name: '竞技对战',
    emoji: '⚔️',
    description: '玩家 vs 3 个 CPU，3 局 2 胜，最后存活者获胜',
    pointsEnabled: false,
  },
  {
    id: 'survival',
    name: '生存挑战',
    emoji: '🌪️',
    description: '敌人每 30 秒刷新一波，挑战最长存活时间',
    pointsEnabled: true,
  },
];

export const ARCADE_TOTAL_LEVELS = 15;
export const SURVIVAL_WAVE_INTERVAL_SEC = 30;
export const BATTLE_BEST_OF = 3; // 三局两胜
