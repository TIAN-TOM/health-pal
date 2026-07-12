import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, User, Bot, Palette, Undo } from 'lucide-react';
import { checkGomokuSkinUnlocked, getSkinPreference, setSkinPreference } from '@/services/skinService';
import { BOARD_SIZE, checkWin, evaluatePosition } from '@/lib/gomoku';

interface EnhancedGomokuProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

type Player = 'human' | 'ai' | null;
type Difficulty = 'easy' | 'medium' | 'hard';
type SkinType = 'default' | 'classic' | 'modern' | 'retro';

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
  const [skinUnlocked, setSkinUnlocked] = useState(false);
  const [currentSkin, setCurrentSkin] = useState<SkinType>('default');
  const [moveHistory, setMoveHistory] = useState<Array<{row: number, col: number, player: Player, board: Player[][]}>>([]);

  useEffect(() => {
    const loadSkinStatus = async () => {
      const unlocked = await checkGomokuSkinUnlocked();
      setSkinUnlocked(unlocked);
      
      const savedSkin = getSkinPreference('gomoku') as SkinType;
      if (savedSkin === 'classic' && unlocked) {
        setCurrentSkin('classic');
      }
    };
    
    loadSkinStatus();
  }, []);

  const handleSkinChange = (skin: SkinType) => {
    if (skin === 'classic' && !skinUnlocked) return;
    setCurrentSkin(skin);
    setSkinPreference('gomoku', skin);
  };

  const getSkinStyles = () => {
    switch (currentSkin) {
      case 'classic':
        return {
          boardBg: 'bg-amber-100',
          boardBorder: 'border-amber-300',
          innerBg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
          lineColor: '#8B4513',
          containerBg: 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-100',
          containerBorder: 'border-amber-400'
        };
      case 'modern':
        return {
          boardBg: 'bg-slate-100',
          boardBorder: 'border-slate-300',
          innerBg: 'bg-gradient-to-br from-slate-50 to-gray-100',
          lineColor: '#334155',
          containerBg: 'bg-gradient-to-br from-slate-200 via-gray-100 to-slate-100',
          containerBorder: 'border-slate-400'
        };
      case 'retro':
        return {
          boardBg: 'bg-emerald-100',
          boardBorder: 'border-emerald-300',
          innerBg: 'bg-gradient-to-br from-emerald-50 to-green-100',
          lineColor: '#065f46',
          containerBg: 'bg-gradient-to-br from-emerald-200 via-green-100 to-emerald-100',
          containerBorder: 'border-emerald-400'
        };
      default:
        return {
          boardBg: 'bg-amber-100',
          boardBorder: 'border-amber-200',
          innerBg: 'bg-amber-50',
          lineColor: '#8B4513',
          containerBg: 'bg-amber-100',
          containerBorder: 'border-amber-200'
        };
    }
  };

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
          if (checkWin(tempBoard, row, col, 'ai').isWin) {
            return [row, col];
          }

          // 检查阻止人类获胜
          tempBoard[row][col] = 'human';
          if (checkWin(tempBoard, row, col, 'human').isWin) {
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
  }, [difficulty]);

  // 悔棋功能
  const undoMove = useCallback(() => {
    if (moveHistory.length === 0 || winner) return;
    
    const lastHistory = moveHistory[moveHistory.length - 1];
    setBoard(lastHistory.board);
    setMoveHistory(prev => prev.slice(0, -1));
    setCurrentPlayer('human');
    setLastMove(moveHistory.length > 1 ? moveHistory[moveHistory.length - 2] : null);
    setWinner(null);
    setWinningLine([]);
    
    playSound(330, 0.1);
  }, [moveHistory, winner, playSound]);

  // 处理人类下棋
  const handleCellClick = useCallback((row: number, col: number) => {
    if (board[row][col] !== null || winner || currentPlayer !== 'human') return;

    // 保存当前状态到历史记录
    setMoveHistory(prev => [...prev, {row, col, player: 'human', board: board.map(r => [...r])}]);

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 'human';
    setBoard(newBoard);
    setLastMove({row, col});
    
    playSound(440, 0.1);

    const winResult = checkWin(newBoard, row, col, 'human');
    if (winResult.isWin) {
      setWinner('human');
      setWinningLine(winResult.line);
      playSound(523, 0.5);
      return;
    }

    setCurrentPlayer('ai');
  }, [board, winner, currentPlayer, playSound]);

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

        const winResult = checkWin(newBoard, row, col, 'ai');
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
  }, [currentPlayer, winner, gameStarted, board, getAIMove, playSound]);

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
    setMoveHistory([]);
  };

  const skinStyles = getSkinStyles();

  if (!gameStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">五子棋</CardTitle>
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

            {/* 皮肤选择 */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                <Palette className="h-5 w-5 mr-2" />
                选择皮肤
              </h3>
              <Select value={currentSkin} onValueChange={handleSkinChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">默认木质皮肤</SelectItem>
                  <SelectItem value="classic" disabled={!skinUnlocked}>
                    经典木质皮肤 {!skinUnlocked && '(需要积分商城解锁)'}
                  </SelectItem>
                  <SelectItem value="modern">现代灰调皮肤</SelectItem>
                  <SelectItem value="retro">复古绿调皮肤</SelectItem>
                </SelectContent>
              </Select>
              {!skinUnlocked && (
                <p className="text-sm text-gray-600 mt-2">
                  前往积分商城购买"五子棋经典皮肤"解锁更多皮肤选项
                </p>
              )}
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
              <CardTitle>五子棋</CardTitle>
              <p className="text-sm text-gray-600">
                {difficulty === 'easy' ? '简单' : 
                 difficulty === 'medium' ? '中等' : '困难'} | 
                {currentSkin === 'classic' ? '经典皮肤' : 
                 currentSkin === 'modern' ? '现代皮肤' :
                 currentSkin === 'retro' ? '复古皮肤' : '默认皮肤'}
              </p>
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
            <div className={`relative p-4 rounded-lg border-2 ${skinStyles.containerBg} ${skinStyles.containerBorder}`}>
              <svg 
                width="360" 
                height="360" 
                className={`border ${skinStyles.boardBorder} ${skinStyles.innerBg}`}
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
                      stroke={skinStyles.lineColor}
                      strokeWidth="1"
                    />
                    {/* 竖线 */}
                    <line
                      x1={12 + i * 24}
                      y1="12"
                      x2={12 + i * 24}
                      y2="348"
                      stroke={skinStyles.lineColor}
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
            <Button 
              onClick={undoMove} 
              variant="outline" 
              disabled={moveHistory.length === 0 || winner !== null || currentPlayer !== 'human'}
            >
              <Undo className="h-4 w-4 mr-2" />
              悔棋
            </Button>
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
