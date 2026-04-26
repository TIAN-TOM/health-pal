// 类型与常量集中定义。Bomb 重命名为 BombEntity，避免与 lucide-react 的 Bomb 图标冲突。
export type CellType = 'empty' | 'wall' | 'box';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type PowerUpType =
  | 'bomb'
  | 'range'
  | 'kick'
  | 'speed'
  | 'pierce'
  | 'remote'
  | 'shield'
  | 'life'
  | 'freeze';

export type ThemeKind = 'forest' | 'beach' | 'ice' | 'volcano';
export type SpecialCellKind = 'sand' | 'ice' | 'lava-vent';
export type GameMode = 'arcade' | 'battle' | 'survival';
export type EnemyKind = 'normal' | 'fast' | 'tank' | 'boss';
export type CharacterId = 'rabbit' | 'cat' | 'bear' | 'fox';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
}

export interface SpecialCell {
  x: number;
  y: number;
  kind: SpecialCellKind;
}

export interface BombEntity {
  id: number;
  x: number;
  y: number;
  timer: number;
  range: number;
  ownerId: 'player' | 'enemy';
  /** 是否拥有穿透火焰（无视箱子继续传播） */
  pierce?: boolean;
  /** 是否为遥控炸弹（永不自动倒计时引爆，timer 维持） */
  remote?: boolean;
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
  kind: EnemyKind;
  hp: number;
  /** 命中后短暂无敌 tick，避免一次爆炸把多 HP 敌人秒杀 */
  hitCooldown: number;
}

export interface LevelConfig {
  level: number;
  enemyCount: number;
  enemyIntelligence: 0 | 1 | 2;
  enemyMoveTicks: number;
  boxRate: number;
  timeLimitSec: number;
  powerUpRate: number;
  theme: ThemeKind;
  isBoss: boolean;
  bossKind?: 'tank';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  bornAt: number;
}

export const ROWS = 11;
export const COLS = 13;
export const TICK_MS = 100;
export const BOMB_FUSE_TICKS = Math.round(2500 / TICK_MS);
export const EXPLOSION_TICKS = Math.round(450 / TICK_MS);
export const PLAYER_BASE_MOVE_TICKS = 2;
export const BOMB_KICK_MOVE_TICKS = 1;
export const FREEZE_DURATION_TICKS = Math.round(5000 / TICK_MS);
export const ICE_SLIDE_EXTRA = 1;
export const LAVA_INTERVAL_TICKS = Math.round(8000 / TICK_MS);
export const HP_MAX = 3;
export const FLOATING_TEXT_TTL_MS = 900;

export const POWER_UP_LABEL: Record<PowerUpType, string> = {
  bomb: '炸弹+1',
  range: '范围+1',
  kick: '获得踢炸弹',
  speed: '速度提升',
  pierce: '穿透火焰',
  remote: '遥控引爆',
  shield: '护盾',
  life: '生命+1',
  freeze: '冻结敌人 5s',
};
