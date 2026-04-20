import {
  ROWS,
  COLS,
  type CellType,
  type LevelConfig,
  type PowerUpType,
} from './types';

/**
 * 根据关卡计算难度参数。
 * 与原实现完全相同。
 */
export const buildLevel = (level: number): LevelConfig => {
  const clamped = Math.max(1, level);
  const enemyCount = Math.min(2 + Math.floor((clamped - 1) / 1.5), 6);
  let intelligence: 0 | 1 | 2 = 0;
  if (clamped >= 2) intelligence = 1;
  if (clamped >= 4) intelligence = 2;
  const enemyMoveTicks = Math.max(2, 6 - Math.floor(clamped / 2));
  const boxRate = Math.min(0.45 + clamped * 0.04, 0.7);
  const timeLimitSec = Math.max(60, 150 - clamped * 10);
  const powerUpRate = Math.min(0.2 + clamped * 0.02, 0.4);
  return {
    level: clamped,
    enemyCount,
    enemyIntelligence: intelligence,
    enemyMoveTicks,
    boxRate,
    timeLimitSec,
    powerUpRate,
  };
};

/**
 * 生成地图：墙体、可破坏箱子、藏在箱子下面的道具掉落、敌人初始位置。
 * 与原实现完全相同（含相同的安全区与掉落概率算法）。
 */
export const generateMap = (
  cfg: LevelConfig,
  enemyCount: number
): {
  map: CellType[][];
  powerUpSpawns: { x: number; y: number; type: PowerUpType }[];
  enemyPositions: { x: number; y: number }[];
} => {
  const map: CellType[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 'empty' as CellType)
  );

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1) {
        map[r][c] = 'wall';
      } else if (r % 2 === 0 && c % 2 === 0) {
        map[r][c] = 'wall';
      }
    }
  }

  // 玩家与敌人安全区
  const safeZones = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ];
  const enemyCorners: { x: number; y: number }[] = [
    { x: COLS - 2, y: ROWS - 2 },
    { x: COLS - 2, y: 1 },
    { x: 1, y: ROWS - 2 },
    { x: COLS - 4, y: ROWS - 2 },
    { x: COLS - 2, y: ROWS - 4 },
    { x: 3, y: ROWS - 2 },
  ];
  const enemyPositions = enemyCorners.slice(0, enemyCount);
  enemyPositions.forEach((p) => {
    safeZones.push({ x: p.x, y: p.y });
    [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ].forEach(({ dx, dy }) => {
      safeZones.push({ x: p.x + dx, y: p.y + dy });
    });
  });

  const isSafe = (x: number, y: number) =>
    safeZones.some((s) => s.x === x && s.y === y);

  const boxPositions: { x: number; y: number }[] = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (
        map[r][c] === 'empty' &&
        !isSafe(c, r) &&
        Math.random() < cfg.boxRate
      ) {
        map[r][c] = 'box';
        boxPositions.push({ x: c, y: r });
      }
    }
  }

  // 道具掉落预生成（藏在箱子下面）
  const powerUpSpawns: { x: number; y: number; type: PowerUpType }[] = [];
  const types: PowerUpType[] = ['bomb', 'range', 'kick', 'speed'];
  boxPositions.forEach(({ x, y }) => {
    if (Math.random() < cfg.powerUpRate) {
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpSpawns.push({ x, y, type });
    }
  });

  return { map, powerUpSpawns, enemyPositions };
};
