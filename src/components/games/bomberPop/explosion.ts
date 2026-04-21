import { COLS, ROWS, type BombEntity, type CellType } from './types';

export const computeExplosionCells = (
  bomb: BombEntity,
  currentMap: CellType[][],
  currentBombs: BombEntity[],
) => {
  const cells: { x: number; y: number }[] = [{ x: bomb.x, y: bomb.y }];
  const destroyedBoxes: { x: number; y: number }[] = [];
  const triggeredBombs: BombEntity[] = [];
  const directions: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (const [dx, dy] of directions) {
    for (let i = 1; i <= bomb.range; i++) {
      const nx = bomb.x + dx * i;
      const ny = bomb.y + dy * i;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) break;
      const cell = currentMap[ny][nx];
      if (cell === 'wall') break;
      cells.push({ x: nx, y: ny });
      const chained = currentBombs.find(b => b.id !== bomb.id && b.x === nx && b.y === ny);
      if (chained) triggeredBombs.push(chained);
      if (cell === 'box') {
        destroyedBoxes.push({ x: nx, y: ny });
        break;
      }
    }
  }
  return { cells, destroyedBoxes, triggeredBombs };
};

export const computeDangerCells = (
  currentBombs: BombEntity[],
  currentMap: CellType[][],
): Set<string> => {
  const danger = new Set<string>();
  for (const bomb of currentBombs) {
    danger.add(`${bomb.x},${bomb.y}`);
    const directions: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of directions) {
      for (let i = 1; i <= bomb.range; i++) {
        const nx = bomb.x + dx * i;
        const ny = bomb.y + dy * i;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) break;
        if (currentMap[ny][nx] === 'wall') break;
        danger.add(`${nx},${ny}`);
        if (currentMap[ny][nx] === 'box') break;
      }
    }
  }
  return danger;
};
