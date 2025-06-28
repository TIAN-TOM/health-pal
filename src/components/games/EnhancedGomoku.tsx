import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, User, Bot } from 'lucide-react';

interface EnhancedGomokuProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

type Player = 'human' | 'ai' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

const BOARD_SIZE = 15;

const EnhancedGomoku = ({ onBack, soundEnabled = true }: EnhancedGomokuProps) => {
  const [board, setBoard] = useState<Player[][]>(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('human');
  const [winner, setWinner] = useState<Player>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [winningLine, setWinningLine] = useState<Array<{row: number, col: number}>>([]);
  const [lastMove, setLastMove] = useState<{row: number, col: number} | null>(null);

  // 音效函数
  const playSound = useCallback((frequency: number, duration: number) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio context not available');
    }
  }, [soundEnabled]);

  // 检查获胜条件并返回连线信息
  const checkWinner = useCallback((board: Player[][], row: number, col: number, player: Player): {isWin: boolean, line: Array<{row: number, col: number}>} => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      const line: Array<{row: number, col: number}> = [{row, col}];
      
      // 向一个方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && 
            board[newRow][newCol] === player) {
          line.push({row: newRow, col: newCol});
        } else {
          break;
        }
      }
      
      // 向相反方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && 
            board[newRow][newCol] === player) {
          line.unshift({row: newRow, col: newCol});
        } else {
          break;
        }
      }
      
      if (line.length >= 5) {
        return {isWin: true, line: line.slice(0, 5)};
      }
    }
    
    return {isWin: false, line: []};
  }, []);

  // 评估位置价值
  const evaluatePosition = useCallback((board: Player[][], row: number, col: number, player: Player): number => {
    if (board[row][col] !== null) return -1000;
    
    let score = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    
    for (const [dx, dy] of directions) {
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
  }, []);

  // AI移动算法
  const getAIMove = useCallback((board: Player[][]): [number, number] => {
    const moves: Array<{row: number, col: number, score: number}> = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === null) {
          let score = 0;
          
          // 检查AI获胜机会
          const tempBoard = board.map(r => [...r]);
          tempBoard[row][col] = 'ai';
          if (checkWinner(tempBoard, row, col, 'ai').isWin) {
            return [row, col];
          }
          
          // 检查阻止人类获胜
          tempBoard[row][col] = 'human';
          if (checkWinner(tempBoard, row, col, 'human').isWin) {
            score += 5000;
          }
          
          const aiScore = evaluatePosition(board, row, col, 'ai');
          const humanScore = evaluatePosition(board, row, col, 'human');
          
          switch (difficulty) {
            case 'easy':
              score += aiScore * 0.5 + humanScore * 0.3 + Math.random() * 100;
              break;
            case 'medium':
              score += aiScore * 0.8 + humanScore * 0.6 + Math.random() * 50;
              break;
            case 'hard':
              score += aiScore * 1.0 + humanScore * 0.8 + Math.random() * 10;
              break;
          }
          
          moves.push({ row, col, score });
        }
      }
    }
    
    moves.sort((a, b) => b.score - a.score);
    
    let moveIndex = 0;
    if (difficulty === 'easy' && Math.random() < 0.3) {
      moveIndex = Math.min(moves.length - 1, Math.floor(Math.random() * 3));
    } else if (difficulty === 'medium' && Math.random() < 0.15) {
      moveIndex = Math.min(moves.length - 1, Math.floor(Math.random() * 2));
    }
    
    return moves.length > 0 ? [moves[moveIndex].row, moves[moveIndex].col] : [7, 7];
  }, [checkWinner, evaluatePosition, difficulty]);

  // 处理人类下棋
  const handleCellClick = useCallback((row: number, col: number) => {
    if (board[row][col] !== null || winner || currentPlayer !== 'human') return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 'human';
    setBoard(newBoard);
    setLastMove({row, col});
    
    playSound(440, 0.1);

    const winResult = checkWinner(newBoard, row, col, 'human');
    if (winResult.isWin) {
      setWinner('human');
      setWinningLine(winResult.line);
      playSound(523, 0.5);
      return;
    }

    setCurrentPlayer('ai');
  }, [board, winner, currentPlayer, checkWinner, playSound]);

  // AI自动下棋
  useEffect(() => {
    if (currentPlayer === 'ai' && !winner && gameStarted) {
      const timer = setTimeout(() => {
        const [row, col] = getAIMove(board);
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 'ai';
        setBoard(newBoard);
        setLastMove({row, col});
        
        playSound(330, 0.1);

        const winResult = checkWinner(newBoard, row, col, 'ai');
        if (winResult.isWin) {
          setWinner('ai');
          setWinningLine(winResult.line);
          playSound(196, 0.5);
          return;
        }

        setCurrentPlayer('human');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, gameStarted, board, getAIMove, checkWinner, playSound]);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentPlayer('human');
    setWinner(null);
    setGameStarted(false);
    setWinningLine([]);
    setLastMove(null);
  };

  if (!gameStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">五子棋设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">选择难度等级</h3>
              <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单 - 适合新手</SelectItem>
                  <SelectItem value="medium">中等 - 有一定挑战</SelectItem>
                  <SelectItem value="hard">困难 - 高级对手</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>你：黑子</span>
                  <div className="w-4 h-4 bg-black rounded-full ml-2 border"></div>
                </div>
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-1" />
                  <span>电脑：白子</span>
                  <div className="w-4 h-4 bg-white rounded-full ml-2 border-2 border-gray-400"></div>
                </div>
              </div>
              
              <Button onClick={startGame} className="w-full bg-blue-500 hover:bg-blue-600">
                开始游戏
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>你：黑子</span>
                <div className="w-4 h-4 bg-black rounded-full ml-2 border"></div>
              </div>
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-1" />
                <span>电脑：白子</span>
                <div className="w-4 h-4 bg-white rounded-full ml-2 border-2 border-gray-400"></div>
              </div>
            </div>
            
            <div className="text-center">
              <CardTitle>五子棋增强版</CardTitle>
              <p className="text-sm text-gray-600">难度：{
                difficulty === 'easy' ? '简单' : 
                difficulty === 'medium' ? '中等' : '困难'
              }</p>
            </div>
            
            <div className="w-20"></div>
          </div>
        </CardHeader>
        
        <CardContent>
          {winner && (
            <div className="text-center mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-bold">
                {winner === 'human' ? '🎉 恭喜！你获胜了！' : '🤖 电脑获胜了，再试一次！'}
              </h3>
            </div>
          )}
          
          {!winner && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                {currentPlayer === 'human' ? '轮到你了 (黑子)' : '电脑思考中... (白子)'}
              </p>
              {lastMove && (
                <p className="text-xs text-blue-600 mt-1">
                  上一步：{lastMove.row + 1}行 {lastMove.col + 1}列
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center mb-4">
            <div className="relative bg-amber-100 p-4 rounded-lg border-2 border-amber-200">
              <svg 
                width="360" 
                height="360" 
                className="border border-amber-300 bg-amber-50"
              >
                {/* 绘制棋盘网格线 */}
                {Array.from({ length: BOARD_SIZE }, (_, i) => (
                  <g key={`line-${i}`}>
                    {/* 横线 */}
                    <line
                      x1="12"
                      y1={12 + i * 24}
                      x2="348"
                      y2={12 + i * 24}
                      stroke="#8B4513"
                      strokeWidth="1"
                    />
                    {/* 竖线 */}
                    <line
                      x1={12 + i * 24}
                      y1="12"
                      x2={12 + i * 24}
                      y2="348"
                      stroke="#8B4513"
                      strokeWidth="1"
                    />
                  </g>
                ))}
                
                {/* 绘制获胜连线 */}
                {winningLine.length > 0 && (
                  <line
                    x1={12 + winningLine[0].col * 24}
                    y1={12 + winningLine[0].row * 24}
                    x2={12 + winningLine[winningLine.length - 1].col * 24}
                    y2={12 + winningLine[winningLine.length - 1].row * 24}
                    stroke="#FF0000"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}
                
                {/* 绘制棋子 */}
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    if (cell === null) return null;
                    
                    const x = 12 + colIndex * 24;
                    const y = 12 + rowIndex * 24;
                    const isLastMove = lastMove && lastMove.row === rowIndex && lastMove.col === colIndex;
                    
                    return (
                      <g key={`piece-${rowIndex}-${colIndex}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="10"
                          fill={cell === 'human' ? '#000000' : '#FFFFFF'}
                          stroke={cell === 'human' ? '#333333' : '#666666'}
                          strokeWidth="1"
                        />
                        {/* 最后落子标记 */}
                        {isLastMove && (
                          <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill="none"
                            stroke="#FF4500"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  })
                )}
                
                {/* 交互区域 */}
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const x = 12 + colIndex * 24;
                    const y = 12 + rowIndex * 24;
                    
                    return (
                      <circle
                        key={`click-${rowIndex}-${colIndex}`}
                        cx={x}
                        cy={y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer hover:fill-blue-100 hover:fill-opacity-30"
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        style={{
                          pointerEvents: winner || currentPlayer !== 'human' ? 'none' : 'auto'
                        }}
                      />
                    );
                  })
                )}
              </svg>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              重新开始
            </Button>
          </div>

          <div className="text-center text-xs text-gray-600 mt-4">
            <p>在线条交叉点放置棋子，连续5个即可获胜</p>
            <p>橙色圆圈表示最后一步落子位置</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedGomoku;
