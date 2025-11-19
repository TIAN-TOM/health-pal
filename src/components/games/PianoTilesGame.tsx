import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface PianoTilesGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Tile {
  lane: number;
  y: number;
  hit: boolean;
}

const LANES = 4;
const TILE_HEIGHT = 120;

export const PianoTilesGame = ({ onBack, soundEnabled }: PianoTilesGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('pianotiles-best-score');
    return saved ? parseInt(saved) : 0;
  });

  const gameStateRef = useRef({
    tiles: [] as Tile[],
    score: 0,
    speed: 3,
    spawnTimer: 0,
    gameOver: false
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
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Sound failed:', error);
    }
  };

  const startGame = () => {
    gameStateRef.current = {
      tiles: [{ lane: Math.floor(Math.random() * LANES), y: -TILE_HEIGHT, hit: false }],
      score: 0,
      speed: 3,
      spawnTimer: 0,
      gameOver: false
    };
    setScore(0);
    setGameState('playing');
    playSound(523.25, 0.1);
  };

  const resetGame = () => {
    setGameState('idle');
  };

  const handleLaneClick = (lane: number) => {
    if (gameState !== 'playing') return;
    
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Find the lowest tile in this lane that hasn't been hit
    let hitTile = false;
    for (let i = state.tiles.length - 1; i >= 0; i--) {
      const tile = state.tiles[i];
      if (tile.lane === lane && !tile.hit && tile.y > canvas.height - TILE_HEIGHT - 50) {
        tile.hit = true;
        hitTile = true;
        state.score++;
        setScore(state.score);
        
        // Play note based on lane
        const frequencies = [261.63, 329.63, 392.00, 493.88]; // C, E, G, B
        playSound(frequencies[lane], 0.15);
        
        // Increase speed gradually
        if (state.score % 10 === 0) {
          state.speed += 0.5;
        }
        break;
      }
    }

    if (!hitTile) {
      // Clicked wrong lane
      state.gameOver = true;
      setGameState('gameOver');
      playSound(200, 0.3);
      if (state.score > bestScore) {
        setBestScore(state.score);
        localStorage.setItem('pianotiles-best-score', state.score.toString());
      }
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;
      if (state.gameOver) return;

      const laneWidth = canvas.width / LANES;

      // Spawn new tiles
      state.spawnTimer++;
      const spawnInterval = Math.max(30, 60 - Math.floor(state.score / 5));
      
      if (state.spawnTimer > spawnInterval) {
        state.spawnTimer = 0;
        // Ensure new tile is not in the same lane as the last one
        let newLane;
        do {
          newLane = Math.floor(Math.random() * LANES);
        } while (state.tiles.length > 0 && state.tiles[state.tiles.length - 1].lane === newLane);
        
        state.tiles.push({
          lane: newLane,
          y: -TILE_HEIGHT,
          hit: false
        });
      }

      // Update tiles
      state.tiles = state.tiles.filter(tile => {
        tile.y += state.speed;

        // Check if tile passed the bottom without being hit
        if (tile.y > canvas.height && !tile.hit) {
          state.gameOver = true;
          setGameState('gameOver');
          playSound(200, 0.3);
          if (state.score > bestScore) {
            setBestScore(state.score);
            localStorage.setItem('pianotiles-best-score', state.score.toString());
          }
          return false;
        }

        return tile.y < canvas.height + 50;
      });

      // Render
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw lane dividers
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      for (let i = 1; i < LANES; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.stroke();
      }

      // Draw target line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - TILE_HEIGHT);
      ctx.lineTo(canvas.width, canvas.height - TILE_HEIGHT);
      ctx.stroke();

      // Draw tiles
      state.tiles.forEach(tile => {
        if (!tile.hit) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(
            tile.lane * laneWidth + 2,
            tile.y,
            laneWidth - 4,
            TILE_HEIGHT - 4
          );
        }
      });

      // Draw score
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${state.score}`, canvas.width / 2, 50);

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
      <Card className="max-w-xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">钢琴块</h2>
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
            <p className="text-muted-foreground mb-4">点击黑色方块，不要让它们掉落！</p>
            <p className="text-sm text-muted-foreground mb-6">速度会越来越快，挑战你的反应力！</p>
            <Button onClick={startGame} size="lg">开始游戏</Button>
          </div>
        )}

        {gameState !== 'idle' && (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={600}
              className="w-full border border-border rounded-lg bg-white cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const lane = Math.floor((x / rect.width) * LANES);
                handleLaneClick(lane);
              }}
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