import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface FruitNinjaGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  type: 'fruit' | 'bomb';
  sliced: boolean;
  rotation: number;
}

const FRUITS = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'];

export const FruitNinjaGame = ({ onBack, soundEnabled }: FruitNinjaGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('fruitninja-best-score');
    return saved ? parseInt(saved) : 0;
  });

  const gameStateRef = useRef({
    fruits: [] as Fruit[],
    score: 0,
    lives: 3,
    spawnTimer: 0,
    slashTrail: [] as { x: number; y: number; time: number }[]
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
      fruits: [],
      score: 0,
      lives: 3,
      spawnTimer: 0,
      slashTrail: []
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

    const getPointerPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof MouseEvent) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      } else {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (gameState !== 'playing') return;
      
      const pos = getPointerPos(e);
      const state = gameStateRef.current;
      
      state.slashTrail.push({ ...pos, time: Date.now() });
      state.slashTrail = state.slashTrail.filter(p => Date.now() - p.time < 200);

      // Check for fruit slicing
      state.fruits.forEach(fruit => {
        if (fruit.sliced) return;
        
        const distance = Math.sqrt(
          Math.pow(fruit.x - pos.x, 2) + Math.pow(fruit.y - pos.y, 2)
        );

        if (distance < 40) {
          fruit.sliced = true;
          if (fruit.type === 'bomb') {
            state.lives = 0;
            playSound(200, 0.3);
            setGameState('gameOver');
            if (state.score > bestScore) {
              setBestScore(state.score);
              localStorage.setItem('fruitninja-best-score', state.score.toString());
            }
          } else {
            state.score += 10;
            setScore(state.score);
            playSound(660 + Math.random() * 200, 0.1);
          }
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => handlePointerMove(e);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handlePointerMove(e);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, bestScore]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Spawn fruits
      state.spawnTimer++;
      if (state.spawnTimer > 50) {
        state.spawnTimer = 0;
        const type: 'fruit' | 'bomb' = Math.random() < 0.15 ? 'bomb' : 'fruit';
        const x = Math.random() * (canvas.width - 100) + 50;
        
        state.fruits.push({
          x,
          y: canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: -15 - Math.random() * 5,
          emoji: type === 'bomb' ? '💣' : FRUITS[Math.floor(Math.random() * FRUITS.length)],
          type,
          sliced: false,
          rotation: Math.random() * Math.PI * 2
        });
      }

      // Update fruits
      state.fruits = state.fruits.filter(fruit => {
        if (!fruit.sliced) {
          fruit.y += fruit.vy;
          fruit.x += fruit.vx;
          fruit.vy += 0.5; // gravity
          fruit.rotation += 0.1;

          // Check if fruit fell off screen
          if (fruit.y > canvas.height && fruit.type === 'fruit') {
            state.lives--;
            playSound(300, 0.1);
            if (state.lives <= 0) {
              setGameState('gameOver');
              if (state.score > bestScore) {
                setBestScore(state.score);
                localStorage.setItem('fruitninja-best-score', state.score.toString());
              }
            }
            return false;
          }

          return fruit.y < canvas.height + 100;
        }
        return false;
      });

      // Render
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw slash trail
      if (state.slashTrail.length > 1) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(state.slashTrail[0].x, state.slashTrail[0].y);
        for (let i = 1; i < state.slashTrail.length; i++) {
          ctx.lineTo(state.slashTrail[i].x, state.slashTrail[i].y);
        }
        ctx.stroke();
      }

      // Draw fruits
      ctx.font = 'bold 50px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      state.fruits.forEach(fruit => {
        ctx.save();
        ctx.translate(fruit.x, fruit.y);
        ctx.rotate(fruit.rotation);
        ctx.fillText(fruit.emoji, 0, 0);
        ctx.restore();
      });

      // Draw UI
      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`分数: ${state.score}`, 20, 35);
      ctx.fillText(`生命: ${'❤️'.repeat(state.lives)}`, 20, 70);

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
          <h2 className="text-2xl font-bold">水果忍者</h2>
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
            <p className="text-muted-foreground mb-4">划过水果切开它们！</p>
            <p className="text-sm text-muted-foreground mb-6">
              切水果得分，避开炸弹💣，不要让水果掉落！
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
              className="w-full border border-border rounded-lg cursor-crosshair"
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