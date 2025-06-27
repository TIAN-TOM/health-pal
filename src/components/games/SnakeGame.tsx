
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SnakeGameProps {
  onBack: () => void;
}

const BOARD_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const SnakeGame = ({ onBack }: SnakeGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake-high-score') || '0');
  });

  const gameRef = useRef({
    snake: INITIAL_SNAKE,
    direction: INITIAL_DIRECTION,
    food: { x: 15, y: 15 },
    gameSpeed: 200,
    lastMoveTime: 0
  });

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (gameRef.current.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    gameRef.current.snake = [...INITIAL_SNAKE];
    gameRef.current.direction = { ...INITIAL_DIRECTION };
    gameRef.current.food = generateFood();
    gameRef.current.gameSpeed = 200;
    gameRef.current.lastMoveTime = Date.now();
  };

  const pauseGame = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
  };

  const changeDirection = useCallback((newDirection: { x: number; y: number }) => {
    if (gameState !== 'playing') return;
    const { direction } = gameRef.current;
    
    // 防止反向移动
    if (direction.x !== 0 && newDirection.x !== 0) return;
    if (direction.y !== 0 && newDirection.y !== 0) return;
    
    gameRef.current.direction = newDirection;
  }, [gameState]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        changeDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        changeDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        changeDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        changeDirection({ x: 1, y: 0 });
        break;
    }
  }, [changeDirection]);

  // 触摸控制
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        changeDirection({ x: deltaX > 0 ? 1 : -1, y: 0 });
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        changeDirection({ x: 0, y: deltaY > 0 ? 1 : -1 });
      }
    }
    
    touchStartRef.current = null;
  }, [changeDirection]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    if (now - gameRef.current.lastMoveTime < gameRef.current.gameSpeed) {
      requestAnimationFrame(gameLoop);
      return;
    }

    gameRef.current.lastMoveTime = now;
    const { snake, direction, food } = gameRef.current;

    // 移动蛇头
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // 检查撞墙
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
      setGameState('gameOver');
      return;
    }

    // 检查撞自己
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameState('gameOver');
      return;
    }

    const newSnake = [head, ...snake];

    // 检查吃食物
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 10);
      gameRef.current.food = generateFood();
      // 逐渐加速，但不要太快
      gameRef.current.gameSpeed = Math.max(120, gameRef.current.gameSpeed - 1);
    } else {
      newSnake.pop();
    }

    gameRef.current.snake = newSnake;

    // 绘制
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制蛇
    newSnake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#16a34a' : '#22c55e';
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // 绘制食物
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      food.x * CELL_SIZE + 1,
      food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );

    requestAnimationFrame(gameLoop);
  }, [gameState, generateFood]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
    }
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (gameState === 'gameOver' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-high-score', score.toString());
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleKeyPress, handleTouchStart, handleTouchEnd, isMobile]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm sm:text-lg font-semibold">得分: {score}</div>
              <div className="text-sm sm:text-lg font-semibold">最高分: {highScore}</div>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={BOARD_SIZE * CELL_SIZE}
              height={BOARD_SIZE * CELL_SIZE}
              className="border border-gray-300 rounded-lg bg-blue-800 max-w-full"
              style={{ touchAction: 'none' }}
            />
          </div>

          {gameState === 'idle' && (
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-2">贪吃蛇游戏</h3>
              <p className="mb-4 text-sm">
                {isMobile ? '滑动屏幕控制蛇的移动' : '使用方向键控制蛇的移动'}，吃红色食物得分
              </p>
              <Button onClick={startGame} className="bg-blue-500 hover:bg-blue-600">
                <Play className="h-4 w-4 mr-2" />
                开始游戏
              </Button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="flex justify-center gap-2 mb-4">
              <Button onClick={pauseGame} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                暂停
              </Button>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="text-center mb-4">
              <p className="mb-4">游戏已暂停</p>
              <Button onClick={pauseGame} className="bg-blue-500 hover:bg-blue-600">
                <Play className="h-4 w-4 mr-2" />
                继续游戏
              </Button>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-2">游戏结束</h3>
              <p className="mb-2">得分: {score}</p>
              {score === highScore && score > 0 && (
                <p className="mb-4 text-yellow-600">🎉 新纪录！</p>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={startGame} className="bg-blue-500 hover:bg-blue-600">
                  <Play className="h-4 w-4 mr-2" />
                  重新开始
                </Button>
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  返回主页
                </Button>
              </div>
            </div>
          )}

          {/* 移动端控制按钮 */}
          {isMobile && gameState === 'playing' && (
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-48 mx-auto">
              <div></div>
              <Button 
                variant="outline" 
                size="sm"
                onTouchStart={() => changeDirection({ x: 0, y: -1 })}
                className="aspect-square"
              >
                ↑
              </Button>
              <div></div>
              
              <Button 
                variant="outline" 
                size="sm"
                onTouchStart={() => changeDirection({ x: -1, y: 0 })}
                className="aspect-square"
              >
                ←
              </Button>
              <div></div>
              <Button 
                variant="outline" 
                size="sm"
                onTouchStart={() => changeDirection({ x: 1, y: 0 })}
                className="aspect-square"
              >
                →
              </Button>
              
              <div></div>
              <Button 
                variant="outline" 
                size="sm"
                onTouchStart={() => changeDirection({ x: 0, y: 1 })}
                className="aspect-square"
              >
                ↓
              </Button>
              <div></div>
            </div>
          )}

          <div className="text-center text-xs sm:text-sm text-gray-600 mt-4">
            <p>
              {isMobile ? '滑动屏幕或使用按钮控制蛇的移动方向' : '使用方向键控制蛇的移动方向'}
            </p>
            <p>吃到红色食物可以得分，蛇会逐渐加速！</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SnakeGame;
