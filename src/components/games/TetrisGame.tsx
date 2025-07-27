import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCw, Pause, Play, Home, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_FALL_TIME = 1000;

const TetrisGame = ({ onBack }: { onBack: () => void }) => {
  const [board, setBoard] = useState<string[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const fallTimeRef = useRef(INITIAL_FALL_TIME);
  const boardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const createRandomPiece = useCallback((): Piece => {
    const tetrominoKeys = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
    const randomKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
    const tetromino = TETROMINOS[randomKey];
    
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    };
  }, []);

  const isValidMove = useCallback((piece: Piece, deltaX = 0, deltaY = 0, newShape?: number[][]) => {
    const shape = newShape || piece.shape;
    const newX = piece.x + deltaX;
    const newY = piece.y + deltaY;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }
          if (boardY >= 0 && board[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const rotatePiece = useCallback((piece: Piece) => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return rotated;
  }, []);

  const clearLines = useCallback((newBoard: string[][]) => {
    let linesCleared = 0;
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== '')) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (clearedBoard.length < BOARD_HEIGHT) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(''));
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] * level;
      setScore(prev => prev + points);
      setLines(prev => prev + linesCleared);
      setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1);
      fallTimeRef.current = Math.max(50, INITIAL_FALL_TIME - (level - 1) * 100);
      
      toast({
        title: `消除了 ${linesCleared} 行！`,
        description: `获得 ${points} 分`,
      });
    }

    return clearedBoard;
  }, [level, lines, toast]);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    const clearedBoard = clearLines(newBoard);
    setBoard(clearedBoard);
    
    setCurrentPiece(nextPiece);
    setNextPiece(createRandomPiece());
  }, [currentPiece, nextPiece, board, clearLines, createRandomPiece]);

  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    if (!currentPiece || gameOver || paused) return false;

    if (isValidMove(currentPiece, deltaX, deltaY)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + deltaX, y: prev.y + deltaY } : null);
      return true;
    }

    if (deltaY > 0) {
      placePiece();
    }
    return false;
  }, [currentPiece, gameOver, paused, isValidMove, placePiece]);

  const rotatePieceAction = useCallback(() => {
    if (!currentPiece || gameOver || paused) return;

    const rotated = rotatePiece(currentPiece);
    if (isValidMove(currentPiece, 0, 0, rotated)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotated } : null);
    }
  }, [currentPiece, gameOver, paused, rotatePiece, isValidMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || paused) return;

    let dropDistance = 0;
    while (isValidMove(currentPiece, 0, dropDistance + 1)) {
      dropDistance++;
    }

    if (dropDistance > 0) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + dropDistance } : null);
      setTimeout(placePiece, 50);
    }
  }, [currentPiece, gameOver, paused, isValidMove, placePiece]);

  const checkGameOver = useCallback(() => {
    if (nextPiece && !isValidMove(nextPiece)) {
      setGameOver(true);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      toast({
        title: "游戏结束！",
        description: `最终得分: ${score}`,
        variant: "destructive",
      });
    }
  }, [nextPiece, isValidMove, score, toast]);

  // Touch handling for drag controls
  const getCellFromPosition = useCallback((clientX: number, clientY: number) => {
    if (!boardRef.current) return null;
    
    const rect = boardRef.current.getBoundingClientRect();
    const cellWidth = rect.width / BOARD_WIDTH;
    const cellHeight = rect.height / BOARD_HEIGHT;
    
    const x = Math.floor((clientX - rect.left) / cellWidth);
    const y = Math.floor((clientY - rect.top) / cellHeight);
    
    if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
      return { x, y };
    }
    return null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!currentPiece || gameOver || paused) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    
    if (cell) {
      setDragStart({ x: currentPiece.x, y: currentPiece.y });
      setIsDragging(true);
    }
  }, [currentPiece, gameOver, paused, getCellFromPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!currentPiece || !isDragging || !dragStart || gameOver || paused) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    
    if (cell) {
      const deltaX = cell.x - dragStart.x;
      const deltaY = Math.max(0, cell.y - dragStart.y); // Only allow downward movement
      
      const newX = dragStart.x + deltaX;
      const newY = dragStart.y + deltaY;
      
      if (isValidMove({ ...currentPiece, x: newX, y: newY })) {
        setCurrentPiece(prev => prev ? { ...prev, x: newX, y: newY } : null);
      }
    }
  }, [currentPiece, isDragging, dragStart, gameOver, paused, getCellFromPosition, isValidMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || paused) return;

    gameLoopRef.current = setInterval(() => {
      movePiece(0, 1);
    }, fallTimeRef.current);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, paused, movePiece]);

  useEffect(() => {
    checkGameOver();
  }, [currentPiece, checkGameOver]);

  const startGame = () => {
    const firstPiece = createRandomPiece();
    const secondPiece = createRandomPiece();
    
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setGameStarted(true);
    fallTimeRef.current = INITIAL_FALL_TIME;
  };

  const resetGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    setGameStarted(false);
    setCurrentPiece(null);
    setNextPiece(null);
  };

  const togglePause = () => {
    setPaused(prev => !prev);
  };

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="w-6 h-6 border border-gray-300 flex-shrink-0"
            style={{
              backgroundColor: cell || '#f8f9fa',
              border: cell ? '1px solid #333' : '1px solid #ddd'
            }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;

    return (
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)` }}>
        {nextPiece.shape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="w-4 h-4 border"
              style={{
                backgroundColor: cell ? nextPiece.color : 'transparent',
                borderColor: cell ? '#333' : '#ddd'
              }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2">返回</span>
          </Button>
          <h1 className="text-xl font-bold text-center flex-1">俄罗斯方块</h1>
          <div className="w-20" />
        </div>

        {!gameStarted ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">俄罗斯方块</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  在游戏区域内拖动方块进行移动
                </p>
                <p className="text-sm text-gray-600">
                  点击旋转按钮进行方块旋转
                </p>
              </div>
              <Button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                开始游戏
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg shadow">
                <div className="text-xs text-gray-500">得分</div>
                <div className="font-bold">{score}</div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow">
                <div className="text-xs text-gray-500">等级</div>
                <div className="font-bold">{level}</div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow">
                <div className="text-xs text-gray-500">行数</div>
                <div className="font-bold">{lines}</div>
              </div>
            </div>

            {/* Next Piece */}
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-2">下一个：</div>
                <div className="flex justify-center">
                  {renderNextPiece()}
                </div>
              </CardContent>
            </Card>

            {/* Game Board */}
            <Card>
              <CardContent className="p-2">
                <div 
                  ref={boardRef}
                  className="bg-gray-100 border-2 border-gray-300 mx-auto touch-none select-none"
                  style={{ width: 'fit-content' }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderBoard()}
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={rotatePieceAction}
                disabled={gameOver || paused}
                className="h-12"
              >
                <RotateCw className="h-5 w-5 mr-2" />
                旋转
              </Button>
              <Button
                variant="outline"
                onClick={hardDrop}
                disabled={gameOver || paused}
                className="h-12"
              >
                ⬇️ 硬降
              </Button>
            </div>

            {/* Game Control Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={togglePause}
                disabled={gameOver}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={resetGame}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>

            {/* Game Over */}
            {gameOver && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-red-800 mb-2">游戏结束！</h3>
                  <p className="text-red-600 mb-3">最终得分: {score}</p>
                  <Button onClick={startGame} className="bg-red-600 hover:bg-red-700">
                    重新开始
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">触屏操作说明</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• 在游戏区域内拖动方块进行移动</p>
                  <p>• 点击"旋转"按钮进行方块旋转</p>
                  <p>• 点击"硬降"直接下落到底部</p>
                  <p>• 只能水平移动和向下移动</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TetrisGame;