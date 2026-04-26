import { COLS, ROWS, type SpecialCell, type Direction } from './types';

/** 流沙：在指定方向上推进一格，若不可行则原地不动 */
export const slideOnSand = (
  x: number,
  y: number,
  dir: Direction,
  isBlocked: (nx: number, ny: number) => boolean,
): { x: number; y: number } => {
  let nx = x;
  let ny = y;
  if (dir === 'up') ny--;
  else if (dir === 'down') ny++;
  else if (dir === 'left') nx--;
  else if (dir === 'right') nx++;
  if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return { x, y };
  if (isBlocked(nx, ny)) return { x, y };
  return { x: nx, y: ny };
};

export const isSpecialOf = (
  cells: SpecialCell[],
  x: number,
  y: number,
  kind: SpecialCell['kind'],
): boolean => cells.some((c) => c.x === x && c.y === y && c.kind === kind);

export const findSpecial = (
  cells: SpecialCell[],
  x: number,
  y: number,
): SpecialCell | undefined => cells.find((c) => c.x === x && c.y === y);
