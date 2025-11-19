import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface PopStarGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | null;

interface Block {
  color: BlockColor;
  marked: boolean;
}

const COLORS: BlockColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
const ROWS = 10;
const COLS = 10;

export const PopStarGame = ({ onBack, soundEnabled }: PopStarGameProps) => {
  const [board, setBoard] = useState<Block[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('popstar-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

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
    const newBoard: Block[][] = [];
    for (let i = 0; i < ROWS; i++) {
      const row: Block[] = [];
      for (let j = 0; j < COLS; j++) {
        row.push({
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          marked: false
        });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
  };

  const startGame = () => {
    initBoard();
    setScore(0);
    setGameStarted(true);
    setSelectedCount(0);
    playSound(523.25, 0.1);
  };

  const markConnected = (row: number, col: number, color: BlockColor, tempBoard: Block[][]): number => {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 0;
    if (tempBoard[row][col].color !== color || tempBoard[row][col].marked || !tempBoard[row][col].color) return 0;

    tempBoard[row][col].marked = true;
    let count = 1;

    count += markConnected(row - 1, col, color, tempBoard);
    count += markConnected(row + 1, col, color, tempBoard);
    count += markConnected(row, col - 1, color, tempBoard);
    count += markConnected(row, col + 1, color, tempBoard);

    return count;
  };

  const clearMarked = (tempBoard: Block[][]): number => {
    let cleared = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (tempBoard[i][j].marked) {
          tempBoard[i][j].color = null;
          tempBoard[i][j].marked = false;
          cleared++;
        }
      }
    }
    return cleared;
  };

  const dropBlocks = (tempBoard: Block[][]) => {
    for (let col = 0; col < COLS; col++) {
      let writeRow = ROWS - 1;
      for (let row = ROWS - 1; row >= 0; row--) {
        if (tempBoard[row][col].color !== null) {
          if (row !== writeRow) {
            tempBoard[writeRow][col] = { ...tempBoard[row][col] };
            tempBoard[row][col] = { color: null, marked: false };
          }
          writeRow--;
        }
      }
    }
  };

  const removeEmptyColumns = (tempBoard: Block[][]) => {
    const newBoard: Block[][] = Array(ROWS).fill(null).map(() => []);
    
    for (let col = 0; col < COLS; col++) {
      let isEmpty = true;
      for (let row = 0; row < ROWS; row++) {
        if (tempBoard[row][col].color !== null) {
          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) {
        for (let row = 0; row < ROWS; row++) {
          newBoard[row].push({ ...tempBoard[row][col] });
        }
      }
    }

    while (newBoard[0].length < COLS) {
      for (let row = 0; row < ROWS; row++) {
        newBoard[row].push({ color: null, marked: false });
      }
    }

    return newBoard;
  };

  const handleBlockClick = (row: number, col: number) => {
    if (!gameStarted) return;
    
    const color = board[row][col].color;
    if (!color) return;

    const tempBoard = board.map(r => r.map(b => ({ ...b, marked: false })));
    const count = markConnected(row, col, color, tempBoard);

    if (count < 2) {
      playSound(200, 0.1);
      return;
    }

    setSelectedCount(count);
    const points = count * count * 5;
    setScore(prev => prev + points);
    playSound(440 + count * 50, 0.15);

    clearMarked(tempBoard);
    dropBlocks(tempBoard);
    const finalBoard = removeEmptyColumns(tempBoard);
    
    setBoard(finalBoard);

    if (checkGameOver(finalBoard)) {
      setTimeout(() => {
        const finalScore = score + points;
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          localStorage.setItem('popstar-best-score', finalScore.toString());
        }
      }, 100);
    }
  };

  const checkGameOver = (checkBoard: Block[][]): boolean => {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const color = checkBoard[i][j].color;
        if (!color) continue;

        if (i > 0 && checkBoard[i-1][j].color === color) return false;
        if (i < ROWS - 1 && checkBoard[i+1][j].color === color) return false;
        if (j > 0 && checkBoard[i][j-1].color === color) return false;
        if (j < COLS - 1 && checkBoard[i][j+1].color === color) return false;
      }
    }
    return true;
  };

  const previewConnected = (row: number, col: number) => {
    const color = board[row][col].color;
    if (!color) return;

    const tempBoard = board.map(r => r.map(b => ({ ...b, marked: false })));
    markConnected(row, col, color, tempBoard);
    setBoard(tempBoard);
  };

  const clearPreview = () => {
    setBoard(prev => prev.map(r => r.map(b => ({ ...b, marked: false }))));
  };

  const getColorClass = (color: BlockColor) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-transparent';
    }
  };

  useEffect(() => {
    if (gameStarted && checkGameOver(board)) {
      playSound(300, 0.3);
    }
  }, [board, gameStarted]);

  const isGameOver = gameStarted && checkGameOver(board);

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">PopStar 消消看</h2>
          <Button variant="ghost" size="icon" onClick={startGame} disabled={!gameStarted}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-between mb-4 text-sm">
          <div>分数: <span className="font-bold text-primary">{score}</span></div>
          <div>最高: <span className="font-bold text-primary">{bestScore}</span></div>
          {selectedCount > 0 && <div>已选: <span className="font-bold">{selectedCount}</span></div>}
        </div>

        {!gameStarted ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">点击相同颜色的连续方块消除</p>
            <p className="text-sm text-muted-foreground mb-6">至少2个方块才能消除，连击越多分数越高！</p>
            <Button onClick={startGame} size="lg">开始游戏</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-1 bg-muted p-2 rounded-lg" style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              aspectRatio: '1'
            }}>
              {board.map((row, i) => 
                row.map((block, j) => (
                  <button
                    key={`${i}-${j}`}
                    className={`aspect-square rounded transition-all ${
                      block.color ? getColorClass(block.color) : 'bg-background'
                    } ${block.marked ? 'ring-2 ring-white scale-95' : ''} ${
                      block.color ? 'hover:scale-105' : ''
                    }`}
                    onClick={() => handleBlockClick(i, j)}
                    onMouseEnter={() => previewConnected(i, j)}
                    onMouseLeave={clearPreview}
                    disabled={!block.color || isGameOver}
                  />
                ))
              )}
            </div>

            {isGameOver && (
              <div className="text-center space-y-4 py-4 bg-muted rounded-lg">
                <p className="text-lg font-bold">游戏结束！</p>
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