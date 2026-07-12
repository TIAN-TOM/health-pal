import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw } from 'lucide-react';

interface EnhancedFlappyBirdProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

const EnhancedFlappyBird = ({ onBack, soundEnabled = true }: EnhancedFlappyBirdProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappy-bird-high-score') || '0');
  });

  const gameRef = useRef({
    bird: { x: 50, y: 200, velocity: 0 },
    pipes: [] as Array<{ x: number; topHeight: number; passed: boolean; color: string; speed: number }>,
    gameSpeed: 1.0,
    gravity: 0.18, // 减慢下坠速度
    jumpForce: -4.5, // 调整跳跃力度
    pipeWidth: 60,
    pipeGap: 220, // 增大间隙降低难度
    animationId: 0,
    powerUps: [] as Array<{ x: number; y: number; type: 'score' | 'slow' | 'shield' | 'boost' }>,
    slowMotion: 0,
    shieldTime: 0,
    speedBoost: 0,
    clouds: [] as Array<{ x: number; y: number; speed: number; size: number }>,
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number; type: 'moving' | 'rotating' }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>
  });

  // 初始化云朵 - 移动到前面
  const initClouds = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const clouds: Array<{ x: number; y: number; speed: number; size: number }> = [];
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

  // 音效生成函数
  const playSound = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.log('Audio context not available');
    }
  }, [soundEnabled]);

  // 添加粒子效果
  const addParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      gameRef.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30,
        color
      });
    }
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      gameRef.current.bird.velocity = gameRef.current.jumpForce;
      playSound(523, 0.1);
    }
  }, [gameState, playSound]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    gameRef.current.bird = { x: 50, y: 200, velocity: 0 };
    gameRef.current.pipes = [];
    gameRef.current.powerUps = [];
    gameRef.current.obstacles = [];
    gameRef.current.particles = [];
    gameRef.current.slowMotion = 0;
    gameRef.current.shieldTime = 0;
    gameRef.current.speedBoost = 0;
    playSound(440, 0.2);
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    gameRef.current.bird = { x: 50, y: 200, velocity: 0 };
    gameRef.current.pipes = [];
    gameRef.current.powerUps = [];
    gameRef.current.obstacles = [];
    gameRef.current.particles = [];
    gameRef.current.slowMotion = 0;
    gameRef.current.shieldTime = 0;
    gameRef.current.speedBoost = 0;
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    
    // 动态速度调整
    let currentSpeed = game.gameSpeed;
    if (game.slowMotion > 0) {
      currentSpeed *= 0.4;
      game.slowMotion--;
    }
    if (game.speedBoost > 0) {
      currentSpeed *= 2.0;
      game.speedBoost--;
    }
    
    if (game.shieldTime > 0) {
      game.shieldTime--;
    }

    // 清空画布并绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98FB98');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制粒子效果
    game.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      ctx.save();
      ctx.globalAlpha = particle.life / 30;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      if (particle.life <= 0) {
        game.particles.splice(index, 1);
      }
    });

    // 更新小鸟位置
    game.bird.velocity += game.gravity;
    game.bird.y += game.bird.velocity;

    // 绘制小鸟（带护盾效果）
    const time = Date.now() * 0.005;
    ctx.save();
    ctx.translate(game.bird.x, game.bird.y);
    
    // 护盾效果
    if (game.shieldTime > 0) {
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + Math.sin(time * 10) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.rotate(Math.sin(time) * 0.1);
    
    // 小鸟身体（根据状态改变颜色）
    if (game.speedBoost > 0) {
      ctx.fillStyle = '#FF6347'; // 加速时变红
    } else {
      ctx.fillStyle = '#FFD700';
    }
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 小鸟翅膀
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(-5, -5, 8, 4, Math.sin(time * 8) * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 小鸟眼睛
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(5, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // 生成管道（增加变化）
    if (game.pipes.length === 0 || game.pipes[game.pipes.length - 1].x < canvas.width - 250) {
      const topHeight = Math.random() * (canvas.height - game.pipeGap - 120) + 60;
      const colors = ['#228B22', '#32CD32', '#008000', '#006400', '#FF6347', '#4169E1'];
      const pipeSpeed = Math.random() * 0.5 + 0.8; // 管道速度变化
      
      game.pipes.push({
        x: canvas.width,
        topHeight,
        passed: false,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: pipeSpeed
      });
      
      // 增加道具生成概率
      if (Math.random() < 0.4) {
        const powerUpTypes = ['score', 'slow', 'shield', 'boost'];
        game.powerUps.push({
          x: canvas.width + 100,
          y: topHeight + game.pipeGap / 2,
          type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)] as any
        });
      }
    }

    // 更新和绘制管道
    game.pipes.forEach((pipe, index) => {
      pipe.x -= currentSpeed * pipe.speed;

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
        playSound(659, 0.1, 'triangle');
        addParticles(game.bird.x, game.bird.y, '#FFD700');
      }

      // 碰撞检测（护盾时免疫）- 修复护盾逻辑
      if (game.shieldTime <= 0 &&
          game.bird.x + 12 > pipe.x &&
          game.bird.x - 12 < pipe.x + game.pipeWidth &&
          (game.bird.y - 12 < pipe.topHeight || game.bird.y + 12 > pipe.topHeight + game.pipeGap)) {
        setGameState('gameOver');
        playSound(150, 0.5, 'square');
        return; // 立即结束游戏循环
      }
    });

    // 更新和绘制道具
    game.powerUps.forEach((powerUp, index) => {
      powerUp.x -= currentSpeed;
      
      const powerUpTime = Date.now() * 0.01;
      ctx.save();
      ctx.translate(powerUp.x, powerUp.y + Math.sin(powerUpTime) * 5);
      
      // 不同类型道具的显示
      switch (powerUp.type) {
        case 'score':
          ctx.fillStyle = '#FFD700';
          ctx.strokeStyle = '#FFA500';
          break;
        case 'slow':
          ctx.fillStyle = '#00FFFF';
          ctx.strokeStyle = '#0099CC';
          break;
        case 'shield':
          ctx.fillStyle = '#9370DB';
          ctx.strokeStyle = '#6A5ACD';
          break;
        case 'boost':
          ctx.fillStyle = '#FF69B4';
          ctx.strokeStyle = '#FF1493';
          break;
      }
      
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 道具标识
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const symbols = { score: '+', slow: 'S', shield: '◊', boost: '⚡' };
      ctx.fillText(symbols[powerUp.type], 0, 4);
      
      ctx.restore();
      
      // 检查道具拾取
      const dx = powerUp.x - game.bird.x;
      const dy = powerUp.y - game.bird.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        switch (powerUp.type) {
          case 'score':
            setScore(prev => prev + 5);
            playSound(784, 0.1, 'triangle');
            break;
          case 'slow':
            game.slowMotion = 200;
            playSound(392, 0.2, 'sine');
            break;
          case 'shield':
            game.shieldTime = 300;
            playSound(523, 0.3, 'triangle');
            break;
          case 'boost':
            game.speedBoost = 150;
            playSound(659, 0.2, 'square');
            break;
        }
        addParticles(powerUp.x, powerUp.y, ctx.fillStyle as string);
        game.powerUps.splice(index, 1);
      }
    });

    // 移除超出屏幕的管道和道具
    game.pipes = game.pipes.filter(pipe => pipe.x + game.pipeWidth > 0);
    game.powerUps = game.powerUps.filter(powerUp => powerUp.x > -50);

    // 检查边界碰撞（护盾时免疫下边界，但不免疫上边界）
    if (game.bird.y - 15 < 0) {
      // 撞到上边界，护盾也无法保护
      setGameState('gameOver');
      playSound(150, 0.5, 'square');
      return;
    } else if (game.shieldTime <= 0 && game.bird.y + 15 > canvas.height) {
      // 撞到下边界，只有没有护盾时才死亡
      setGameState('gameOver');
      playSound(150, 0.5, 'square');
      return;
    } else if (game.shieldTime > 0 && game.bird.y + 15 > canvas.height) {
      // 有护盾时撞到下边界，反弹回去
      game.bird.y = canvas.height - 15;
      game.bird.velocity = -2; // 轻微反弹
    }

    // 显示特殊效果状态
    let effectText = '';
    let effectColor = '';
    
    if (game.slowMotion > 0) {
      effectText = '慢动作模式';
      effectColor = '#00FFFF';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (game.speedBoost > 0) {
      effectText = '加速模式';
      effectColor = '#FF69B4';
      ctx.fillStyle = 'rgba(255, 105, 180, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (game.shieldTime > 0) {
      effectText = `护盾保护 (${Math.ceil(game.shieldTime / 60)}s)`;
      effectColor = '#9370DB';
    }
    
    if (effectText) {
      ctx.fillStyle = effectColor;
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(effectText, canvas.width / 2, 30);
    }

    game.animationId = requestAnimationFrame(gameLoop);
  }, [gameState, playSound, addParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        initClouds();
      }
    }
  }, [initClouds]);

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
                  <h3 className="text-lg sm:text-xl font-bold mb-2">小鸟会飞 - 增强版</h3>
                  <p className="mb-2 text-sm sm:text-base">点击屏幕或按空格键让小鸟飞翔</p>
                  <p className="mb-4 text-xs sm:text-sm">
                    🏅 金币：额外得分 | ⏰ 慢动作：减慢时间 | 
                    ◊ 护盾：免疫伤害 | ⚡ 加速：快速穿越
                  </p>
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
            <p>收集道具体验不同效果，避开障碍获得高分！</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFlappyBird;
