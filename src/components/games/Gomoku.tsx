
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, User, Bot, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

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

  const evaluatePosition = useCallback((board: number[][], row: number, col: number, player: number): number => {
    let score = 0;
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      let consecutive = 1;
      let blocked = 0;
      
      // 检查正方向
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (board[newRow][newCol] === player) {
            consecutive++;
          } else if (board[newRow][newCol] !== EMPTY) {
            blocked++;
            break;
          } else {
            break;
          }
        } else {
          blocked++;
          break;
        }
      }
      
      // 检查反方向
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (board[newRow][newCol] === player) {
            consecutive++;
          } else if (board[newRow][newCol] !== EMPTY) {
            blocked++;
            break;
          } else {
            break;
          }
        } else {
          blocked++;
          break;
        }
      }
      
      // 根据连子数和阻挡情况计算分数
      if (consecutive >= 5) {
        score += 100000;
      } else if (consecutive === 4) {
        score += blocked === 0 ? 10000 : (blocked === 1 ? 1000 : 0);
      } else if (consecutive === 3) {
        score += blocked === 0 ? 1000 : (blocked === 1 ? 100 : 0);
      } else if (consecutive === 2) {
        score += blocked === 0 ? 100 : (blocked === 1 ? 10 : 0);
      }
    }
    
    return score;
  }, []);

  const findBestMove = useCallback((board: number[][]): [number, number] => {
    let bestScore = -Infinity;
    let bestMove: [number, number] = [7, 7];

    // 首先检查AI是否有获胜机会
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          const testBoard = board.map(r => [...r]);
          testBoard[row][col] = AI;
          if (checkWin(testBoard, row, col, AI)) {
            return [row, col];
          }
        }
      }
    }

    // 然后检查是否需要阻止玩家获胜
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          const testBoard = board.map(r => [...r]);
          testBoard[row][col] = PLAYER;
          if (checkWin(testBoard, row, col, PLAYER)) {
            return [row, col];
          }
        }
      }
    }

    // 根据难度选择策略
    const candidates: Array<{ row: number; col: number; score: number }> = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          // 只考虑有邻居的位置
          let hasNeighbor = false;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== EMPTY) {
                hasNeighbor = true;
                break;
              }
            }
            if (hasNeighbor) break;
          }
          
          if (hasNeighbor || (row === 7 && col === 7)) {
            const aiScore = evaluatePosition(board, row, col, AI);
            const playerScore = evaluatePosition(board, row, col, PLAYER);
            const totalScore = aiScore + playerScore * 1.2; // 稍微偏重防守
            
            candidates.push({ row, col, score: totalScore });
          }
        }
      }
    }

    if (candidates.length === 0) return [7, 7];

    // 根据难度调整选择策略
    candidates.sort((a, b) => b.score - a.score);
    
    let selectedMove;
    switch (difficulty) {
      case 'easy':
        // 简单难度：30%选择最佳，70%随机选择前50%的候选
        if (Math.random() < 0.3) {
          selectedMove = candidates[0];
        } else {
          const topHalf = candidates.slice(0, Math.max(1, Math.floor(candidates.length / 2)));
          selectedMove = topHalf[Math.floor(Math.random() * topHalf.length)];
        }
        break;
      case 'medium':
        // 中等难度：70%选择最佳，30%选择前20%的候选
        if (Math.random() < 0.7) {
          selectedMove = candidates[0];
        } else {
          const topQuarter = candidates.slice(0, Math.max(1, Math.floor(candidates.length / 5)));
          selectedMove = topQuarter[Math.floor(Math.random() * topQuarter.length)];
        }
        break;
      case 'hard':
        // 困难难度：90%选择最佳，10%选择前10%的候选
        if (Math.random() < 0.9) {
          selectedMove = candidates[0];
        } else {
          const topTen = candidates.slice(0, Math.max(1, Math.floor(candidates.length / 10)));
          selectedMove = topTen[Math.floor(Math.random() * topTen.length)];
        }
        break;
    }

    return [selectedMove.row, selectedMove.col];
  }, [checkWin, evaluatePosition, difficulty]);

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
      const [aiRow, aiCol] = findBestMove(newBoard);
      
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
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              <span className="text-sm">难度:</span>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center mb-4 overflow-x-auto">
            <div className="relative bg-yellow-100 p-2 rounded border-2 border-gray-800 min-w-fit">
              <svg
                width="300"
                height="300"
                viewBox="0 0 300 300"
                className="w-full max-w-[300px] h-auto"
                style={{ aspectRatio: '1' }}
              >
                {/* 绘制棋盘线条 */}
                {Array.from({ length: BOARD_SIZE }, (_, i) => (
                  <g key={`lines-${i}`}>
                    {/* 横线 */}
                    <line
                      x1={10}
                      y1={10 + i * 20}
                      x2={290}
                      y2={10 + i * 20}
                      stroke="#654321"
                      strokeWidth="1"
                    />
                    {/* 竖线 */}
                    <line
                      x1={10 + i * 20}
                      y1={10}
                      x2={10 + i * 20}
                      y2={290}
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
                        cx={10 + colIndex * 20}
                        cy={10 + rowIndex * 20}
                        r="8"
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
                          cx={10 + colIndex * 20}
                          cy={10 + rowIndex * 20}
                          r="7"
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
