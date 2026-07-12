import { describe, it, expect } from 'vitest';
import { buildLevel } from '@/components/games/bomberPop/levelConfig';
import { generateMap } from '@/components/games/bomberPop/mapGenerator';
import { computeExplosionCells, computeDangerCells } from '@/components/games/bomberPop/explosion';
import { CHARACTERS, getCharacter } from '@/components/games/bomberPop/characters';
import { stepEnemy, stepCpu } from '@/components/games/bomberPop/ai';
import { stepKickedBombs, resolveDetonations } from '@/components/games/bomberPop/bombs';
import {
  ROWS, COLS, BOMB_KICK_MOVE_TICKS, EXPLOSION_TICKS,
  type CellType, type BombEntity, type Enemy, type Cpu, type PowerUp,
} from '@/components/games/bomberPop/types';

describe('bomberPop/levelConfig', () => {
  it('arcade level 1: 2 enemies, intelligence 0, forest theme, no boss', () => {
    const cfg = buildLevel(1, 'arcade');
    expect(cfg).toMatchObject({ level: 1, enemyCount: 2, enemyIntelligence: 0, theme: 'forest', isBoss: false });
  });

  it('arcade level 2: intelligence escalates to 1', () => {
    expect(buildLevel(2, 'arcade').enemyIntelligence).toBe(1);
  });

  it('arcade level 4+: intelligence escalates to 2', () => {
    expect(buildLevel(4, 'arcade').enemyIntelligence).toBe(2);
    expect(buildLevel(11, 'arcade').enemyIntelligence).toBe(2);
  });

  it('caps enemyCount at 6 and timeLimit at 60', () => {
    const cfg = buildLevel(50, 'arcade');
    expect(cfg.enemyCount).toBeLessThanOrEqual(6);
    expect(cfg.timeLimitSec).toBe(60);
  });

  it('arcade every 5th level is a boss stage with 1 boss enemy', () => {
    const cfg = buildLevel(5, 'arcade');
    expect(cfg.isBoss).toBe(true);
    expect(cfg.enemyCount).toBe(1);
    expect(cfg.bossKind).toBe('tank');
  });

  it('themes rotate by level: forest 1-3, beach 4-6, ice 7-9, volcano 10+', () => {
    expect(buildLevel(1, 'arcade').theme).toBe('forest');
    expect(buildLevel(4, 'arcade').theme).toBe('beach');
    expect(buildLevel(7, 'arcade').theme).toBe('ice');
    expect(buildLevel(11, 'arcade').theme).toBe('volcano');
  });

  it('battle mode: 3 enemies, intelligence 2, no boss', () => {
    const cfg = buildLevel(1, 'battle');
    expect(cfg).toMatchObject({ enemyCount: 3, enemyIntelligence: 2, isBoss: false });
  });

  it('survival mode: large time limit', () => {
    expect(buildLevel(1, 'survival').timeLimitSec).toBeGreaterThan(1000);
  });

  it('clamps level >= 1', () => {
    expect(buildLevel(0, 'arcade').level).toBe(1);
    expect(buildLevel(-5, 'arcade').level).toBe(1);
  });
});

describe('bomberPop/characters', () => {
  it('exposes 4 selectable characters', () => {
    expect(CHARACTERS.length).toBe(4);
    expect(CHARACTERS.map((c) => c.id).sort()).toEqual(['bear', 'cat', 'fox', 'rabbit']);
  });

  it('every character defines name + emoji + passive + bonus', () => {
    for (const c of CHARACTERS) {
      expect(c.name).toBeTruthy();
      expect(c.emoji).toBeTruthy();
      expect(c.passive).toBeTruthy();
      expect(c.bonus).toBeTruthy();
    }
  });

  it('passive bonuses match design spec', () => {
    expect(getCharacter('rabbit').bonus.speed).toBe(1);
    expect(getCharacter('cat').bonus.bombs).toBe(1);
    expect(getCharacter('bear').bonus.hp).toBe(1);
    expect(getCharacter('fox').bonus.range).toBe(1);
  });

  it('falls back to first character when id is unknown', () => {
    const fallback = getCharacter('unknown' as never);
    expect(fallback.id).toBe('rabbit');
  });
});

