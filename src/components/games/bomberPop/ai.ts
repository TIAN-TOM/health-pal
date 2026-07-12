import {
  COLS, ROWS,
  type BombEntity, type CellType, type Direction, type Enemy, type Cpu, type PlayerPos,
} from './types';

const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right'];

/** 沿方向走一格并校验：越界、非空地、有炸弹都视为不可走，返回 null。*/
function walkableCell(
  map: CellType[][],
  bombs: BombEntity[],
  fromX: number,
  fromY: number,
  dir: Direction,
): { x: number; y: number } | null {
  let nx = fromX;
  let ny = fromY;
  if (dir === 'up') ny--;
  else if (dir === 'down') ny++;
  else if (dir === 'left') nx--;
  else if (dir === 'right') nx++;
  if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return null;
  if (map[ny][nx] !== 'empty') return null;
  if (bombs.some(b => b.x === nx && b.y === ny)) return null;
  return { x: nx, y: ny };
}

export interface EnemyStepContext {
  map: CellType[][];
  bombs: BombEntity[];
  danger: Set<string>;
  player: PlayerPos;
  /** 关卡基础移动 tick，函数内按敌人 kind 调整。*/
  enemyMoveTicks: number;
}

/**
 * 单个敌人一次 tick 的 AI 决策。
 * intelligence: 0 随机漫游（无视危险），1 会躲炸弹，2 会躲会追玩家。
 * rng 默认 Math.random，注入以便测试。
 */
export function stepEnemy(
  enemy: Enemy,
  ctx: EnemyStepContext,
  rng: () => number = Math.random,
): Enemy {
  if (!enemy.alive) return enemy;
  const { map, bombs, danger, player, enemyMoveTicks } = ctx;
  const moveTicks =
    enemy.kind === 'fast'
      ? Math.max(1, enemyMoveTicks - 2)
      : enemy.kind === 'tank'
        ? enemyMoveTicks + 2
        : enemyMoveTicks;
  // hitCooldown 每 tick 递减一次，所有分支共用同一结果
  const decHit = Math.max(0, enemy.hitCooldown - 1);
  if (enemy.moveCooldown > 0) {
    return { ...enemy, moveCooldown: enemy.moveCooldown - 1, hitCooldown: decHit };
  }

  const tryDir = (dir: Direction) => walkableCell(map, bombs, enemy.x, enemy.y, dir);

  // 站在危险格且会躲炸弹：逃向安全格
  if (enemy.intelligence >= 1 && danger.has(`${enemy.x},${enemy.y}`)) {
    const safe = ALL_DIRS.map(d => ({ d, pos: tryDir(d) })).filter(
      o => o.pos && !danger.has(`${o.pos.x},${o.pos.y}`),
    );
    if (safe.length > 0) {
      const choice = safe[Math.floor(rng() * safe.length)];
      return { ...enemy, dir: choice.d, x: choice.pos!.x, y: choice.pos!.y, moveCooldown: moveTicks, hitCooldown: decHit };
    }
  }

  // 会追：朝玩家方向优先移动（避开危险格）
  if (enemy.intelligence >= 2 && player.alive) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const preferred: Direction[] = [];
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx !== 0) preferred.push(dx > 0 ? 'right' : 'left');
      if (dy !== 0) preferred.push(dy > 0 ? 'down' : 'up');
    } else {
      if (dy !== 0) preferred.push(dy > 0 ? 'down' : 'up');
      if (dx !== 0) preferred.push(dx > 0 ? 'right' : 'left');
    }
    for (const d of preferred) {
      const pos = tryDir(d);
      if (pos && !danger.has(`${pos.x},${pos.y}`)) {
        return { ...enemy, dir: d, x: pos.x, y: pos.y, moveCooldown: moveTicks, hitCooldown: decHit };
      }
    }
  }

  // 维持当前方向（intelligence 0 无视危险）
  const current = tryDir(enemy.dir);
  if (current && (enemy.intelligence === 0 || !danger.has(`${current.x},${current.y}`))) {
    return { ...enemy, x: current.x, y: current.y, moveCooldown: moveTicks, hitCooldown: decHit };
  }

  // 随机换向
  const shuffled = [...ALL_DIRS].sort(() => rng() - 0.5);
  for (const d of shuffled) {
    const pos = tryDir(d);
    if (pos && (enemy.intelligence === 0 || !danger.has(`${pos.x},${pos.y}`))) {
      return { ...enemy, dir: d, x: pos.x, y: pos.y, moveCooldown: moveTicks, hitCooldown: decHit };
    }
  }
  return { ...enemy, hitCooldown: decHit };
}

export interface CpuStepContext {
  map: CellType[][];
  bombs: BombEntity[];
  danger: Set<string>;
}

/**
 * 单个 CPU 一次 tick 的 AI（竞技模式）。
 * 放炸弹属于外部副作用，这里只返回是否应在当前位置放炸弹，
 * 由调用方统一写入 bombs（放炸弹判定基于传入的 bombs 快照）。
 */
export function stepCpu(
  cpu: Cpu,
  ctx: CpuStepContext,
  rng: () => number = Math.random,
): { cpu: Cpu; placeBomb: boolean } {
  if (!cpu.alive) return { cpu, placeBomb: false };
  const { map, bombs, danger } = ctx;
  const nextCpu = { ...cpu };
  let placeBomb = false;

  // 放炸弹决策
  nextCpu.bombCooldown -= 1;
  if (nextCpu.bombCooldown <= 0) {
    const enemyBombs = bombs.filter(b => b.ownerId === 'enemy').length;
    if (enemyBombs < 3 && !bombs.some(b => b.x === cpu.x && b.y === cpu.y)) {
      placeBomb = true;
      nextCpu.bombCooldown = 40 + Math.floor(rng() * 30);
    } else {
      nextCpu.bombCooldown = 10;
    }
  }

  // 移动冷却
  if (nextCpu.moveCooldown > 0) {
    nextCpu.moveCooldown -= 1;
    return { cpu: nextCpu, placeBomb };
  }

  const tryDir = (dir: Direction) => walkableCell(map, bombs, cpu.x, cpu.y, dir);

  // 优先躲危险
  if (danger.has(`${cpu.x},${cpu.y}`)) {
    const safe = ALL_DIRS.map(d => ({ d, pos: tryDir(d) })).filter(
      o => o.pos && !danger.has(`${o.pos.x},${o.pos.y}`),
    );
    if (safe.length > 0) {
      const c = safe[Math.floor(rng() * safe.length)];
      return { cpu: { ...nextCpu, dir: c.d, x: c.pos!.x, y: c.pos!.y, moveCooldown: 3 }, placeBomb };
    }
  }
  const current = tryDir(cpu.dir);
  if (current && !danger.has(`${current.x},${current.y}`)) {
    return { cpu: { ...nextCpu, x: current.x, y: current.y, moveCooldown: 3 }, placeBomb };
  }
  const shuffled = [...ALL_DIRS].sort(() => rng() - 0.5);
  for (const d of shuffled) {
    const pos = tryDir(d);
    if (pos && !danger.has(`${pos.x},${pos.y}`)) {
      return { cpu: { ...nextCpu, dir: d, x: pos.x, y: pos.y, moveCooldown: 3 }, placeBomb };
    }
  }
  return { cpu: nextCpu, placeBomb };
}
