// BomberPop 游戏的共享类型与常量
// 抽离自原 BomberPopGame.tsx，仅做模块化，不改变任何数值或语义。

export type CellType = 'empty' | 'wall' | 'box';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type PowerUpType = 'bomb' | 'range' | 'kick' | 'speed';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
}

export interface BombEntity {
  id: number;
  x: number;
  y: number;
  timer: number;
  range: number;
  ownerId: 'player' | 'enemy';
  // 踢动状态
  vx?: number;
  vy?: number;
  moveCooldown?: number;
}

export interface Explosion {
  id: number;
  cells: { x: number; y: number }[];
  timer: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  dir: Direction;
  moveCooldown: number;
  alive: boolean;
  /** 0=傻瓜随机 1=会躲炸弹 2=会躲会追 */
  intelligence: 0 | 1 | 2;
}

export interface LevelConfig {
  level: number;
  enemyCount: number;
  enemyIntelligence: 0 | 1 | 2;
  enemyMoveTicks: number;
  boxRate: number;
  timeLimitSec: number;
  /** 0~1，每个箱子掉落道具的概率 */
  powerUpRate: number;
}

export const ROWS = 11;
export const COLS = 13;
export const TICK_MS = 100;
export const BOMB_FUSE_TICKS = Math.round(2500 / TICK_MS);
export const EXPLOSION_TICKS = Math.round(450 / TICK_MS);
export const PLAYER_BASE_MOVE_TICKS = 2;
export const BOMB_KICK_MOVE_TICKS = 1;

export const POWER_UP_LABEL: Record<PowerUpType, string> = {
  bomb: '炸弹+1',
  range: '范围+1',
  kick: '获得踢炸弹',
  speed: '速度提升',
};