describe('bomberPop/mapGenerator', () => {
  it('generates ROWS × COLS map with walls on borders', () => {
    const cfg = buildLevel(1, 'arcade');
    const { map } = generateMap(cfg, cfg.enemyCount);
    expect(map.length).toBe(ROWS);
    expect(map[0].length).toBe(COLS);
    for (let c = 0; c < COLS; c++) {
      expect(map[0][c]).toBe('wall');
      expect(map[ROWS - 1][c]).toBe('wall');
    }
    for (let r = 0; r < ROWS; r++) {
      expect(map[r][0]).toBe('wall');
      expect(map[r][COLS - 1]).toBe('wall');
    }
  });

  it('player spawn (1,1) is empty and safe corner', () => {
    const cfg = buildLevel(1, 'arcade');
    const { map } = generateMap(cfg, cfg.enemyCount);
    expect(map[1][1]).toBe('empty');
    expect(map[1][2]).not.toBe('box');
    expect(map[2][1]).not.toBe('box');
  });

  it('returns enemy positions matching count', () => {
    const cfg = buildLevel(3, 'arcade');
    const { enemyPositions } = generateMap(cfg, cfg.enemyCount);
    expect(enemyPositions.length).toBe(cfg.enemyCount);
  });

  it('beach theme spawns sand specialCells', () => {
    const cfg = buildLevel(4, 'arcade');
    const { specialCells } = generateMap(cfg, cfg.enemyCount);
    expect(specialCells.length).toBeGreaterThan(0);
    expect(specialCells.every((s) => s.kind === 'sand')).toBe(true);
  });

  it('forest theme has no specialCells', () => {
    const cfg = buildLevel(1, 'arcade');
    const { specialCells } = generateMap(cfg, cfg.enemyCount);
    expect(specialCells.length).toBe(0);
  });
});

describe('bomberPop/explosion', () => {
  const makeMap = (overrides: Array<[number, number, CellType]> = []): CellType[][] => {
    const m: CellType[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => 'empty' as CellType),
    );
    for (let c = 0; c < COLS; c++) { m[0][c] = 'wall'; m[ROWS - 1][c] = 'wall'; }
    for (let r = 0; r < ROWS; r++) { m[r][0] = 'wall'; m[r][COLS - 1] = 'wall'; }
    overrides.forEach(([y, x, t]) => { m[y][x] = t; });
    return m;
  };

  it('range 1 covers center + 4 directions', () => {
    const map = makeMap();
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 0, range: 1, ownerId: 'player' };
    const { cells, destroyedBoxes } = computeExplosionCells(bomb, map, [bomb]);
    expect(cells).toEqual(expect.arrayContaining([
      { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 6 }, { x: 4, y: 5 }, { x: 6, y: 5 },
    ]));
    expect(destroyedBoxes).toHaveLength(0);
  });

  it('walls block explosion propagation', () => {
    const map = makeMap();
    const bomb: BombEntity = { id: 1, x: 1, y: 1, timer: 0, range: 5, ownerId: 'player' };
    const { cells } = computeExplosionCells(bomb, map, [bomb]);
    expect(cells.some(c => c.x === 0)).toBe(false);
  });

  it('boxes are destroyed and stop propagation', () => {
    const map = makeMap([[5, 7, 'box']]);
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 0, range: 5, ownerId: 'player' };
    const { cells, destroyedBoxes } = computeExplosionCells(bomb, map, [bomb]);
    expect(destroyedBoxes).toContainEqual({ x: 7, y: 5 });
    expect(cells.some(c => c.x === 8 && c.y === 5)).toBe(false);
  });

  it('pierce bomb passes through boxes destroying them', () => {
    const map = makeMap([[5, 7, 'box'], [5, 8, 'box']]);
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 0, range: 5, ownerId: 'player', pierce: true };
    const { cells, destroyedBoxes } = computeExplosionCells(bomb, map, [bomb]);
    expect(destroyedBoxes).toEqual(expect.arrayContaining([
      { x: 7, y: 5 }, { x: 8, y: 5 },
    ]));
    expect(cells.some(c => c.x === 9 && c.y === 5)).toBe(true);
  });

  it('chained bombs are detected', () => {
    const map = makeMap();
    const a: BombEntity = { id: 1, x: 5, y: 5, timer: 0, range: 2, ownerId: 'player' };
    const b: BombEntity = { id: 2, x: 7, y: 5, timer: 5, range: 1, ownerId: 'player' };
    const { triggeredBombs } = computeExplosionCells(a, map, [a, b]);
    expect(triggeredBombs.map(x => x.id)).toContain(2);
  });

  it('computeDangerCells aggregates all bomb ranges', () => {
    const map = makeMap();
    const bombs: BombEntity[] = [
      { id: 1, x: 3, y: 3, timer: 5, range: 1, ownerId: 'player' },
    ];
    const danger = computeDangerCells(bombs, map);
    expect(danger.has('3,3')).toBe(true);
    expect(danger.has('3,2')).toBe(true);
    expect(danger.has('4,3')).toBe(true);
  });
});

