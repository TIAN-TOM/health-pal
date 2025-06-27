
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, User, Bot } from 'lucide-react';

interface GomokuProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

type Player = 'human' | 'ai' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

const BOARD_SIZE = 15;

const Gomoku = ({ onBack, soundEnabled = true }: GomokuProps) => {
  const [board, setBoard] = useState<Player[][]>(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('human');
  const [winner, setWinner] = useState<Player>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

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

  // 检查获胜条件
  const checkWinner = useCallback((board: Player[][], row: number, col: number, player: Player): boolean => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      
      // 向一个方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && 
            board[newRow][newCol] === player) {
          count++;
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
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 5) {
        return true;
      }
    }
    
    return false;
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
          if (checkWinner(tempBoard, row, col, 'ai')) {
            return [row, col];
          }
          
          // 检查阻止人类获胜
          tempBoard[row][col] = 'human';
          if (checkWinner(tempBoard, row, col, 'human')) {
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
    
    playSound(440, 0.1);

    if (checkWinner(newBoard, row, col, 'human')) {
      setWinner('human');
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
        
        playSound(330, 0.1);

        if (checkWinner(newBoard, row, col, 'ai')) {
          setWinner('ai');
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
  };

  const getCellContent = (cell: Player) => {
    if (cell === 'human') return '●';
    if (cell === 'ai') return '●';
    return '';
  };

  const getCellClassName = (cell: Player) => {
    if (cell === 'human') return 'text-black text-lg font-bold';
    if (cell === 'ai') return 'text-red-600 text-lg font-bold';
    return '';
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
                  <span>你：黑子 ●</span>
                </div>
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-1" />
                  <span>电脑：红子 ●</span>
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
                <span>你：黑子 ●</span>
              </div>
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-1" />
                <span>电脑：红子 ●</span>
              </div>
            </div>
            
            <div className="text-center">
              <CardTitle>五子棋</CardTitle>
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
                {currentPlayer === 'human' ? '轮到你了 (黑子 ●)' : '电脑思考中... (红子 ●)'}
              </p>
            </div>
          )}

          <div className="flex justify-center mb-4">
            <div 
              className="relative bg-amber-100 p-2 rounded-lg border-2 border-amber-200"
              style={{
                width: 'min(90vw, 420px)',
                height: 'min(90vw, 420px)'
              }}
            >
              {/* 绘制棋盘线条 */}
              <svg 
                className="absolute inset-2 w-full h-full"
                viewBox="0 0 280 280"
                style={{ width: 'calc(100% - 16px)', height: 'calc(100% - 16px)' }}
              >
                {/* 横线 */}
                {Array.from({ length: BOARD_SIZE }, (_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="10"
                    y1={10 + i * 18.57}
                    x2="270"
                    y2={10 + i * 18.57}
                    stroke="#8B4513"
                    strokeWidth="1"
                  />
                ))}
                {/* 竖线 */}
                {Array.from({ length: BOARD_SIZE }, (_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={10 + i * 18.57}
                    y1="10"
                    x2={10 + i * 18.57}
                    y2="270"
                    stroke="#8B4513"
                    strokeWidth="1"
                  />
                ))}
              </svg>
              
              {/* 棋子 */}
              <div className="absolute inset-2 grid grid-cols-15 gap-0"
                   style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className="w-full aspect-square flex items-center justify-center hover:bg-amber-200/50 rounded-full transition-colors"
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={winner !== null || currentPlayer !== 'human'}
                    >
                      <span className={getCellClassName(cell)}>
                        {getCellContent(cell)}
                      </span>
                    </button>
                  ))
                )}
              </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Gomoku;
