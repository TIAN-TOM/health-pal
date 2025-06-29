
import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Clock, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnhancedGomokuProps {
  onBack: () => void;
  soundEnabled: boolean;
}

type Player = 'black' | 'white' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  board: Player[][];
  currentPlayer: Player;
  winner: Player;
  gameOver: boolean;
  moves: number;
  gameTime: number;
  isThinking: boolean;
}

interface PowerUp {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  cost: number;
  uses: number;
}

const EnhancedGomoku = ({ onBack, soundEnabled }: EnhancedGomokuProps) => {
  const BOARD_SIZE = 15;
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    currentPlayer: 'black',
    winner: null,
    gameOver: false,
    moves: 0,
    gameTime: 0,
    isThinking: false
  });
  
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [coins, setCoins] = useState(() => {
    return parseInt(localStorage.getItem('gomoku-coins') || '100');
  });
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: 'hint',
      name: '提示',
      icon: <Zap className="h-4 w-4" />,
      description: '显示最佳落子位置',
      cost: 10,
      uses: 3
    },
    {
      id: 'undo',
      name: '悔棋',
      icon: <RotateCcw className="h-4 w-4" />,
      description: '撤销上一步',
      cost: 15,
      uses: 2
    }
  ]);
  const [gameHistory, setGameHistory] = useState<Player[][][]>([]);
  const [hintPosition, setHintPosition] = useState<{row: number, col: number} | null>(null);
  const [lastMove, setLastMove] = useState<{row: number, col: number} | null>(null);

  // 播放音效
  const playSound = (type: 'move' | 'win' | 'lose' | 'hint') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    let frequency = 440;
    let duration = 0.2;
    
    switch (type) {
      case 'move':
        frequency = 523;
        duration = 0.1;
        break;
      case 'win':
        frequency = 880;
        duration = 0.5;
        break;
      case 'lose':
        frequency = 220;
        duration = 0.5;
        break;
      case 'hint':
        frequency = 659;
        duration = 0.3;
        break;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // 检查获胜条件
  const checkWinner = useCallback((board: Player[][], row: number, col: number, player: Player): boolean => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      
      // 检查正方向
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      
      // 检查反方向
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      
      if (count >= 5) return true;
    }
    return false;
  }, []);

  // AI评估函数
  const evaluatePosition = useCallback((board: Player[][], row: number, col: number, player: Player): number => {
    if (board[row][col] !== null) return -1000;
    
    let score = 0;
    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dx, dy] of directions) {
      // 评估该位置对己方的价值
      let playerCount = 0;
      let opponentCount = 0;
      let playerBlocked = false;
      let opponentBlocked = false;

      // 检查正方向
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
          playerBlocked = true;
          opponentBlocked = true;
          break;
        }
        if (board[newRow][newCol] === player) playerCount++;
        else if (board[newRow][newCol] === opponent) {
          opponentBlocked = true;
          break;
        } else break;
      }

      // 检查反方向
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
          playerBlocked = true;
          opponentBlocked = true;
          break;
        }
        if (board[newRow][newCol] === player) playerCount++;
        else if (board[newRow][newCol] === opponent) {
          playerBlocked = true;
          break;
        } else break;
      }

      // 根据连子数量和是否被阻挡给分
      if (playerCount >= 4) score += 10000; // 即将获胜
      else if (playerCount === 3 && !playerBlocked) score += 1000; // 活三
      else if (playerCount === 3) score += 100; // 死三
      else if (playerCount === 2 && !playerBlocked) score += 50; // 活二
      else if (playerCount === 1 && !playerBlocked) score += 10; // 活一

      if (opponentCount >= 4) score += 5000; // 阻止对手获胜
      else if (opponentCount === 3 && !opponentBlocked) score += 500; // 阻止对手活三
    }

    // 中心位置加分
    const centerDistance = Math.abs(row - 7) + Math.abs(col - 7);
    score += (14 - centerDistance) * 2;

    return score;
  }, []);

  // AI下棋
  const makeAIMove = useCallback((board: Player[][]) => {
    let bestScore = -Infinity;
    let bestMove = { row: 7, col: 7 }; // 默认中心位置
    const aiPlayer = 'white';
    const humanPlayer = 'black';

    // 根据难度调整搜索范围
    const searchRadius = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    
    // 找到所有已下的棋子位置
    const occupiedPositions: Array<{row: number, col: number}> = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] !== null) {
          occupiedPositions.push({row: i, col: j});
        }
      }
    }

    // 如果是第一步，下在中心
    if (occupiedPositions.length === 1) {
      const moves = [
        {row: 7, col: 8}, {row: 8, col: 7}, {row: 6, col: 7}, {row: 7, col: 6}
      ];
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      if (board[randomMove.row][randomMove.col] === null) {
        return randomMove;
      }
    }

    // 生成候选位置（在已有棋子周围）
    const candidates = new Set<string>();
    
    for (const pos of occupiedPositions) {
      for (let dr = -searchRadius; dr <= searchRadius; dr++) {
        for (let dc = -searchRadius; dc <= searchRadius; dc++) {
          const newRow = pos.row + dr;
          const newCol = pos.col + dc;
          if (newRow >= 0 && newRow < BOARD_SIZE && 
              newCol >= 0 && newCol < BOARD_SIZE && 
              board[newRow][newCol] === null) {
            candidates.add(`${newRow},${newCol}`);
          }
        }
      }
    }

    // 评估每个候选位置
    for (const posStr of candidates) {
      const [row, col] = posStr.split(',').map(Number);
      
      // 先检查是否能直接获胜
      const tempBoard = board.map(row => [...row]);
      tempBoard[row][col] = aiPlayer;
      if (checkWinner(tempBoard, row, col, aiPlayer)) {
        return { row, col }; // 直接获胜
      }
      
      // 再检查是否需要阻止对手获胜
      tempBoard[row][col] = humanPlayer;
      if (checkWinner(tempBoard, row, col, humanPlayer)) {
        bestScore = 9999;
        bestMove = { row, col }; // 阻止对手获胜
        continue;
      }
      
      // 正常评估
      const score = evaluatePosition(board, row, col, aiPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestMove = { row, col };
      }
    }

    return bestMove;
  }, [checkWinner, evaluatePosition, difficulty]);

  // 处理玩家下棋
  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameOver || gameState.board[row][col] !== null || gameState.isThinking) return;
    if (gameState.currentPlayer !== 'black') return; // 只允许玩家（黑棋）下棋

    playSound('move');
    
    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = 'black';
    
    // 保存历史
    setGameHistory(prev => [...prev, gameState.board.map(r => [...r])]);
    setLastMove({ row, col });
    setHintPosition(null); // 清除提示

    // 检查玩家是否获胜
    if (checkWinner(newBoard, row, col, 'black')) {
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        winner: 'black',
        gameOver: true,
        moves: prev.moves + 1
      }));
      
      // 奖励金币
      const reward = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
      setCoins(prev => {
        const newCoins = prev + reward;
        localStorage.setItem('gomoku-coins', newCoins.toString());
        return newCoins;
      });
      
      playSound('win');
      return;
    }

    // 切换到AI回合
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: 'white',
      moves: prev.moves + 1,
      isThinking: true
    }));

    // AI延迟下棋
    setTimeout(() => {
      const aiMove = makeAIMove(newBoard);
      const aiBoard = newBoard.map(r => [...r]);
      aiBoard[aiMove.row][aiMove.col] = 'white';

      // 检查AI是否获胜
      if (checkWinner(aiBoard, aiMove.row, aiMove.col, 'white')) {
        setGameState(prev => ({
          ...prev,
          board: aiBoard,
          winner: 'white',
          gameOver: true,
          currentPlayer: 'black',
          isThinking: false,
          moves: prev.moves + 1
        }));
        playSound('lose');
      } else {
        setGameState(prev => ({
          ...prev,
          board: aiBoard,
          currentPlayer: 'black',
          isThinking: false,
          moves: prev.moves + 1
        }));
      }
      setLastMove(aiMove);
    }, difficulty === 'easy' ? 500 : difficulty === 'medium' ? 1000 : 1500);
  };

  // 重新开始游戏
  const resetGame = () => {
    setGameState({
      board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
      currentPlayer: 'black',
      winner: null,
      gameOver: false,
      moves: 0,
      gameTime: 0,
      isThinking: false
    });
    setGameHistory([]);
    setHintPosition(null);
    setLastMove(null);
  };

  // 使用道具
  const usePowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp || powerUp.uses <= 0 || coins < powerUp.cost) return;

    setCoins(prev => {
      const newCoins = prev - powerUp.cost;
      localStorage.setItem('gomoku-coins', newCoins.toString());
      return newCoins;
    });

    setPowerUps(prev => prev.map(p => 
      p.id === powerUpId ? { ...p, uses: p.uses - 1 } : p
    ));

    if (powerUpId === 'hint') {
      // 显示最佳落子位置
      const bestMove = makeAIMove(gameState.board);
      setHintPosition(bestMove);
      playSound('hint');
      
      // 3秒后清除提示
      setTimeout(() => setHintPosition(null), 3000);
    } else if (powerUpId === 'undo' && gameHistory.length > 0) {
      // 悔棋（撤销玩家和AI的最近两步）
      const previousBoard = gameHistory[gameHistory.length - 1];
      setGameState(prev => ({
        ...prev,
        board: previousBoard,
        currentPlayer: 'black',
        moves: Math.max(0, prev.moves - 2),
        isThinking: false
      }));
      setGameHistory(prev => prev.slice(0, -1));
      setLastMove(null);
    }
  };

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!gameState.gameOver && gameState.moves > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.gameOver, gameState.moves]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyText = (level: Difficulty) => {
    const map = { easy: '简单', medium: '中等', hard: '困难' };
    return map[level];
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {/* 状态栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-lg shadow-sm space-y-2 sm:space-y-0">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="font-mono text-xs sm:text-base">{formatTime(gameState.gameTime)}</span>
          </div>
          <div className="text-xs sm:text-base">步数: {gameState.moves}</div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-black mr-1"></div>
            <span className="text-xs sm:text-base">你 vs</span>
            <div className="w-3 h-3 rounded-full bg-white border border-gray-400 mx-1"></div>
            <span className="text-xs sm:text-base">电脑</span>
          </div>
          {gameState.isThinking && (
            <div className="flex items-center text-blue-600 text-xs sm:text-base">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-pulse" />
              思考中...
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-yellow-600 font-bold text-xs sm:text-base">💰 {coins}</div>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="px-2 py-1 border rounded text-xs sm:text-sm"
            disabled={gameState.moves > 0}
          >
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
          <Button
            onClick={resetGame}
            size="sm"
            variant="outline"
            className="text-xs px-2"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            重新开始
          </Button>
        </div>
      </div>

      {/* 道具栏 */}
      <div className="flex justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
        {powerUps.map(powerUp => (
          <Button
            key={powerUp.id}
            onClick={() => usePowerUp(powerUp.id)}
            disabled={powerUp.uses <= 0 || coins < powerUp.cost || gameState.gameOver}
            variant="outline"
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
            title={powerUp.description}
          >
            {powerUp.icon}
            <span className="text-xs">{powerUp.name}</span>
            <span className="text-xs text-yellow-600">💰{powerUp.cost}</span>
            <Badge variant="secondary" className="text-xs">
              {powerUp.uses}次
            </Badge>
          </Button>
        ))}
      </div>

      {/* 游戏结束提示 */}
      {gameState.gameOver && (
        <Card className={`${gameState.winner === 'black' ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'}`}>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl mb-2">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 inline mr-2 text-yellow-600" />
              {gameState.winner === 'black' ? '恭喜获胜！🎉' : '电脑获胜！🤖'}
            </div>
            <div className="space-y-1 text-sm">
              <div>难度: {getDifficultyText(difficulty)}</div>
              <div>用时: {formatTime(gameState.gameTime)}</div>
              <div>总步数: {gameState.moves}</div>
              {gameState.winner === 'black' && (
                <div className="text-yellow-600 font-bold">
                  获得金币: +{difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20}💰
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 五子棋棋盘 */}
      <div className="flex justify-center">
        <div 
          className="bg-yellow-100 p-2 sm:p-4 rounded-lg shadow-lg inline-block overflow-auto"
          style={{ maxWidth: '100vw' }}
        >
          <div 
            className="grid gap-0 bg-yellow-200 rounded"
            style={{ 
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              width: 'min(90vw, 500px)',
              height: 'min(90vw, 500px)'
            }}
          >
            {gameState.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isLastMove = lastMove && lastMove.row === rowIndex && lastMove.col === colIndex;
                const isHint = hintPosition && hintPosition.row === rowIndex && hintPosition.col === colIndex;
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      relative border border-yellow-800 cursor-pointer hover:bg-yellow-300 transition-colors
                      flex items-center justify-center aspect-square
                      ${isHint ? 'bg-blue-200 animate-pulse' : ''}
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    style={{ 
                      width: `min(${90/BOARD_SIZE}vw, ${500/BOARD_SIZE}px)`,
                      height: `min(${90/BOARD_SIZE}vw, ${500/BOARD_SIZE}px)`
                    }}
                  >
                    {cell && (
                      <div 
                        className={`
                          rounded-full transition-all duration-200
                          ${cell === 'black' 
                            ? 'bg-black' 
                            : 'bg-white border-2 border-gray-400'
                          }
                          ${isLastMove && cell === 'black' 
                            ? 'ring-4 ring-red-500 ring-opacity-80' 
                            : ''
                          }
                          ${isLastMove && cell === 'white' 
                            ? 'ring-4 ring-blue-500 ring-opacity-80' 
                            : ''
                          }
                        `}
                        style={{ 
                          width: `min(${70/BOARD_SIZE}vw, ${350/BOARD_SIZE}px)`,
                          height: `min(${70/BOARD_SIZE}vw, ${350/BOARD_SIZE}px)`
                        }}
                      />
                    )}
                    {isHint && !cell && (
                      <div 
                        className="rounded-full bg-blue-400 opacity-60 animate-bounce"
                        style={{ 
                          width: `min(${70/BOARD_SIZE}vw, ${350/BOARD_SIZE}px)`,
                          height: `min(${70/BOARD_SIZE}vw, ${350/BOARD_SIZE}px)`
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 游戏说明 */}
      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-600">
        <h3 className="font-medium mb-2">⚫ 游戏说明：</h3>
        <ul className="space-y-1">
          <li>• 你执黑子先行，电脑执白子</li>
          <li>• 最先连成5子的一方获胜</li>
          <li>• 可以使用道具获得优势</li>
          <li>• 击败更高难度获得更多金币</li>
          <li>• 红框标记最后落子位置</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedGomoku;