// 共享的空棋盘（四周墙、内部空地），供 AI / 炸弹逻辑测试使用
const openMap = (overrides: Array<[number, number, CellType]> = []): CellType[][] => {
  const m: CellType[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 'empty' as CellType),
  );
  for (let c = 0; c < COLS; c++) { m[0][c] = 'wall'; m[ROWS - 1][c] = 'wall'; }
  for (let r = 0; r < ROWS; r++) { m[r][0] = 'wall'; m[r][COLS - 1] = 'wall'; }
  overrides.forEach(([y, x, t]) => { m[y][x] = t; });
  return m;
};

const makeEnemy = (over: Partial<Enemy> = {}): Enemy => ({
  id: 1, x: 5, y: 5, dir: 'right', moveCooldown: 0, alive: true,
  intelligence: 0, kind: 'normal', hp: 1, hitCooldown: 0, ...over,
});

describe('bomberPop/ai stepEnemy', () => {
  const ctx = (over: Partial<Parameters<typeof stepEnemy>[1]> = {}) => ({
    map: openMap(), bombs: [] as BombEntity[], danger: new Set<string>(),
    player: { x: 8, y: 5, alive: true }, enemyMoveTicks: 4, ...over,
  });

  it('returns a dead enemy unchanged', () => {
    const enemy = makeEnemy({ alive: false });
    expect(stepEnemy(enemy, ctx())).toBe(enemy);
  });

  it('decrements moveCooldown and hitCooldown without moving', () => {
    const enemy = makeEnemy({ moveCooldown: 3, hitCooldown: 2 });
    const next = stepEnemy(enemy, ctx());
    expect(next).toMatchObject({ x: 5, y: 5, moveCooldown: 2, hitCooldown: 1 });
  });

  it('always decrements hitCooldown, never below 0', () => {
    const enemy = makeEnemy({ hitCooldown: 0, intelligence: 2 });
    expect(stepEnemy(enemy, ctx()).hitCooldown).toBe(0);
  });

  it('intelligence 2 chases the player horizontally', () => {
    const enemy = makeEnemy({ intelligence: 2, x: 5, y: 5, dir: 'up' });
    const next = stepEnemy(enemy, ctx({ player: { x: 9, y: 5, alive: true } }));
    expect(next).toMatchObject({ x: 6, y: 5, dir: 'right', moveCooldown: 4 });
  });

  it('intelligence 1 flees from a danger cell to a safe neighbour', () => {
    const danger = new Set<string>(['5,5']); // 站在危险格上，四邻安全
    const enemy = makeEnemy({ intelligence: 1 });
    const next = stepEnemy(enemy, ctx({ danger }), () => 0);
    expect(danger.has(`${next.x},${next.y}`)).toBe(false);
    expect(next.x === 5 && next.y === 5).toBe(false); // 确实移动了
  });

  it('intelligence 0 ignores danger and keeps its heading', () => {
    const danger = new Set<string>(['6,5']); // 前方危险，但傻瓜敌人无视
    const enemy = makeEnemy({ intelligence: 0, dir: 'right' });
    const next = stepEnemy(enemy, ctx({ danger }));
    expect(next).toMatchObject({ x: 6, y: 5, moveCooldown: 4 });
  });

  it('fast enemies move more often (fewer cooldown ticks) than tanks', () => {
    const fast = stepEnemy(makeEnemy({ kind: 'fast', intelligence: 2 }), ctx());
    const tank = stepEnemy(makeEnemy({ kind: 'tank', intelligence: 2 }), ctx());
    expect(fast.moveCooldown).toBe(2); // 4 - 2
    expect(tank.moveCooldown).toBe(6); // 4 + 2
  });
});

