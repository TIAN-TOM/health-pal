import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Timer } from 'lucide-react';

interface LinkLinkGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Tile {
  id: number;
  icon: string;
  matched: boolean;
  row: number;
  col: number;
}

const ICONS = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍑', '🥥', '🍍'];
const ROWS = 8;
const COLS = 10;

export const LinkLinkGame = ({ onBack, soundEnabled }: LinkLinkGameProps) => {
  const [tiles, setTiles] = useState<(Tile | null)[][]>([]);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('linklink-best-score');
    return saved ? parseInt(saved) : 0;
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

  const initBoard = () => {
    const totalPairs = (ROWS * COLS) / 2;
    const iconsNeeded = Math.min(ICONS.length, totalPairs);
    const pairs: string[] = [];
    
    for (let i = 0; i < iconsNeeded; i++) {
      pairs.push(ICONS[i], ICONS[i]);
    }
    
    while (pairs.length < ROWS * COLS) {
      const randomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
      pairs.push(randomIcon, randomIcon);
    }

    const shuffled = pairs.sort(() => Math.random() - 0.5);
    const newBoard: (Tile | null)[][] = [];
    let id = 0;

    for (let i = 0; i < ROWS; i++) {
      const row: (Tile | null)[] = [];
      for (let j = 0; j < COLS; j++) {
        row.push({
          id: id++,
          icon: shuffled[i * COLS + j],
          matched: false,
          row: i,
          col: j
        });
      }
      newBoard.push(row);
    }

    setTiles(newBoard);
  };

  const startGame = () => {
    initBoard();
    setScore(0);
    setTimeLeft(180);
    setGameStarted(true);
    setGameOver(false);
    setSelected(null);
    playSound(523.25, 0.1);
  };

  const canConnect = (tile1: Tile, tile2: Tile): boolean => {
    if (tile1.icon !== tile2.icon || tile1.id === tile2.id) return false;

    // 直线连接检查
    if (tile1.row === tile2.row) {
      const minCol = Math.min(tile1.col, tile2.col);
      const maxCol = Math.max(tile1.col, tile2.col);
      let canConnect = true;
      for (let col = minCol + 1; col < maxCol; col++) {
        if (tiles[tile1.row][col] !== null) {
          canConnect = false;
          break;
        }
      }
      if (canConnect) return true;
    }

    if (tile1.col === tile2.col) {
      const minRow = Math.min(tile1.row, tile2.row);
      const maxRow = Math.max(tile1.row, tile2.row);
      let canConnect = true;
      for (let row = minRow + 1; row < maxRow; row++) {
        if (tiles[row][tile1.col] !== null) {
          canConnect = false;
          break;
        }
      }
      if (canConnect) return true;
    }

    // 一个转角连接
    if (tiles[tile1.row][tile2.col] === null) {
      const canReachCorner1 = canConnectStraight(tile1.row, tile1.col, tile1.row, tile2.col);
      const canReachCorner2 = canConnectStraight(tile1.row, tile2.col, tile2.row, tile2.col);
      if (canReachCorner1 && canReachCorner2) return true;
    }

    if (tiles[tile2.row][tile1.col] === null) {
      const canReachCorner1 = canConnectStraight(tile1.row, tile1.col, tile2.row, tile1.col);
      const canReachCorner2 = canConnectStraight(tile2.row, tile1.col, tile2.row, tile2.col);
      if (canReachCorner1 && canReachCorner2) return true;
    }

    return false;
  };

  const canConnectStraight = (r1: number, c1: number, r2: number, c2: number): boolean => {
    if (r1 === r2) {
      const minCol = Math.min(c1, c2);
      const maxCol = Math.max(c1, c2);
      for (let col = minCol + 1; col < maxCol; col++) {
        if (tiles[r1][col] !== null) return false;
      }
      return true;
    }
    if (c1 === c2) {
      const minRow = Math.min(r1, r2);
      const maxRow = Math.max(r1, r2);
      for (let row = minRow + 1; row < maxRow; row++) {
        if (tiles[row][c1] !== null) return false;
      }
      return true;
    }
    return false;
  };

  const handleTileClick = (tile: Tile) => {
    if (!gameStarted || gameOver || tile.matched) return;

    if (!selected) {
      setSelected(tile);
      playSound(440, 0.1);
    } else if (selected.id === tile.id) {
      setSelected(null);
      playSound(330, 0.1);
    } else if (canConnect(selected, tile)) {
      const newTiles = tiles.map(row => 
        row.map(t => {
          if (!t) return null;
          if (t.id === selected.id || t.id === tile.id) {
            return null;
          }
          return t;
        })
      );
      
      setTiles(newTiles);
      setScore(prev => prev + 100);
      setSelected(null);
      playSound(660, 0.2);

      const hasRemainingTiles = newTiles.some(row => row.some(t => t !== null));
      if (!hasRemainingTiles) {
        setGameOver(true);
        if (score + 100 > bestScore) {
          setBestScore(score + 100);
          localStorage.setItem('linklink-best-score', (score + 100).toString());
        }
      }
    } else {
      setSelected(tile);
      playSound(350, 0.1);
    }
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          playSound(200, 0.3);
          if (score > bestScore) {
            setBestScore(score);
            localStorage.setItem('linklink-best-score', score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, score, bestScore]);

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">连连看</h2>
          <Button variant="ghost" size="icon" onClick={startGame} disabled={!gameStarted}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-between mb-4 text-sm">
          <div>分数: <span className="font-bold text-primary">{score}</span></div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className={timeLeft < 30 ? 'text-destructive font-bold' : ''}>{timeLeft}s</span>
          </div>
          <div>最高: <span className="font-bold text-primary">{bestScore}</span></div>
        </div>

        {!gameStarted ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">连接相同的图标消除</p>
            <p className="text-sm text-muted-foreground mb-6">路径最多可以转两个弯！</p>
            <Button onClick={startGame} size="lg">开始游戏</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2 bg-muted p-4 rounded-lg" style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`
            }}>
              {tiles.map((row, i) => 
                row.map((tile, j) => (
                  <button
                    key={`${i}-${j}`}
                    className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                      tile ? 'bg-card hover:bg-accent hover:scale-105' : 'bg-transparent'
                    } ${
                      selected?.id === tile?.id ? 'ring-2 ring-primary scale-95' : ''
                    }`}
                    onClick={() => tile && handleTileClick(tile)}
                    disabled={!tile || gameOver}
                  >
                    {tile?.icon}
                  </button>
                ))
              )}
            </div>

            {gameOver && (
              <div className="text-center space-y-4 py-4 bg-muted rounded-lg">
                <p className="text-lg font-bold">
                  {tiles.every(row => row.every(t => !t)) ? '恭喜通关！' : '时间到！'}
                </p>
                <p className="text-muted-foreground">最终得分: {score}</p>
                <Button onClick={startGame}>重新开始</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};