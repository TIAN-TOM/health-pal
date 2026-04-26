import { COLS, ROWS, type CellType, type LevelConfig, type PowerUpType, type SpecialCell, type ThemeKind } from './types';

const SAND_COUNT = 4;
const ICE_COUNT = 8;
const LAVA_COUNT = 3;

const THEMED_SPECIAL_KIND = (theme: ThemeKind): SpecialCell['kind'] | null => {
  if (theme === 'beach') return 'sand';
  if (theme === 'ice') return 'ice';
  if (theme === 'volcano') return 'lava-vent';
  return null;
};

export const generateMap = (
  cfg: LevelConfig,
  enemyCount: number,
): {
  map: CellType[][];
  powerUpSpawns: { x: number; y: number; type: PowerUpType }[];
  enemyPositions: { x: number; y: number }[];
  specialCells: SpecialCell[];
} => {
  const map: CellType[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 'empty' as CellType),
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

  const safeZones: { x: number; y: number }[] = [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 },
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
  enemyPositions.forEach(p => {
    safeZones.push({ x: p.x, y: p.y });
    [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }].forEach(({ dx, dy }) => {
      safeZones.push({ x: p.x + dx, y: p.y + dy });
    });
  });

  const isSafe = (x: number, y: number) => safeZones.some(s => s.x === x && s.y === y);

  const boxPositions: { x: number; y: number }[] = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (map[r][c] === 'empty' && !isSafe(c, r) && Math.random() < cfg.boxRate) {
        map[r][c] = 'box';
        boxPositions.push({ x: c, y: r });
      }
    }
  }

  // 道具掉落（高级道具仅在 ≥3 关出现）
  const powerUpSpawns: { x: number; y: number; type: PowerUpType }[] = [];
  const baseTypes: PowerUpType[] = ['bomb', 'range', 'kick', 'speed', 'shield', 'life'];
  const advancedTypes: PowerUpType[] = ['pierce', 'remote', 'freeze'];
  const pool: PowerUpType[] = cfg.level >= 3 ? [...baseTypes, ...advancedTypes] : baseTypes;
  boxPositions.forEach(({ x, y }) => {
    if (Math.random() < cfg.powerUpRate) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      powerUpSpawns.push({ x, y, type });
    }
  });

  // 主题专属机关：在空地上随机散布（避开玩家出生区）
  const specialCells: SpecialCell[] = [];
  const themeKind = THEMED_SPECIAL_KIND(cfg.theme);
  if (themeKind) {
    const desired = themeKind === 'sand' ? SAND_COUNT : themeKind === 'ice' ? ICE_COUNT : LAVA_COUNT;
    const candidates: { x: number; y: number }[] = [];
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (map[r][c] === 'empty' && !isSafe(c, r)) candidates.push({ x: c, y: r });
      }
    }
    candidates.sort(() => Math.random() - 0.5);
    candidates.slice(0, desired).forEach(({ x, y }) => specialCells.push({ x, y, kind: themeKind }));
  }

  return { map, powerUpSpawns, enemyPositions, specialCells };
};
