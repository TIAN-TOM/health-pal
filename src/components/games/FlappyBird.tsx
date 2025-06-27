
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
    pipes: [] as Array<{ x: number; topHeight: number; passed: boolean; color: string }>,
    gameSpeed: 1.2,
    gravity: 0.25,
    jumpForce: -5.5,
    pipeWidth: 60,
    pipeGap: 200,
    animationId: 0,
    powerUps: [] as Array<{ x: number; y: number; type: 'score' | 'slow' }>,
    slowMotion: 0,
    clouds: [] as Array<{ x: number; y: number; speed: number; size: number }>
  });

  // 初始化云朵
  const initClouds = useCallback(() => {
    const clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * 400,
        y: Math.random() * 150 + 20,
        speed: Math.random() * 0.5 + 0.2,
        size: Math.random() * 20 + 15
      });
    }
    gameRef.current.clouds = clouds;
  }, []);

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
    gameRef.current.powerUps = [];
    gameRef.current.slowMotion = 0;
    initClouds();
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    gameRef.current.bird = { x: 50, y: 200, velocity: 0 };
    gameRef.current.pipes = [];
    gameRef.current.powerUps = [];
    gameRef.current.slowMotion = 0;
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    const currentSpeed = game.slowMotion > 0 ? game.gameSpeed * 0.5 : game.gameSpeed;
    
    if (game.slowMotion > 0) {
      game.slowMotion--;
    }

    // 清空画布并绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制云朵
    game.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.size < 0) {
        cloud.x = canvas.width + cloud.size;
        cloud.y = Math.random() * 150 + 20;
      }
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 更新小鸟位置
    game.bird.velocity += game.gravity;
    game.bird.y += game.bird.velocity;

    // 绘制小鸟（添加动画效果）
    const time = Date.now() * 0.005;
    ctx.save();
    ctx.translate(game.bird.x, game.bird.y);
    ctx.rotate(Math.sin(time) * 0.1);
    
    // 小鸟身体
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 小鸟翅膀
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(-5, -5, 8, 4, Math.sin(time * 5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 小鸟眼睛
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(5, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 小鸟嘴巴
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(18, -2);
    ctx.lineTo(18, 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();

    // 生成管道
    if (game.pipes.length === 0 || game.pipes[game.pipes.length - 1].x < canvas.width - 280) {
      const topHeight = Math.random() * (canvas.height - game.pipeGap - 120) + 60;
      const colors = ['#228B22', '#32CD32', '#008000', '#006400'];
      game.pipes.push({
        x: canvas.width,
        topHeight,
        passed: false,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      
      // 随机生成道具
      if (Math.random() < 0.3) {
        game.powerUps.push({
          x: canvas.width + 100,
          y: topHeight + game.pipeGap / 2,
          type: Math.random() < 0.7 ? 'score' : 'slow'
        });
      }
    }

    // 更新和绘制管道
    game.pipes.forEach((pipe, index) => {
      pipe.x -= currentSpeed;

      // 绘制上管道
      ctx.fillStyle = pipe.color;
      ctx.fillRect(pipe.x, 0, game.pipeWidth, pipe.topHeight);
      ctx.strokeStyle = '#006400';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x, 0, game.pipeWidth, pipe.topHeight);

      // 绘制下管道
      ctx.fillRect(pipe.x, pipe.topHeight + game.pipeGap, game.pipeWidth, canvas.height - pipe.topHeight - game.pipeGap);
      ctx.strokeRect(pipe.x, pipe.topHeight + game.pipeGap, game.pipeWidth, canvas.height - pipe.topHeight - game.pipeGap);

      // 检查得分
      if (!pipe.passed && pipe.x + game.pipeWidth < game.bird.x) {
        pipe.passed = true;
        setScore(prev => prev + 1);
      }

      // 碰撞检测
      if (
        game.bird.x + 12 > pipe.x &&
        game.bird.x - 12 < pipe.x + game.pipeWidth &&
        (game.bird.y - 12 < pipe.topHeight || game.bird.y + 12 > pipe.topHeight + game.pipeGap)
      ) {
        setGameState('gameOver');
      }
    });

    // 更新和绘制道具
    game.powerUps.forEach((powerUp, index) => {
      powerUp.x -= currentSpeed;
      
      const powerUpTime = Date.now() * 0.01;
      ctx.save();
      ctx.translate(powerUp.x, powerUp.y + Math.sin(powerUpTime) * 5);
      
      if (powerUp.type === 'score') {
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+', 0, 4);
      } else {
        ctx.fillStyle = '#00FFFF';
        ctx.strokeStyle = '#0099CC';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('S', 0, 3);
      }
      
      ctx.restore();
      
      // 检查道具拾取
      const dx = powerUp.x - game.bird.x;
      const dy = powerUp.y - game.bird.y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        if (powerUp.type === 'score') {
          setScore(prev => prev + 5);
        } else {
          game.slowMotion = 300; // 慢动作效果持续300帧
        }
        game.powerUps.splice(index, 1);
      }
    });

    // 移除超出屏幕的管道和道具
    game.pipes = game.pipes.filter(pipe => pipe.x + game.pipeWidth > 0);
    game.powerUps = game.powerUps.filter(powerUp => powerUp.x > -50);

    // 检查边界碰撞
    if (game.bird.y + 15 > canvas.height || game.bird.y - 15 < 0) {
      setGameState('gameOver');
    }

    // 显示慢动作效果
    if (game.slowMotion > 0) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00FFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('慢动作模式', canvas.width / 2, 30);
    }

    game.animationId = requestAnimationFrame(gameLoop);
  }, [gameState, initClouds]);

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
                  <p className="mb-4 text-xs sm:text-sm">收集金币加分，蓝色道具可获得慢动作效果</p>
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
            <p>避开彩色管道，收集道具，尽可能获得高分！</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlappyBird;
