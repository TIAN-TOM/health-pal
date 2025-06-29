import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BreakoutGameProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 280;
const PADDLE_WIDTH = 70;
const PADDLE_HEIGHT = 10;
const BALL_SIZE = 6;
const BRICK_ROWS = 4;
const BRICK_COLS = 6;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 12;

const BreakoutGame = ({ onBack, soundEnabled = true }: BreakoutGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver' | 'victory'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('breakout-high-score') || '0');
  });

  const gameRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 25, width: PADDLE_WIDTH },
    ball: { 
      x: CANVAS_WIDTH / 2, 
      y: CANVAS_HEIGHT - 45, 
      dx: 2.5, 
      dy: -2.5,
      size: BALL_SIZE
    },
    bricks: [] as Array<{ 
      x: number; 
      y: number; 
      visible: boolean; 
      color: string;
      hits: number;
      maxHits: number;
      powerUp?: string;
    }>,
    powerUps: [] as Array<{
      x: number;
      y: number;
      dy: number;
      type: 'expand' | 'multi' | 'laser' | 'magnet' | 'slow' | 'life';
      timer: number;
    }>,
    effects: {
      paddleExpanded: 0,
      ballSlow: 0,
      magnet: 0,
      laser: 0,
    },
    particles: [] as Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      life: number;
      color: string;
    }>,
    keys: { left: false, right: false },
    animationId: 0,
    touchX: 0,
    isTouching: false,
    extraBalls: [] as Array<{ x: number; y: number; dx: number; dy: number; size: number }>,
    lasers: [] as Array<{ x: number; y: number; dy: number }>
  });

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

  const addParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 6; i++) {
      gameRef.current.particles.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 30,
        color
      });
    }
  }, []);

  const initBricks = useCallback(() => {
    const bricks = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const startX = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + 3) - 3)) / 2;
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const maxHits = row === 0 ? 3 : row === 1 ? 2 : 1; // 顶部砖块更坚固
        const hasPowerUp = Math.random() < 0.15; // 15%几率有道具
        const powerUpTypes = ['expand', 'multi', 'laser', 'magnet', 'slow', 'life'];
        
        bricks.push({
          x: startX + col * (BRICK_WIDTH + 3),
          y: 40 + row * (BRICK_HEIGHT + 3),
          visible: true,
          color: colors[row],
          hits: 0,
          maxHits,
          powerUp: hasPowerUp ? powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)] : undefined
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
    gameRef.current.paddle = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 25, width: PADDLE_WIDTH };
    gameRef.current.ball = { 
      x: CANVAS_WIDTH / 2, 
      y: CANVAS_HEIGHT - 45, 
      dx: 2.5, 
      dy: -2.5,
      size: BALL_SIZE
    };
    gameRef.current.powerUps = [];
    gameRef.current.particles = [];
    gameRef.current.extraBalls = [];
    gameRef.current.lasers = [];
    gameRef.current.effects = { paddleExpanded: 0, ballSlow: 0, magnet: 0, laser: 0 };
    initBricks();
    playSound(440, 0.2);
  };

  const pauseGame = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
    playSound(330, 0.1);
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
      case ' ':
        if (gameRef.current.effects.laser > 0) {
          // 发射激光
          gameRef.current.lasers.push({
            x: gameRef.current.paddle.x + gameRef.current.paddle.width / 2,
            y: gameRef.current.paddle.y,
            dy: -8
          });
          playSound(600, 0.1, 'square');
        }
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
    // 触摸结束时发射激光
    if (gameRef.current.effects.laser > 0) {
      gameRef.current.lasers.push({
        x: gameRef.current.paddle.x + gameRef.current.paddle.width / 2,
        y: gameRef.current.paddle.y,
        dy: -8
      });
      playSound(600, 0.1, 'square');
    }
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { paddle, ball, bricks, keys, effects, powerUps } = gameRef.current;

    // 更新效果计时器
    Object.keys(effects).forEach(key => {
      if (effects[key as keyof typeof effects] > 0) {
        effects[key as keyof typeof effects]--;
      }
    });

    // 更新挡板大小
    const targetWidth = effects.paddleExpanded > 0 ? PADDLE_WIDTH * 1.5 : PADDLE_WIDTH;
    paddle.width += (targetWidth - paddle.width) * 0.1;

    // 移动挡板
    let paddleSpeed = 5;
    if (keys.left && paddle.x > 0) {
      paddle.x -= paddleSpeed;
    }
    if (keys.right && paddle.x < CANVAS_WIDTH - paddle.width) {
      paddle.x += paddleSpeed;
    }

    // 触摸控制
    if (isMobile && gameRef.current.isTouching) {
      const targetX = gameRef.current.touchX - paddle.width / 2;
      paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, targetX));
    }

    // 磁铁效果
    if (effects.magnet > 0 && ball.y > paddle.y - 30) {
      const dx = (paddle.x + paddle.width / 2) - ball.x;
      ball.dx += dx * 0.02;
    }

    // 球速度调整
    const speedMultiplier = effects.ballSlow > 0 ? 0.6 : 1;
    ball.x += ball.dx * speedMultiplier;
    ball.y += ball.dy * speedMultiplier;

    // 球碰壁反弹
    if (ball.x <= ball.size || ball.x >= CANVAS_WIDTH - ball.size) {
      ball.dx = -ball.dx;
      playSound(220, 0.1);
    }
    if (ball.y <= ball.size) {
      ball.dy = -ball.dy;
      playSound(220, 0.1);
    }

    // 球碰挡板
    if (
      ball.y + ball.size >= paddle.y &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width &&
      ball.dy > 0
    ) {
      ball.dy = -ball.dy;
      const hitPos = (ball.x - paddle.x) / paddle.width;
      ball.dx = (hitPos - 0.5) * 4;
      playSound(330, 0.1);
    }

    // 更新额外球
    gameRef.current.extraBalls.forEach((extraBall, index) => {
      extraBall.x += extraBall.dx * speedMultiplier;
      extraBall.y += extraBall.dy * speedMultiplier;
      
      if (extraBall.x <= extraBall.size || extraBall.x >= CANVAS_WIDTH - extraBall.size) {
        extraBall.dx = -extraBall.dx;
      }
      if (extraBall.y <= extraBall.size) {
        extraBall.dy = -extraBall.dy;
      }
      
      // 额外球碰挡板
      if (
        extraBall.y + extraBall.size >= paddle.y &&
        extraBall.x >= paddle.x &&
        extraBall.x <= paddle.x + paddle.width &&
        extraBall.dy > 0
      ) {
        extraBall.dy = -extraBall.dy;
        const hitPos = (extraBall.x - paddle.x) / paddle.width;
        extraBall.dx = (hitPos - 0.5) * 4;
      }
      
      // 移除落下的额外球
      if (extraBall.y > CANVAS_HEIGHT) {
        gameRef.current.extraBalls.splice(index, 1);
      }
    });

    // 更新激光
    gameRef.current.lasers.forEach((laser, index) => {
      laser.y += laser.dy;
      if (laser.y < 0) {
        gameRef.current.lasers.splice(index, 1);
      }
    });

    // 激光击中砖块
    gameRef.current.lasers.forEach((laser, laserIndex) => {
      bricks.forEach((brick, brickIndex) => {
        if (
          brick.visible &&
          laser.x >= brick.x &&
          laser.x <= brick.x + BRICK_WIDTH &&
          laser.y >= brick.y &&
          laser.y <= brick.y + BRICK_HEIGHT
        ) {
          brick.hits++;
          addParticles(brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2, brick.color);
          
          if (brick.hits >= brick.maxHits) {
            brick.visible = false;
            setScore(prev => prev + 10 * brick.maxHits);
            
            if (brick.powerUp) {
              powerUps.push({
                x: brick.x + BRICK_WIDTH / 2,
                y: brick.y + BRICK_HEIGHT,
                dy: 2,
                type: brick.powerUp as any,
                timer: 0
              });
            }
          }
          
          gameRef.current.lasers.splice(laserIndex, 1);
          playSound(500, 0.1, 'triangle');
        }
      });
    });

    // 球碰砖块（包括额外球）
    const allBalls = [ball, ...gameRef.current.extraBalls];
    allBalls.forEach(currentBall => {
      bricks.forEach((brick, index) => {
        if (
          brick.visible &&
          currentBall.x >= brick.x &&
          currentBall.x <= brick.x + BRICK_WIDTH &&
          currentBall.y >= brick.y &&
          currentBall.y <= brick.y + BRICK_HEIGHT
        ) {
          brick.hits++;
          currentBall.dy = -currentBall.dy;
          addParticles(brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2, brick.color);
          
          if (brick.hits >= brick.maxHits) {
            brick.visible = false;
            setScore(prev => prev + 10 * brick.maxHits);
            
            if (brick.powerUp) {
              powerUps.push({
                x: brick.x + BRICK_WIDTH / 2,
                y: brick.y + BRICK_HEIGHT,
                dy: 2,
                type: brick.powerUp as any,
                timer: 0
              });
            }
            
            playSound(440, 0.1, 'triangle');
          } else {
            playSound(300, 0.1, 'triangle');
          }
        }
      });
    });

    // 更新道具
    powerUps.forEach((powerUp, index) => {
      powerUp.y += powerUp.dy;
      powerUp.timer++;
      
      // 检查道具拾取
      if (
        powerUp.y + 10 >= paddle.y &&
        powerUp.x >= paddle.x &&
        powerUp.x <= paddle.x + paddle.width
      ) {
        // 激活道具效果
        switch (powerUp.type) {
          case 'expand':
            effects.paddleExpanded = 600;
            break;
          case 'multi':
            for (let i = 0; i < 2; i++) {
              gameRef.current.extraBalls.push({
                x: ball.x,
                y: ball.y,
                dx: (Math.random() - 0.5) * 4,
                dy: -3,
                size: BALL_SIZE
              });
            }
            break;
          case 'laser':
            effects.laser = 600;
            break;
          case 'magnet':
            effects.magnet = 400;
            break;
          case 'slow':
            effects.ballSlow = 500;
            break;
          case 'life':
            setLives(prev => prev + 1);
            break;
        }
        
        powerUps.splice(index, 1);
        playSound(659, 0.2, 'triangle');
      } else if (powerUp.y > CANVAS_HEIGHT) {
        powerUps.splice(index, 1);
      }
    });

    // 更新粒子
    gameRef.current.particles.forEach((particle, index) => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.life--;
      if (particle.life <= 0) {
        gameRef.current.particles.splice(index, 1);
      }
    });

    // 球落下
    if (ball.y > CANVAS_HEIGHT) {
      playSound(150, 0.3, 'square');
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameOver');
        } else {
          ball.x = CANVAS_WIDTH / 2;
          ball.y = CANVAS_HEIGHT - 45;
          ball.dx = 2.5;
          ball.dy = -2.5;
          paddle.x = CANVAS_WIDTH / 2 - paddle.width / 2;
          gameRef.current.extraBalls = [];
        }
        return newLives;
      });
      
      if (lives <= 1) return;
    }

    // 检查胜利
    if (bricks.every(brick => !brick.visible)) {
      setLevel(prev => prev + 1);
      setScore(prev => prev + 100);
      playSound(523, 0.5, 'triangle');
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
        // 根据损坏程度调整颜色
        const alpha = 1 - (brick.hits / brick.maxHits) * 0.5;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        
        // 绘制道具图标
        if (brick.powerUp) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          const icons = {
            expand: '↔',
            multi: '●',
            laser: '↑',
            magnet: '⊕',
            slow: '⏳',
            life: '♥'
          };
          ctx.fillText(icons[brick.powerUp as keyof typeof icons], brick.x + BRICK_WIDTH/2, brick.y + BRICK_HEIGHT/2 + 3);
        }
        ctx.globalAlpha = 1;
      }
    });

    // 绘制挡板
    ctx.fillStyle = effects.laser > 0 ? '#ff6b6b' : '#ffffff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, PADDLE_HEIGHT);

    // 绘制激光
    ctx.fillStyle = '#ff0000';
    gameRef.current.lasers.forEach(laser => {
      ctx.fillRect(laser.x - 1, laser.y, 2, 10);
    });

    // 绘制球
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = effects.ballSlow > 0 ? '#00ff00' : '#ffffff';
    ctx.fill();

    // 绘制额外球
    ctx.fillStyle = '#ffff00';
    gameRef.current.extraBalls.forEach(extraBall => {
      ctx.beginPath();
      ctx.arc(extraBall.x, extraBall.y, extraBall.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制道具
    powerUps.forEach(powerUp => {
      const bounce = Math.sin(powerUp.timer * 0.2) * 2;
      ctx.save();
      ctx.translate(powerUp.x, powerUp.y + bounce);
      
      const colors = {
        expand: '#4CAF50',
        multi: '#FF9800',
        laser: '#F44336',
        magnet: '#9C27B0',
        slow: '#2196F3',
        life: '#E91E63'
      };
      
      ctx.fillStyle = colors[powerUp.type];
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const icons = {
        expand: '↔',
        multi: '●',
        laser: '↑',
        magnet: '⊕',
        slow: '⏳',
        life: '♥'
      };
      ctx.fillText(icons[powerUp.type], 0, 3);
      ctx.restore();
    });

    // 绘制粒子
    gameRef.current.particles.forEach(particle => {
      ctx.globalAlpha = particle.life / 30;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 绘制效果状态
    let effectY = 10;
    if (effects.paddleExpanded > 0) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = '12px Arial';
      ctx.fillText(`扩展挡板: ${Math.ceil(effects.paddleExpanded / 60)}s`, 10, effectY);
      effectY += 15;
    }
    if (effects.laser > 0) {
      ctx.fillStyle = '#F44336';
      ctx.fillText(`激光: ${Math.ceil(effects.laser / 60)}s`, 10, effectY);
      effectY += 15;
    }
    if (effects.magnet > 0) {
      ctx.fillStyle = '#9C27B0';
      ctx.fillText(`磁铁: ${Math.ceil(effects.magnet / 60)}s`, 10, effectY);
      effectY += 15;
    }
    if (effects.ballSlow > 0) {
      ctx.fillStyle = '#2196F3';
      ctx.fillText(`慢速: ${Math.ceil(effects.ballSlow / 60)}s`, 10, effectY);
    }

    gameRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [gameState, initBricks, lives, isMobile, playSound, addParticles]);

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
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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

          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-gray-300 rounded-lg bg-blue-800 w-full max-w-[360px]"
              style={{ 
                touchAction: 'none',
                aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
              }}
            />
          </div>

          {gameState === 'idle' && (
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-2">打砖块游戏 - 增强版</h3>
              <p className="mb-2 text-sm">
                {isMobile ? '触摸并拖动控制挡板' : '使用左右方向键移动挡板'}
              </p>
              <div className="text-xs text-gray-600 mb-4">
                <p><strong>道具说明：</strong></p>
                <p>↔ 扩展挡板 | ● 多球 | ↑ 激光 | ⊕ 磁铁 | ⏳ 慢速 | ♥ 生命</p>
                <p>{isMobile ? '触摸结束时发射激光' : '空格键发射激光'}</p>
              </div>
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
            <p>收集道具获得特殊能力，击碎所有砖块进入下一关！</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreakoutGame;
