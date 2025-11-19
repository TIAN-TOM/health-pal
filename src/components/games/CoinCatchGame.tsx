import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface CoinCatchGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Coin {
  x: number;
  y: number;
  speed: number;
  type: 'gold' | 'silver' | 'bomb';
}

export const CoinCatchGame = ({ onBack, soundEnabled }: CoinCatchGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('coincatch-best-score');
    return saved ? parseInt(saved) : 0;
  });

  const gameStateRef = useRef({
    playerX: 400,
    playerWidth: 80,
    playerHeight: 20,
    coins: [] as Coin[],
    score: 0,
    lives: 3,
    spawnTimer: 0
  });

  const playSound = (frequency: number, duration: number = 0.1) => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Sound failed:', error);
    }
  };

  const startGame = () => {
    gameStateRef.current = {
      playerX: 400,
      playerWidth: 80,
      playerHeight: 20,
      coins: [],
      score: 0,
      lives: 3,
      spawnTimer: 0
    };
    setScore(0);
    setGameState('playing');
    playSound(523.25, 0.1);
  };

  const resetGame = () => {
    setGameState('idle');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      gameStateRef.current.playerX = Math.max(
        gameStateRef.current.playerWidth / 2,
        Math.min(canvas.width - gameStateRef.current.playerWidth / 2, x)
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      gameStateRef.current.playerX = Math.max(
        gameStateRef.current.playerWidth / 2,
        Math.min(canvas.width - gameStateRef.current.playerWidth / 2, x)
      );
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Spawn coins
      state.spawnTimer++;
      if (state.spawnTimer > 40) {
        state.spawnTimer = 0;
        const random = Math.random();
        const type: 'gold' | 'silver' | 'bomb' = 
          random < 0.1 ? 'bomb' : random < 0.4 ? 'silver' : 'gold';
        
        state.coins.push({
          x: Math.random() * canvas.width,
          y: 0,
          speed: 2 + Math.random() * 2,
          type
        });
      }

      // Update coins
      state.coins = state.coins.filter(coin => {
        coin.y += coin.speed;

        // Check collision with player
        const playerLeft = state.playerX - state.playerWidth / 2;
        const playerRight = state.playerX + state.playerWidth / 2;
        const playerTop = canvas.height - 50 - state.playerHeight;

        if (
          coin.y + 15 > playerTop &&
          coin.y < canvas.height - 50 &&
          coin.x > playerLeft &&
          coin.x < playerRight
        ) {
          if (coin.type === 'bomb') {
            state.lives--;
            playSound(200, 0.2);
            if (state.lives <= 0) {
              setGameState('gameOver');
              if (state.score > bestScore) {
                setBestScore(state.score);
                localStorage.setItem('coincatch-best-score', state.score.toString());
              }
            }
          } else {
            const points = coin.type === 'gold' ? 10 : 5;
            state.score += points;
            setScore(state.score);
            playSound(coin.type === 'gold' ? 660 : 550, 0.1);
          }
          return false;
        }

        return coin.y < canvas.height;
      });

      // Render
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw player
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(
        state.playerX - state.playerWidth / 2,
        canvas.height - 50 - state.playerHeight,
        state.playerWidth,
        state.playerHeight,
        5
      );
      ctx.fill();

      // Draw coins
      state.coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = coin.type === 'bomb' ? '#ef4444' : 
                        coin.type === 'gold' ? '#fbbf24' : '#d1d5db';
        ctx.fill();
        ctx.strokeStyle = coin.type === 'bomb' ? '#991b1b' :
                         coin.type === 'gold' ? '#f59e0b' : '#9ca3af';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (coin.type === 'bomb') {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', coin.x, coin.y);
        }
      });

      // Draw UI
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`分数: ${state.score}`, 20, 30);
      ctx.fillText(`生命: ${'❤️'.repeat(state.lives)}`, 20, 60);

      if (gameState === 'playing') {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, bestScore, soundEnabled]);

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">接金币</h2>
          <Button variant="ghost" size="icon" onClick={startGame} disabled={gameState !== 'playing'}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-between mb-4 text-sm">
          <div>当前分数: <span className="font-bold text-primary">{score}</span></div>
          <div>最高分数: <span className="font-bold text-primary">{bestScore}</span></div>
        </div>

        {gameState === 'idle' && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">移动鼠标或触摸屏幕接住金币</p>
            <p className="text-sm text-muted-foreground mb-6">
              金币💰+10分，银币+5分，避开炸弹💣！
            </p>
            <Button onClick={startGame} size="lg">开始游戏</Button>
          </div>
        )}

        {gameState !== 'idle' && (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full border border-border rounded-lg bg-black"
              style={{ touchAction: 'none' }}
            />
            
            {gameState === 'gameOver' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center space-y-4">
                  <p className="text-2xl font-bold text-white">游戏结束！</p>
                  <p className="text-lg text-gray-300">得分: {score}</p>
                  {score === bestScore && score > 0 && (
                    <p className="text-yellow-400">🎉 新纪录！</p>
                  )}
                  <Button onClick={resetGame}>返回</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};