import { describe, it, expect } from "vitest";

import { BOARD_SIZE, checkWin, evaluatePosition } from "../gomoku";

type Cell = { row: number; col: number };

const emptyBoard = (): (string | null)[][] =>
  Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

const boardWith = (stones: Array<[number, number, string]>): (string | null)[][] => {
  const board = emptyBoard();
  for (const [row, col, player] of stones) {
    board[row][col] = player;
  }
  return board;
};

const stonesInRow = (
  start: Cell,
  delta: Cell,
  count: number,
  player: string,
): Array<[number, number, string]> =>
  Array.from({ length: count }, (_, i): [number, number, string] => [
    start.row + delta.row * i,
    start.col + delta.col * i,
    player,
  ]);

describe("checkWin", () => {
  it.each([
    {
      name: "horizontal five in the middle",
      stones: stonesInRow({ row: 7, col: 3 }, { row: 0, col: 1 }, 5, "human"),
      lastMove: { row: 7, col: 7 },
      player: "human",
      expectedWin: true,
      expectedLine: stonesInRow({ row: 7, col: 3 }, { row: 0, col: 1 }, 5, "human"),
    },
    {
      name: "vertical five in the middle",
      stones: stonesInRow({ row: 4, col: 9 }, { row: 1, col: 0 }, 5, "ai"),
      lastMove: { row: 8, col: 9 },
      player: "ai",
      expectedWin: true,
      expectedLine: stonesInRow({ row: 4, col: 9 }, { row: 1, col: 0 }, 5, "ai"),
    },
    {
      name: "diagonal (down-right) five",
      stones: stonesInRow({ row: 3, col: 3 }, { row: 1, col: 1 }, 5, "host"),
      lastMove: { row: 5, col: 5 },
      player: "host",
      expectedWin: true,
      expectedLine: stonesInRow({ row: 3, col: 3 }, { row: 1, col: 1 }, 5, "host"),
    },
    {
      name: "anti-diagonal (down-left) five",
      stones: stonesInRow({ row: 3, col: 10 }, { row: 1, col: -1 }, 5, "guest"),
      lastMove: { row: 7, col: 6 },
      player: "guest",
      expectedWin: true,
      expectedLine: stonesInRow({ row: 3, col: 10 }, { row: 1, col: -1 }, 5, "guest"),
    },
    {
      name: "horizontal five hugging the left edge",
      stones: stonesInRow({ row: 0, col: 0 }, { row: 0, col: 1 }, 5, "human"),
      lastMove: { row: 0, col: 0 },
      player: "human",
      expectedWin: true,
      expectedLine: stonesInRow({ row: 0, col: 0 }, { row: 0, col: 1 }, 5, "human"),
    },
    {
      name: "vertical five ending at the bottom edge",
      stones: stonesInRow({ row: 10, col: 14 }, { row: 1, col: 0 }, 5, "ai"),
      lastMove: { row: 14, col: 14 },
      player: "ai",
      expectedWin: true,
      expectedLine: stonesInRow({ row: 10, col: 14 }, { row: 1, col: 0 }, 5, "ai"),
    },
    {
      name: "diagonal five ending at the bottom-right corner",
      stones: stonesInRow({ row: 10, col: 10 }, { row: 1, col: 1 }, 5, "human"),
      lastMove: { row: 14, col: 14 },
      player: "human",
      expectedWin: true,
      expectedLine: stonesInRow({ row: 10, col: 10 }, { row: 1, col: 1 }, 5, "human"),
    },
    {
      name: "overline (six in a row) still counts as a win",
      stones: stonesInRow({ row: 7, col: 2 }, { row: 0, col: 1 }, 6, "human"),
      lastMove: { row: 7, col: 4 },
      player: "human",
      expectedWin: true,
      // Line is built outward from the last move, then truncated to 5 cells
      expectedLine: stonesInRow({ row: 7, col: 2 }, { row: 0, col: 1 }, 5, "human"),
    },
    {
      name: "only four in a row is not a win",
      stones: stonesInRow({ row: 7, col: 3 }, { row: 0, col: 1 }, 4, "human"),
      lastMove: { row: 7, col: 6 },
      player: "human",
      expectedWin: false,
      expectedLine: [],
    },
    {
      name: "run of five broken by an opponent stone is not a win",
      stones: [
        ...stonesInRow({ row: 7, col: 3 }, { row: 0, col: 1 }, 2, "human"),
        [7, 5, "ai"] as [number, number, string],
        ...stonesInRow({ row: 7, col: 6 }, { row: 0, col: 1 }, 2, "human"),
      ],
      lastMove: { row: 7, col: 7 },
      player: "human",
      expectedWin: false,
      expectedLine: [],
    },
    {
      name: "single stone is not a win",
      stones: [[7, 7, "human"] as [number, number, string]],
      lastMove: { row: 7, col: 7 },
      player: "human",
      expectedWin: false,
      expectedLine: [],
    },
    {
      name: "four in a row at the edge cannot extend off the board",
      stones: stonesInRow({ row: 0, col: 11 }, { row: 0, col: 1 }, 4, "ai"),
      lastMove: { row: 0, col: 14 },
      player: "ai",
      expectedWin: false,
      expectedLine: [],
    },
  ])("$name", ({ stones, lastMove, player, expectedWin, expectedLine }) => {
    const board = boardWith(stones);
    const result = checkWin(board, lastMove.row, lastMove.col, player);

    expect(result.isWin).toBe(expectedWin);
    if (expectedWin) {
      expect(result.line).toHaveLength(5);
      expect(result.line).toEqual(
        expectedLine.map(([row, col]) => ({ row, col })),
      );
    } else {
      expect(result.line).toEqual([]);
    }
  });

  it("detects a win when the last move fills the middle of the run", () => {
    const board = boardWith([
      ...stonesInRow({ row: 7, col: 3 }, { row: 0, col: 1 }, 2, "human"),
      ...stonesInRow({ row: 7, col: 6 }, { row: 0, col: 1 }, 2, "human"),
      [7, 5, "human"],
    ]);

    const result = checkWin(board, 7, 5, "human");

    expect(result.isWin).toBe(true);
    expect(result.line).toEqual(
      stonesInRow({ row: 7, col: 3 }, { row: 0, col: 1 }, 5, "human").map(
        ([row, col]) => ({ row, col }),
      ),
    );
  });
});

describe("evaluatePosition", () => {
  it("returns -1000 for an occupied cell", () => {
    const board = boardWith([[7, 7, "ai"]]);
    expect(evaluatePosition(board, 7, 7, "ai")).toBe(-1000);
  });

  it("scores completing an open four higher than extending a pair", () => {
    const fourBoard = boardWith(
      stonesInRow({ row: 7, col: 3 }, { row: 0, col: 1 }, 4, "ai"),
    );
    const pairBoard = boardWith(
      stonesInRow({ row: 7, col: 5 }, { row: 0, col: 1 }, 2, "ai"),
    );

    const fourScore = evaluatePosition(fourBoard, 7, 7, "ai");
    const pairScore = evaluatePosition(pairBoard, 7, 7, "ai");

    expect(fourScore).toBeGreaterThan(pairScore);
    expect(fourScore).toBeGreaterThanOrEqual(10000);
  });

  it("prefers the board centre on an empty board", () => {
    const board = emptyBoard();
    expect(evaluatePosition(board, 7, 7, "human")).toBeGreaterThan(
      evaluatePosition(board, 0, 0, "human"),
    );
  });
});
