import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Timer } from 'lucide-react';

interface BejeweledGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

type Gem = '💎' | '💍' | '🔷' | '🔶' | '⭐' | '🌟' | null;

const GEMS: Gem[] = ['💎', '💍', '🔷', '🔶', '⭐', '🌟'];
const BOARD_SIZE = 8;

export const BejeweledGame = ({ onBack, soundEnabled }: BejeweledGameProps) => {
  const [board, setBoard] = useState<Gem[][]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('bejeweled-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const createBoard = (): Gem[][] => {
    const newBoard: Gem[][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row: Gem[] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        row.push(GEMS[Math.floor(Math.random() * GEMS.length)]);
      }
      newBoard.push(row);
    }
    return newBoard;
  };

  const checkMatches = (checkBoard: Gem[][]): { row: number; col: number }[] => {
    const matches: { row: number; col: number }[] = [];

    // Check horizontal matches
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 2; j++) {
        const gem = checkBoard[i][j];
        if (gem && gem === checkBoard[i][j + 1] && gem === checkBoard[i][j + 2]) {
          if (!matches.some(m => m.row === i && m.col === j)) matches.push({ row: i, col: j });
          if (!matches.some(m => m.row === i && m.col === j + 1)) matches.push({ row: i, col: j + 1 });
          if (!matches.some(m => m.row === i && m.col === j + 2)) matches.push({ row: i, col: j + 2 });
        }
      }
    }

    // Check vertical matches
    for (let i = 0; i < BOARD_SIZE - 2; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const gem = checkBoard[i][j];
        if (gem && gem === checkBoard[i + 1][j] && gem === checkBoard[i + 2][j]) {
          if (!matches.some(m => m.row === i && m.col === j)) matches.push({ row: i, col: j });
          if (!matches.some(m => m.row === i + 1 && m.col === j)) matches.push({ row: i + 1, col: j });
          if (!matches.some(m => m.row === i + 2 && m.col === j)) matches.push({ row: i + 2, col: j });
        }
      }
    }

    return matches;
  };

  const removeMatches = (matches: { row: number; col: number }[], currentBoard: Gem[][]): Gem[][] => {
    const newBoard = currentBoard.map(row => [...row]);
    matches.forEach(({ row, col }) => {
      newBoard[row][col] = null;
    });
    return newBoard;
  };

  const dropGems = (currentBoard: Gem[][]): Gem[][] => {
    const newBoard = currentBoard.map(row => [...row]);
    
    for (let col = 0; col < BOARD_SIZE; col++) {
      let writeRow = BOARD_SIZE - 1;
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (newBoard[row][col] !== null) {
          if (row !== writeRow) {
            newBoard[writeRow][col] = newBoard[row][col];
            newBoard[row][col] = null;
          }
          writeRow--;
        }
      }
    }
    
    return newBoard;
  };

  const fillBoard = (currentBoard: Gem[][]): Gem[][] => {
    const newBoard = currentBoard.map(row => [...row]);
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (newBoard[i][j] === null) {
          newBoard[i][j] = GEMS[Math.floor(Math.random() * GEMS.length)];
        }
      }
    }
    return newBoard;
  };

  const processMatches = async (currentBoard: Gem[][], chainMultiplier = 1) => {
    const matches = checkMatches(currentBoard);
    
    if (matches.length > 0) {
      playSound(440 + chainMultiplier * 100, 0.2);
      setScore(prev => prev + matches.length * 10 * chainMultiplier);
      
      let newBoard = removeMatches(matches, currentBoard);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      newBoard = dropGems(newBoard);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      newBoard = fillBoard(newBoard);
      setBoard(newBoard);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      await processMatches(newBoard, chainMultiplier + 1);
    }
  };

  const startGame = async () => {
    let initialBoard = createBoard();
    while (checkMatches(initialBoard).length > 0) {
      initialBoard = createBoard();
    }
    setBoard(initialBoard);
    setScore(0);
    setTimeLeft(120);
    setGameStarted(true);
    setGameOver(false);
    setSelected(null);
    setIsProcessing(false);
    playSound(523.25, 0.1);
  };

  const handleGemClick = async (row: number, col: number) => {
    if (!gameStarted || gameOver || isProcessing) return;

    if (!selected) {
      setSelected({ row, col });
      playSound(440, 0.1);
    } else {
      const rowDiff = Math.abs(selected.row - row);
      const colDiff = Math.abs(selected.col - col);

      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        setIsProcessing(true);
        const newBoard = board.map(r => [...r]);
        [newBoard[selected.row][selected.col], newBoard[row][col]] = 
        [newBoard[row][col], newBoard[selected.row][selected.col]];

        const matches = checkMatches(newBoard);
        
        if (matches.length > 0) {
          setBoard(newBoard);
          playSound(550, 0.1);
          await new Promise(resolve => setTimeout(resolve, 300));
          await processMatches(newBoard);
        } else {
          playSound(300, 0.1);
        }
        
        setIsProcessing(false);
      }
      setSelected(null);
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
            localStorage.setItem('bejeweled-best-score', score.toString());
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
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">宝石消除</h2>
          <Button variant="ghost" size="icon" onClick={startGame} disabled={!gameStarted || isProcessing}>
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
            <p className="text-muted-foreground mb-4">交换相邻宝石形成三连消除</p>
            <p className="text-sm text-muted-foreground mb-6">连锁消除得分翻倍！</p>
            <Button onClick={startGame} size="lg">开始游戏</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2 bg-muted p-4 rounded-lg" style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              aspectRatio: '1'
            }}>
              {board.map((row, i) =>
                row.map((gem, j) => (
                  <button
                    key={`${i}-${j}`}
                    className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all bg-card hover:bg-accent ${
                      selected?.row === i && selected?.col === j ? 'ring-2 ring-primary scale-95' : ''
                    } ${isProcessing ? 'pointer-events-none' : 'hover:scale-105'}`}
                    onClick={() => handleGemClick(i, j)}
                    disabled={gameOver}
                  >
                    {gem}
                  </button>
                ))
              )}
            </div>

            {gameOver && (
              <div className="text-center space-y-4 py-4 bg-muted rounded-lg">
                <p className="text-lg font-bold">时间到！</p>
                <p className="text-muted-foreground">最终得分: {score}</p>
                {score === bestScore && score > 0 && (
                  <p className="text-primary">🎉 新纪录！</p>
                )}
                <Button onClick={startGame}>重新开始</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};