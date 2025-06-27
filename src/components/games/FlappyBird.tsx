
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw } from 'lucide-react';

interface FlappyBirdProps {
  onBack: () => void;
}

const FlappyBird = ({ onBack }: FlappyBirdProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappy-bird-high-score') || '0');
  });

  const gameRef = useRef({
    bird: { x: 50, y: 200, velocity: 0 },
    pipes: [] as Array<{ x: number; topHeight: number; passed: boolean }>,
    gameSpeed: 1.5, // 降低游戏速度
    gravity: 0.3, // 降低重力
    jumpForce: -6, // 降低跳跃力度
    pipeWidth: 60,
    pipeGap: 180, // 增加管道间隙
    animationId: 0
  });

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      gameRef.current.bird.velocity = gameRef.current.jumpForce;
    }
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    gameRef.current.bird = { x: 50, y: 200, velocity: 0 };
    gameRef.current.pipes = [];
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    gameRef.current.bird = { x: 50, y: 200, velocity: 0 };
    gameRef.current.pipes = [];
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新小鸟位置
    game.bird.velocity += game.gravity;
    game.bird.y += game.bird.velocity;

    // 绘制小鸟
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(game.bird.x, game.bird.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // 生成管道 - 增加间距
    if (game.pipes.length === 0 || game.pipes[game.pipes.length - 1].x < canvas.width - 250) {
      const topHeight = Math.random() * (canvas.height - game.pipeGap - 120) + 60;
      game.pipes.push({
        x: canvas.width,
        topHeight,
        passed: false
      });
    }

    // 更新和绘制管道
    game.pipes.forEach((pipe, index) => {
      pipe.x -= game.gameSpeed;

      // 绘制上管道
      ctx.fillStyle = '#228B22';
      ctx.fillRect(pipe.x, 0, game.pipeWidth, pipe.topHeight);

      // 绘制下管道
      ctx.fillRect(pipe.x, pipe.topHeight + game.pipeGap, game.pipeWidth, canvas.height - pipe.topHeight - game.pipeGap);

      // 检查得分
      if (!pipe.passed && pipe.x + game.pipeWidth < game.bird.x) {
        pipe.passed = true;
        setScore(prev => prev + 1);
      }

      // 碰撞检测 - 稍微放宽碰撞范围
      if (
        game.bird.x + 12 > pipe.x &&
        game.bird.x - 12 < pipe.x + game.pipeWidth &&
        (game.bird.y - 12 < pipe.topHeight || game.bird.y + 12 > pipe.topHeight + game.pipeGap)
      ) {
        setGameState('gameOver');
      }
    });

    // 移除超出屏幕的管道
    game.pipes = game.pipes.filter(pipe => pipe.x + game.pipeWidth > 0);

    // 检查边界碰撞
    if (game.bird.y + 15 > canvas.height || game.bird.y - 15 < 0) {
      setGameState('gameOver');
    }

    game.animationId = requestAnimationFrame(gameLoop);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
    } else {
      cancelAnimationFrame(gameRef.current.animationId);
    }

    return () => cancelAnimationFrame(gameRef.current.animationId);
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (gameState === 'gameOver') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('flappy-bird-high-score', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

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

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="border border-gray-300 rounded-lg mx-auto block cursor-pointer w-full max-w-[400px] h-auto"
              onClick={jump}
              style={{ aspectRatio: '400/300' }}
            />

            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">飞鸟游戏</h3>
                  <p className="mb-4 text-sm sm:text-base">点击屏幕或按空格键让小鸟飞翔</p>
                  <Button onClick={startGame} className="bg-blue-500 hover:bg-blue-600">
                    <Play className="h-4 w-4 mr-2" />
                    开始游戏
                  </Button>
                </div>
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">游戏结束</h3>
                  <p className="mb-2 text-sm sm:text-base">得分: {score}</p>
                  {score === highScore && score > 0 && (
                    <p className="mb-4 text-yellow-300 text-sm sm:text-base">🎉 新纪录！</p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button onClick={startGame} className="bg-blue-500 hover:bg-blue-600 text-sm">
                      <Play className="h-4 w-4 mr-2" />
                      重新开始
                    </Button>
                    <Button onClick={resetGame} variant="outline" className="bg-white text-gray-800 hover:bg-gray-100 text-sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      返回主页
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
            <p>点击屏幕或按空格键控制小鸟飞翔</p>
            <p>避开绿色管道，尽可能获得高分！</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlappyBird;
