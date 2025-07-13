
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Game2048Props {
  onBack: () => void;
  soundEnabled: boolean;
}

type Board = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';

const Game2048 = ({ onBack, soundEnabled }: Game2048Props) => {
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const isMobile = useIsMobile();

  function initializeBoard(): Board {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  function addRandomTile(board: Board): void {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  const move = useCallback((direction: Direction) => {
    if (gameOver) return;

    const newBoard = board.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;

    function slideArray(arr: number[]): { array: number[], score: number, moved: boolean } {
      const filtered = arr.filter(num => num !== 0);
      const merged = [];
      let arrayMoved = false;
      let arrayScore = 0;

      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          arrayScore += filtered[i] * 2;
          i++; // Skip next element
          arrayMoved = true;
        } else {
          merged.push(filtered[i]);
        }
      }

      // Pad with zeros
      while (merged.length < 4) {
        merged.push(0);
      }

      // Check if array changed
      if (!arrayMoved) {
        arrayMoved = !arr.every((val, index) => val === merged[index]);
      }

      return { array: merged, score: arrayScore, moved: arrayMoved };
    }

    if (direction === 'left') {
      for (let i = 0; i < 4; i++) {
        const result = slideArray(newBoard[i]);
        newBoard[i] = result.array;
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const result = slideArray([...newBoard[i]].reverse());
        newBoard[i] = result.array.reverse();
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < 4; j++) {
        const column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
        const result = slideArray(column);
        for (let i = 0; i < 4; i++) {
          newBoard[i][j] = result.array[i];
        }
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    } else if (direction === 'down') {
      for (let j = 0; j < 4; j++) {
        const column = [newBoard[3][j], newBoard[2][j], newBoard[1][j], newBoard[0][j]];
        const result = slideArray(column);
        const reversedArray = result.array.reverse();
        for (let i = 0; i < 4; i++) {
          newBoard[i][j] = reversedArray[i];
        }
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      const newScore = score + scoreIncrease;
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
      }

      // Check for 2048 tile
      if (!won && newBoard.some(row => row.some(cell => cell === 2048))) {
        setWon(true);
      }

      // Check for game over
      if (!canMove(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, score, bestScore, gameOver, won]);

  function canMove(board: Board): boolean {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return true;
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = board[i][j];
        if (
          (i < 3 && board[i + 1][j] === current) ||
          (j < 3 && board[i][j + 1] === current)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // 触屏滑动控制
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    const minSwipeDistance = 50; // 增加最小滑动距离以避免误触
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > minSwipeDistance) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > minSwipeDistance) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }
    
    setTouchStart(null);
  };

  // 键盘控制（桌面端辅助）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  const resetGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const getTileColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      0: 'bg-gray-200',
      2: 'bg-yellow-100 text-gray-800',
      4: 'bg-yellow-200 text-gray-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-red-400 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white text-sm',
      256: 'bg-yellow-500 text-white text-sm',
      512: 'bg-yellow-600 text-white text-sm',
      1024: 'bg-orange-500 text-white text-xs',
      2048: 'bg-yellow-600 text-white text-xs font-bold'
    };
    return colors[value] || 'bg-purple-500 text-white text-xs';
  };

  const tileSize = isMobile ? 'w-16 h-16' : 'w-20 h-20';
  const fontSize = isMobile ? 'text-sm' : 'text-base';

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-xl md:text-2xl">🎯 2048</CardTitle>
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="font-semibold">得分: {score}</div>
              <div className="text-gray-600">最佳: {bestScore}</div>
            </div>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">重新开始</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div 
              className="grid grid-cols-4 gap-2 bg-gray-300 p-3 rounded-lg mx-auto touch-none select-none"
              style={{ width: 'fit-content' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {board.flat().map((value, index) => (
                <div
                  key={index}
                  className={`
                    ${tileSize} rounded flex items-center justify-center font-bold
                    transition-all duration-200 transform
                    ${getTileColor(value)} ${fontSize}
                    ${value !== 0 ? 'scale-100' : 'scale-95'}
                  `}
                >
                  {value !== 0 && value}
                </div>
              ))}
            </div>

            {won && !gameOver && (
              <div className="absolute inset-0 bg-yellow-500 bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="text-center text-white p-4">
                  <Trophy className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">恭喜!</h3>
                  <p className="mb-4">你达到了 2048!</p>
                  <div className="space-y-2">
                    <Button onClick={() => setWon(false)} variant="secondary" className="w-full">
                      继续游戏
                    </Button>
                    <Button onClick={resetGame} className="bg-yellow-600 hover:bg-yellow-700 w-full">
                      重新开始
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="text-center text-white p-4">
                  <h3 className="text-xl font-bold mb-2">游戏结束!</h3>
                  <p className="mb-4">最终得分: {score}</p>
                  <Button onClick={resetGame} className="bg-red-600 hover:bg-red-700 w-full">
                    再来一局
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 移动端方向控制按钮 */}
          {isMobile && (
            <div className="grid grid-cols-3 gap-2 max-w-40 mx-auto">
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => move('up')}
                className="h-12 w-12 p-0 text-lg"
                disabled={gameOver}
              >
                ↑
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => move('left')}
                className="h-12 w-12 p-0 text-lg"
                disabled={gameOver}
              >
                ←
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => move('right')}
                className="h-12 w-12 p-0 text-lg"
                disabled={gameOver}
              >
                →
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => move('down')}
                className="h-12 w-12 p-0 text-lg"
                disabled={gameOver}
              >
                ↓
              </Button>
              <div></div>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 space-y-1">
            {isMobile ? (
              <>
                <p>在游戏区域滑动或使用方向按钮移动数字块</p>
                <p>相同数字合并，目标是达到2048!</p>
              </>
            ) : (
              <>
                <p>使用方向键、WASD或在游戏区域滑动移动数字块</p>
                <p>相同数字合并，目标是达到2048!</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Game2048;
