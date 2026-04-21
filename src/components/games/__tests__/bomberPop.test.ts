import { describe, it, expect } from 'vitest';
import { buildLevel } from '@/components/games/bomberPop/levelConfig';
import { generateMap } from '@/components/games/bomberPop/mapGenerator';
import { computeExplosionCells, computeDangerCells } from '@/components/games/bomberPop/explosion';
import { ROWS, COLS, type CellType, type BombEntity } from '@/components/games/bomberPop/types';

describe('bomberPop/levelConfig', () => {
  it('level 1: 2 enemies, intelligence 0, 150s', () => {
    const cfg = buildLevel(1);
    expect(cfg).toMatchObject({ level: 1, enemyCount: 2, enemyIntelligence: 0, timeLimitSec: 140 });
  });

  it('level 2: intelligence escalates to 1', () => {
    expect(buildLevel(2).enemyIntelligence).toBe(1);
  });

  it('level 4+: intelligence escalates to 2', () => {
    expect(buildLevel(4).enemyIntelligence).toBe(2);
    expect(buildLevel(10).enemyIntelligence).toBe(2);
  });

  it('caps enemyCount at 6 and timeLimit at 60', () => {
    const cfg = buildLevel(50);
    expect(cfg.enemyCount).toBe(6);
    expect(cfg.timeLimitSec).toBe(60);
  });

  it('clamps level >= 1', () => {
    expect(buildLevel(0).level).toBe(1);
    expect(buildLevel(-5).level).toBe(1);
  });
});

describe('bomberPop/mapGenerator', () => {
  it('generates ROWS × COLS map with walls on borders', () => {
    const cfg = buildLevel(1);
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
    const cfg = buildLevel(1);
    const { map } = generateMap(cfg, cfg.enemyCount);
    expect(map[1][1]).toBe('empty');
    expect(map[1][2]).not.toBe('box');
    expect(map[2][1]).not.toBe('box');
  });

  it('returns enemy positions matching count', () => {
    const cfg = buildLevel(3);
    const { enemyPositions } = generateMap(cfg, cfg.enemyCount);
    expect(enemyPositions.length).toBe(cfg.enemyCount);
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

  it('computeExplosionCells: range 1 covers center + 4 directions', () => {
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
    // x=0 是墙，所以 x=1 向左不应包含 x=0
    expect(cells.some(c => c.x === 0)).toBe(false);
  });

  it('boxes are destroyed and stop propagation', () => {
    const map = makeMap([[5, 7, 'box'], [5, 8, 'empty']]);
    const bomb: BombEntity = { id: 1, x: 5, y: 5, timer: 0, range: 5, ownerId: 'player' };
    const { cells, destroyedBoxes } = computeExplosionCells(bomb, map, [bomb]);
    expect(destroyedBoxes).toContainEqual({ x: 7, y: 5 });
    // x=8 不应被波及（被 box 阻挡）
    expect(cells.some(c => c.x === 8 && c.y === 5)).toBe(false);
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
