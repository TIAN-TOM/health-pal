
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SnakeGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 5, y: 5 };

const SnakeGame = ({ onBack, soundEnabled }: SnakeGameProps) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(200);
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isMobile = useIsMobile();

  const generateFood = useCallback((snakeBody: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (!isPlaying || gameOver) return;
    
    // 防止反向移动
    const opposites = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    };
    
    if (opposites[direction] !== newDirection) {
      setDirection(newDirection);
    }
  }, [direction, isPlaying, gameOver]);

  // 触屏滑动控制
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > minSwipeDistance) {
        changeDirection(deltaX > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > minSwipeDistance) {
        changeDirection(deltaY > 0 ? 'DOWN' : 'UP');
      }
    }
    
    touchStartRef.current = null;
  }, [changeDirection]);

  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      if (gameOver || !isPlaying) return currentSnake;

      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // 检查墙壁碰撞
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // 检查自身碰撞
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // 检查是否吃到食物
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        // 增加游戏速度
        if (speed > 100) {
          setSpeed(prev => prev - 2);
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, speed, generateFood]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, moveSnake, speed]);

  // 键盘控制（桌面端辅助）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection, isPlaying, gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    setSpeed(200);
  };

  const toggleGame = () => {
    if (gameOver) {
      resetGame();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-xl md:text-2xl">🐍 贪吃蛇</CardTitle>
          <div className="flex justify-between items-center text-sm">
            <div className="font-semibold">得分: {score}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleGame}>
                {gameOver ? <RotateCcw className="h-4 w-4" /> : 
                 isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="ml-1 hidden sm:inline">
                  {gameOver ? '重新开始' : isPlaying ? '暂停' : '开始'}
                </span>
              </Button>
              <Button variant="outline" size="sm" onClick={resetGame}>
                <RotateCcw className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">重置</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div 
              ref={gameAreaRef}
              className="grid bg-gray-900 border-2 border-gray-600 rounded-lg p-1 mx-auto touch-none"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: isMobile ? '320px' : '480px',
                height: isMobile ? '320px' : '480px',
                gap: '1px'
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
                const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                
                return (
                  <div
                    key={index}
                    className={`
                      ${isSnakeHead ? 'bg-green-400 rounded-full shadow-md' : ''}
                      ${isSnakeBody ? 'bg-green-600 rounded-sm' : ''}
                      ${isFood ? 'bg-red-500 rounded-full animate-pulse' : ''}
                      ${!isSnakeHead && !isSnakeBody && !isFood ? 'bg-gray-800' : ''}
                    `}
                  />
                );
              })}
            </div>
            
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center text-white p-4">
                  <h3 className="text-2xl font-bold mb-2">游戏结束!</h3>
                  <p className="text-lg mb-4">最终得分: {score}</p>
                  <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700">
                    再来一局
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* 移动端方向控制按钮 */}
          {isMobile && (
            <div className="grid grid-cols-3 gap-2 max-w-40 mx-auto">
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => changeDirection('UP')}
                className="h-12 w-12 p-0 text-lg"
                disabled={!isPlaying || gameOver}
              >
                ↑
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => changeDirection('LEFT')}
                className="h-12 w-12 p-0 text-lg"
                disabled={!isPlaying || gameOver}
              >
                ←
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => changeDirection('RIGHT')}
                className="h-12 w-12 p-0 text-lg"
                disabled={!isPlaying || gameOver}
              >
                →
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => changeDirection('DOWN')}
                className="h-12 w-12 p-0 text-lg"
                disabled={!isPlaying || gameOver}
              >
                ↓
              </Button>
              <div></div>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-600 space-y-1">
            {isMobile ? (
              <>
                <p>在游戏区域滑动或使用方向按钮控制贪吃蛇</p>
                <p>吃掉红色食物得分，避免撞墙和咬到自己</p>
              </>
            ) : (
              <>
                <p>使用方向键、WASD或在游戏区域滑动控制贪吃蛇</p>
                <p>吃掉红色食物得分，避免撞墙和咬到自己</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SnakeGame;
