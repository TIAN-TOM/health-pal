import {
  BOMB_KICK_MOVE_TICKS, COLS, EXPLOSION_TICKS, ROWS,
  type BombEntity, type CellType, type Enemy, type Explosion, type PowerUp, type PlayerPos,
} from './types';
import { computeExplosionCells } from './explosion';

export interface KickContext {
  map: CellType[][];
  player: PlayerPos;
  enemies: Enemy[];
}

/**
 * 被踢动炸弹的滑行：撞墙/撞非空地/撞其他炸弹/撞人（玩家或敌人）则停下。
 * 纯函数，返回新的炸弹数组。
 */
export function stepKickedBombs(bombs: BombEntity[], ctx: KickContext): BombEntity[] {
  const { map, player, enemies } = ctx;
  return bombs.map(b => {
    if (!b.vx && !b.vy) return b;
    const cd = (b.moveCooldown ?? 0) - 1;
    if (cd > 0) return { ...b, moveCooldown: cd };
    const nx = b.x + (b.vx ?? 0);
    const ny = b.y + (b.vy ?? 0);
    const stop = { ...b, vx: 0, vy: 0, moveCooldown: 0 };
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || map[ny][nx] !== 'empty') return stop;
    if (bombs.some(o => o.id !== b.id && o.x === nx && o.y === ny)) return stop;
    if (player.alive && player.x === nx && player.y === ny) return stop;
    if (enemies.some(e => e.alive && e.x === nx && e.y === ny)) return stop;
    return { ...b, x: nx, y: ny, moveCooldown: BOMB_KICK_MOVE_TICKS };
  });
}

export interface DetonationResult {
  remainingBombs: BombEntity[];
  newMap: CellType[][];
  newExplosions: Explosion[];
  destroyedBoxCount: number;
  revealedPowerUps: PowerUp[];
  detonated: boolean;
}

/**
 * 炸弹倒计时 + 链式引爆结算（不含 setState / 音效等副作用）。
 * - remote 炸弹不自动倒计时，只有 timer 已被外部置 0 才会引爆。
 * - 链式引爆用 while 循环传播：一颗炸弹的火焰触发相邻炸弹后继续结算。
 * - nextExplosionId 由调用方提供，用于保持外部爆炸 id 的递增序列。
 */
export function resolveDetonations(
  bombs: BombEntity[],
  map: CellType[][],
  hiddenPowerUps: PowerUp[],
  nextExplosionId: () => number,
): DetonationResult {
  let workingBombs = bombs.map(b => (b.remote ? b : { ...b, timer: b.timer - 1 }));
  let workingMap = map;
  const newExplosions: Explosion[] = [];
  let destroyedBoxCount = 0;
  const revealedPowerUps: PowerUp[] = [];

  const toDetonate = new Set<number>();
  workingBombs.filter(b => b.timer <= 0).forEach(b => toDetonate.add(b.id));

  let changed = true;
  while (changed) {
    changed = false;
    for (const bombId of Array.from(toDetonate)) {
      const bomb = workingBombs.find(b => b.id === bombId);
      if (!bomb) continue;
      const { cells, destroyedBoxes, triggeredBombs } = computeExplosionCells(bomb, workingMap, workingBombs);
      const newMap = workingMap.map(row => [...row]);
      destroyedBoxes.forEach(({ x, y }) => {
        newMap[y][x] = 'empty';
        const hidden = hiddenPowerUps.find(p => p.x === x && p.y === y);
        if (hidden) revealedPowerUps.push(hidden);
      });
      workingMap = newMap;
      destroyedBoxCount += destroyedBoxes.length;
      newExplosions.push({ id: nextExplosionId(), cells, timer: EXPLOSION_TICKS });
      triggeredBombs.forEach(cb => {
        if (!toDetonate.has(cb.id)) {
          toDetonate.add(cb.id);
          changed = true;
        }
      });
    }
  }

  const detonated = toDetonate.size > 0;
  if (detonated) {
    workingBombs = workingBombs.filter(b => !toDetonate.has(b.id));
  }
  return {
    remainingBombs: workingBombs,
    newMap: workingMap,
    newExplosions,
    destroyedBoxCount,
    revealedPowerUps,
    detonated,
  };
}
