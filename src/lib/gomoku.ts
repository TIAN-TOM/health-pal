export const BOARD_SIZE = 15;

export interface GomokuWinResult {
  isWin: boolean;
  line: Array<{ row: number; col: number }>;
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

/**
 * 检查在 (row, col) 落子后是否形成五连（含超过五连的长连）。
 * 获胜时返回连线上前 5 个坐标，供界面绘制获胜连线。
 */
export const checkWin = (
  board: ReadonlyArray<ReadonlyArray<string | null>>,
  row: number,
  col: number,
  player: string,
): GomokuWinResult => {
  for (const [dx, dy] of DIRECTIONS) {
    const line: Array<{ row: number; col: number }> = [{ row, col }];

    // 向一个方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (
        newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE &&
        board[newRow][newCol] === player
      ) {
        line.push({ row: newRow, col: newCol });
      } else {
        break;
      }
    }

    // 向相反方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (
        newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE &&
        board[newRow][newCol] === player
      ) {
        line.unshift({ row: newRow, col: newCol });
      } else {
        break;
      }
    }

    if (line.length >= 5) {
      return { isWin: true, line: line.slice(0, 5) };
    }
  }

  return { isWin: false, line: [] };
};

/**
 * 评估在 (row, col) 落子对指定玩家的价值（AI 用）。
 * 已占用的位置返回 -1000。
 */
export const evaluatePosition = (
  board: ReadonlyArray<ReadonlyArray<string | null>>,
  row: number,
  col: number,
  player: string,
): number => {
  if (board[row][col] !== null) return -1000;

  let score = 0;

  for (const [dx, dy] of DIRECTIONS) {
    let consecutive = 0;
    let openEnds = 0;

    // 向一个方向检查
    let pos = 1;
    while (pos <= 4 && row + dx * pos >= 0 && row + dx * pos < BOARD_SIZE &&
           col + dy * pos >= 0 && col + dy * pos < BOARD_SIZE) {
      if (board[row + dx * pos][col + dy * pos] === player) {
        consecutive++;
        pos++;
      } else if (board[row + dx * pos][col + dy * pos] === null) {
        openEnds++;
        break;
      } else {
        break;
      }
    }

    // 向相反方向检查
    pos = 1;
    while (pos <= 4 && row - dx * pos >= 0 && row - dx * pos < BOARD_SIZE &&
           col - dy * pos >= 0 && col - dy * pos < BOARD_SIZE) {
      if (board[row - dx * pos][col - dy * pos] === player) {
        consecutive++;
        pos++;
      } else if (board[row - dx * pos][col - dy * pos] === null) {
        openEnds++;
        break;
      } else {
        break;
      }
    }

    // 根据连续数和开放性计算分数
    if (consecutive >= 4) score += 10000;
    else if (consecutive === 3 && openEnds === 2) score += 1000;
    else if (consecutive === 3 && openEnds === 1) score += 100;
    else if (consecutive === 2 && openEnds === 2) score += 50;
    else if (consecutive === 2 && openEnds === 1) score += 10;
    else if (consecutive === 1 && openEnds === 2) score += 5;
  }

  // 中心位置加分
  const centerDistance = Math.abs(row - 7) + Math.abs(col - 7);
  score += Math.max(0, 14 - centerDistance) * 2;

  return score;
};
