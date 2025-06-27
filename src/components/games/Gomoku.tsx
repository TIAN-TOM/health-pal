import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, User, Bot } from 'lucide-react';

interface GomokuProps {
  onBack: () => void;
}

const BOARD_SIZE = 15;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;

const Gomoku = ({ onBack }: GomokuProps) => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
  );
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [gameStatus, setGameStatus] = useState<'playing' | 'player-win' | 'ai-win' | 'draw'>('playing');
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  const checkWin = useCallback((board: number[][], row: number, col: number, player: number): boolean => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      
      // 检查正方向
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && board[newRow][newCol] === player) {
          count++;
        } else {
          break;
        }
      }
      
      // 检查反方向
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && board[newRow][newCol] === player) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 5) return true;
    }
    
    return false;
  }, []);

  const evaluatePosition = useCallback((board: number[][], row: number, col: number): number => {
    let score = 0;
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      // 检查AI的连子
      let aiCount = 0;
      let playerCount = 0;
      
      for (let i = -4; i <= 4; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (board[newRow][newCol] === AI) aiCount++;
          else if (board[newRow][newCol] === PLAYER) playerCount++;
        }
      }
      
      if (playerCount === 0) score += aiCount * aiCount;
      if (aiCount === 0) score -= playerCount * playerCount;
    }
    
    return score;
  }, []);

  const findBestMove = useCallback((board: number[][]): [number, number] => {
    let bestScore = -Infinity;
    let bestMove: [number, number] = [0, 0];

    // 首先检查是否有获胜机会
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          board[row][col] = AI;
          if (checkWin(board, row, col, AI)) {
            board[row][col] = EMPTY;
            return [row, col];
          }
          board[row][col] = EMPTY;
        }
      }
    }

    // 然后检查是否需要阻止玩家获胜
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          board[row][col] = PLAYER;
          if (checkWin(board, row, col, PLAYER)) {
            board[row][col] = EMPTY;
            return [row, col];
          }
          board[row][col] = EMPTY;
        }
      }
    }

    // 否则选择评分最高的位置
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          const score = evaluatePosition(board, row, col);
          if (score > bestScore) {
            bestScore = score;
            bestMove = [row, col];
          }
        }
      }
    }

    return bestMove;
  }, [checkWin, evaluatePosition]);

  const handleIntersectionClick = (row: number, col: number) => {
    if (board[row][col] !== EMPTY || gameStatus !== 'playing' || currentPlayer !== PLAYER) {
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = PLAYER;
    setBoard(newBoard);

    if (checkWin(newBoard, row, col, PLAYER)) {
      setGameStatus('player-win');
      setScores(prev => ({ ...prev, player: prev.player + 1 }));
      return;
    }

    // 检查是否平局
    const isFull = newBoard.every(row => row.every(cell => cell !== EMPTY));
    if (isFull) {
      setGameStatus('draw');
      return;
    }

    setCurrentPlayer(AI);

    // AI 回合
    setTimeout(() => {
      // 简化AI逻辑，降低难度
      const emptyCells: [number, number][] = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (newBoard[r][c] === EMPTY) {
            emptyCells.push([r, c]);
          }
        }
      }
      
      // 随机选择一个空位，降低AI难度
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [aiRow, aiCol] = emptyCells[randomIndex];
      
      newBoard[aiRow][aiCol] = AI;
      setBoard([...newBoard]);

      if (checkWin(newBoard, aiRow, aiCol, AI)) {
        setGameStatus('ai-win');
        setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
      } else {
        setCurrentPlayer(PLAYER);
      }
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY)));
    setCurrentPlayer(PLAYER);
    setGameStatus('playing');
  };

  const resetScores = () => {
    setScores({ player: 0, ai: 0 });
    resetGame();
  };

  const getCellContent = (cell: number) => {
    if (cell === PLAYER) return '⚫';
    if (cell === AI) return '⚪';
    return '';
  };

  const getStatusText = () => {
    switch (gameStatus) {
      case 'player-win': return '🎉 您获胜了！';
      case 'ai-win': return '🤖 电脑获胜！';
      case 'draw': return '🤝 平局！';
      default: return currentPlayer === PLAYER ? '轮到您下棋' : '电脑思考中...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold text-sm sm:text-base">您: {scores.player}</span>
              </div>
              <div className="text-sm sm:text-lg font-bold">{getStatusText()}</div>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold text-sm sm:text-base">电脑: {scores.ai}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-4 overflow-x-auto">
            <div className="relative bg-yellow-100 p-2 rounded border-2 border-gray-800 min-w-fit">
              <svg
                width="360"
                height="360"
                viewBox="0 0 360 360"
                className="w-full max-w-[360px] h-auto"
                style={{ aspectRatio: '1' }}
              >
                {/* 绘制棋盘线条 */}
                {Array.from({ length: BOARD_SIZE }, (_, i) => (
                  <g key={`lines-${i}`}>
                    {/* 横线 */}
                    <line
                      x1={12}
                      y1={12 + i * 24}
                      x2={348}
                      y2={12 + i * 24}
                      stroke="#654321"
                      strokeWidth="1"
                    />
                    {/* 竖线 */}
                    <line
                      x1={12 + i * 24}
                      y1={12}
                      x2={12 + i * 24}
                      y2={348}
                      stroke="#654321"
                      strokeWidth="1"
                    />
                  </g>
                ))}
                
                {/* 绘制棋盘上的棋子和交叉点 */}
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <g key={`${rowIndex}-${colIndex}`}>
                      {/* 可点击的交叉点区域 */}
                      <circle
                        cx={12 + colIndex * 24}
                        cy={12 + rowIndex * 24}
                        r="10"
                        fill="transparent"
                        stroke="transparent"
                        className="cursor-pointer hover:fill-gray-200"
                        onClick={() => handleIntersectionClick(rowIndex, colIndex)}
                        style={{ 
                          pointerEvents: cell === EMPTY && gameStatus === 'playing' && currentPlayer === PLAYER ? 'auto' : 'none' 
                        }}
                      />
                      
                      {/* 棋子 */}
                      {cell !== EMPTY && (
                        <circle
                          cx={12 + colIndex * 24}
                          cy={12 + rowIndex * 24}
                          r="8"
                          fill={cell === PLAYER ? "#000" : "#fff"}
                          stroke={cell === PLAYER ? "#000" : "#333"}
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  ))
                )}
              </svg>
            </div>
          </div>

          <div className="flex justify-center gap-2 sm:gap-4">
            <Button onClick={resetGame} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              重新开始
            </Button>
            <Button onClick={resetScores} variant="outline" size="sm">
              重置分数
            </Button>
          </div>

          <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
            <p>点击线条交叉点下棋，连成5个同色棋子即可获胜</p>
            <p>⚫ 代表您的棋子，⚪ 代表电脑的棋子</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Gomoku;
