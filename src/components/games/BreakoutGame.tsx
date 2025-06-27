
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BreakoutGameProps {
  onBack: () => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 15;

const BreakoutGame = ({ onBack }: BreakoutGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver' | 'victory'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('breakout-high-score') || '0');
  });

  const gameRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
    ball: { 
      x: CANVAS_WIDTH / 2, 
      y: CANVAS_HEIGHT - 50, 
      dx: 3, 
      dy: -3 
    },
    bricks: [] as Array<{ x: number; y: number; visible: boolean; color: string }>,
    keys: { left: false, right: false },
    animationId: 0,
    touchX: 0,
    isTouching: false
  });

  const initBricks = useCallback(() => {
    const bricks = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + 5) + 30,
          y: row * (BRICK_HEIGHT + 5) + 50,
          visible: true,
          color: colors[row]
        });
      }
    }
    
    gameRef.current.bricks = bricks;
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    gameRef.current.paddle.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    gameRef.current.ball = { 
      x: CANVAS_WIDTH / 2, 
      y: CANVAS_HEIGHT - 50, 
      dx: 3, 
      dy: -3 
    };
    initBricks();
  };

  const pauseGame = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setLevel(1);
    setLives(3);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        gameRef.current.keys.left = true;
        break;
      case 'ArrowRight':
        gameRef.current.keys.right = true;
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        gameRef.current.keys.left = false;
        break;
      case 'ArrowRight':
        gameRef.current.keys.right = false;
        break;
    }
  }, []);

  // 触摸控制
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    
    gameRef.current.touchX = x;
    gameRef.current.isTouching = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!gameRef.current.isTouching || !canvasRef.current) return;
    
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    
    gameRef.current.touchX = x;
  }, []);

  const handleTouchEnd = useCallback(() => {
    gameRef.current.isTouching = false;
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { paddle, ball, bricks, keys } = gameRef.current;

    // 移动挡板 - 键盘控制
    if (keys.left && paddle.x > 0) {
      paddle.x -= 6;
    }
    if (keys.right && paddle.x < CANVAS_WIDTH - PADDLE_WIDTH) {
      paddle.x += 6;
    }

    // 移动挡板 - 触摸控制
    if (isMobile && gameRef.current.isTouching) {
      const targetX = gameRef.current.touchX - PADDLE_WIDTH / 2;
      paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, targetX));
    }

    // 移动球
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 球碰壁反弹
    if (ball.x <= BALL_SIZE || ball.x >= CANVAS_WIDTH - BALL_SIZE) {
      ball.dx = -ball.dx;
    }
    if (ball.y <= BALL_SIZE) {
      ball.dy = -ball.dy;
    }

    // 球碰挡板
    if (
      ball.y + BALL_SIZE >= paddle.y &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + PADDLE_WIDTH &&
      ball.dy > 0
    ) {
      ball.dy = -ball.dy;
      // 根据击中位置调整角度
      const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
      ball.dx = (hitPos - 0.5) * 6;
    }

    // 球落下
    if (ball.y > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameOver');
        } else {
          // 重置球的位置
          ball.x = CANVAS_WIDTH / 2;
          ball.y = CANVAS_HEIGHT - 50;
          ball.dx = 3;
          ball.dy = -3;
          paddle.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
        }
        return newLives;
      });
      
      if (lives <= 1) return;
    }

    // 球碰砖块
    bricks.forEach((brick, index) => {
      if (
        brick.visible &&
        ball.x >= brick.x &&
        ball.x <= brick.x + BRICK_WIDTH &&
        ball.y >= brick.y &&
        ball.y <= brick.y + BRICK_HEIGHT
      ) {
        brick.visible = false;
        ball.dy = -ball.dy;
        setScore(prev => prev + 10);
      }
    });

    // 检查胜利
    if (bricks.every(brick => !brick.visible)) {
      setLevel(prev => prev + 1);
      setScore(prev => prev + 100);
      // 重新初始化砖块并稍微加快球速
      initBricks();
      ball.dx *= 1.05;
      ball.dy *= 1.05;
    }

    // 清空画布
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 绘制砖块
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    });

    // 绘制挡板
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // 绘制球
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    gameRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [gameState, initBricks, lives, isMobile]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
    } else {
      cancelAnimationFrame(gameRef.current.animationId);
    }

    return () => cancelAnimationFrame(gameRef.current.animationId);
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (gameState === 'gameOver' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('breakout-high-score', score.toString());
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    if (isMobile && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchmove', handleTouchMove);
      canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (isMobile && canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleKeyDown, handleKeyUp, handleTouchStart, handleTouchMove, handleTouchEnd, isMobile]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <div className="flex justify-between items-center mb-4 text-xs sm:text-base">
              <div className="font-semibold">得分: {score}</div>
              <div className="font-semibold">关卡: {level}</div>
              <div className="font-semibold">生命: {lives}</div>
              <div className="font-semibold">最高分: {highScore}</div>
            </div>
          </div>

          <div className="flex justify-center mb-4 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-gray-300 rounded-lg bg-blue-800 max-w-full h-auto"
              style={{ 
                touchAction: 'none',
                aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
              }}
            />
          </div>

          {gameState === 'idle' && (
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-2">打砖块游戏</h3>
              <p className="mb-4 text-sm">
                {isMobile ? '触摸并拖动控制挡板' : '使用左右方向键移动挡板'}，弹球击碎所有砖块
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
              <p className="mb-2">关卡: {level}</p>
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

          <div className="text-center text-xs sm:text-sm text-gray-600">
            <p>
              {isMobile ? '触摸屏幕并左右拖动控制挡板移动' : '使用左右方向键移动挡板'}
            </p>
            <p>击碎所有砖块进入下一关，你有3条生命！</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreakoutGame;