const makeCpu = (over: Partial<Cpu> = {}): Cpu => ({
  id: 1, x: 5, y: 5, dir: 'right', alive: true, moveCooldown: 0, bombCooldown: 1, ...over,
});

describe('bomberPop/ai stepCpu', () => {
  const ctx = (over: Partial<Parameters<typeof stepCpu>[1]> = {}) => ({
    map: openMap(), bombs: [] as BombEntity[], danger: new Set<string>(), ...over,
  });

  it('returns a dead cpu unchanged with no bomb', () => {
    const cpu = makeCpu({ alive: false });
    expect(stepCpu(cpu, ctx())).toEqual({ cpu, placeBomb: false });
  });

  it('places a bomb when cooldown elapses and fewer than 3 enemy bombs exist', () => {
    const cpu = makeCpu({ bombCooldown: 1 });
    const { placeBomb, cpu: next } = stepCpu(cpu, ctx(), () => 0);
    expect(placeBomb).toBe(true);
    expect(next.bombCooldown).toBeGreaterThanOrEqual(40);
  });

  it('does not place a bomb when 3 enemy bombs already exist', () => {
    const bombs: BombEntity[] = [
      { id: 1, x: 2, y: 2, timer: 5, range: 2, ownerId: 'enemy' },
      { id: 2, x: 3, y: 2, timer: 5, range: 2, ownerId: 'enemy' },
      { id: 3, x: 4, y: 2, timer: 5, range: 2, ownerId: 'enemy' },
    ];
    const { placeBomb, cpu: next } = stepCpu(makeCpu({ bombCooldown: 1 }), ctx({ bombs }));
    expect(placeBomb).toBe(false);
    expect(next.bombCooldown).toBe(10);
  });

  it('decrements moveCooldown instead of moving', () => {
    const { cpu: next } = stepCpu(makeCpu({ moveCooldown: 2, bombCooldown: 20 }), ctx());
    expect(next).toMatchObject({ x: 5, y: 5, moveCooldown: 1 });
  });

  it('flees to a safe cell when standing in danger', () => {
    const danger = new Set<string>(['5,5']);
    const { cpu: next } = stepCpu(makeCpu({ bombCooldown: 20 }), ctx({ danger }), () => 0);
    expect(danger.has(`${next.x},${next.y}`)).toBe(false);
  });
});

describe('bomberPop/bombs stepKickedBombs', () => {
  const kickCtx = (over: Partial<Parameters<typeof stepKickedBombs>[1]> = {}) => ({
    map: openMap(), player: { x: 0, y: 0, alive: false }, enemies: [] as Enemy[], ...over,
  });

  it('leaves a stationary bomb untouched', () => {
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 5, range: 2, ownerId: 'player' };
    expect(stepKickedBombs([bomb], kickCtx())[0]).toBe(bomb);
  });

  it('only decrements cooldown when moveCooldown is still active', () => {
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 5, range: 2, ownerId: 'player', vx: 1, vy: 0, moveCooldown: 2 };
    expect(stepKickedBombs([bomb], kickCtx())[0]).toMatchObject({ x: 5, moveCooldown: 1 });
  });

  it('slides a kicked bomb into an empty cell', () => {
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 5, range: 2, ownerId: 'player', vx: 1, vy: 0, moveCooldown: 0 };
    expect(stepKickedBombs([bomb], kickCtx())[0]).toMatchObject({ x: 6, y: 5, moveCooldown: BOMB_KICK_MOVE_TICKS });
  });

  it('stops at a wall', () => {
    const bomb: BombEntity = { id: 1, x: COLS - 2, y: 5, timer: 5, range: 2, ownerId: 'player', vx: 1, vy: 0, moveCooldown: 0 };
    expect(stepKickedBombs([bomb], kickCtx())[0]).toMatchObject({ x: COLS - 2, vx: 0, vy: 0 });
  });

  it('stops when the target cell holds the player', () => {
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 5, range: 2, ownerId: 'player', vx: 1, vy: 0, moveCooldown: 0 };
    const out = stepKickedBombs([bomb], kickCtx({ player: { x: 6, y: 5, alive: true } }))[0];
    expect(out).toMatchObject({ x: 5, vx: 0, vy: 0 });
  });

  it('stops when the target cell holds an enemy', () => {
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 5, range: 2, ownerId: 'player', vx: 1, vy: 0, moveCooldown: 0 };
    const out = stepKickedBombs([bomb], kickCtx({ enemies: [makeEnemy({ x: 6, y: 5 })] }))[0];
    expect(out).toMatchObject({ x: 5, vx: 0, vy: 0 });
  });
});

describe('bomberPop/bombs resolveDetonations', () => {
  let idSeq = 0;
  const nextId = () => { idSeq += 1; return idSeq; };
  const reset = () => { idSeq = 0; };

  it('decrements timers without detonating', () => {
    reset();
    const bombs: BombEntity[] = [{ id: 1, x: 5, y: 5, timer: 5, range: 2, ownerId: 'player' }];
    const res = resolveDetonations(bombs, openMap(), [], nextId);
    expect(res.detonated).toBe(false);
    expect(res.remainingBombs[0].timer).toBe(4);
  });

  it('detonates a bomb whose timer reaches 0 and clears it', () => {
    reset();
    const bombs: BombEntity[] = [{ id: 1, x: 5, y: 5, timer: 1, range: 2, ownerId: 'player' }];
    const res = resolveDetonations(bombs, openMap(), [], nextId);
    expect(res.detonated).toBe(true);
    expect(res.remainingBombs).toHaveLength(0);
    expect(res.newExplosions[0]).toMatchObject({ id: 1, timer: EXPLOSION_TICKS });
  });

  it('does not auto-decrement a remote bomb', () => {
    reset();
    const bombs: BombEntity[] = [{ id: 1, x: 5, y: 5, timer: 9999, range: 2, ownerId: 'player', remote: true }];
    const res = resolveDetonations(bombs, openMap(), [], nextId);
    expect(res.detonated).toBe(false);
    expect(res.remainingBombs[0].timer).toBe(9999);
  });

  it('destroys boxes and reveals hidden power-ups', () => {
    reset();
    const map = openMap([[5, 6, 'box']]);
    const hidden: PowerUp[] = [{ x: 6, y: 5, type: 'bomb' }];
    const bombs: BombEntity[] = [{ id: 1, x: 5, y: 5, timer: 1, range: 2, ownerId: 'player' }];
    const res = resolveDetonations(bombs, map, hidden, nextId);
    expect(res.destroyedBoxCount).toBe(1);
    expect(res.newMap[5][6]).toBe('empty');
    expect(res.revealedPowerUps).toContainEqual({ x: 6, y: 5, type: 'bomb' });
  });

  it('chain-detonates an adjacent bomb, consuming both', () => {
    reset();
    const bombs: BombEntity[] = [
      { id: 1, x: 5, y: 5, timer: 1, range: 2, ownerId: 'player' },
      { id: 2, x: 7, y: 5, timer: 50, range: 1, ownerId: 'player' },
    ];
    const res = resolveDetonations(bombs, openMap(), [], nextId);
    expect(res.detonated).toBe(true);
    expect(res.remainingBombs).toHaveLength(0); // 两颗都炸掉
    // 两颗炸弹的位置都被火焰覆盖
    const covered = res.newExplosions.flatMap(e => e.cells);
    expect(covered).toContainEqual({ x: 5, y: 5 });
    expect(covered).toContainEqual({ x: 7, y: 5 });
    // 注：已引爆的炸弹在链式 while 循环里会被重复处理（filter 在循环后才执行），
    // bomb1 因此产生 2 个 explosion，加 bomb2 共 3 个——保留原有行为。
    expect(res.newExplosions).toHaveLength(3);
  });
});
