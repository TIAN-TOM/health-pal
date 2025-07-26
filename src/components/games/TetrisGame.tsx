import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, RotateCw, ArrowDown, ArrowUp } from 'lucide-react';

interface TetrisGameProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

// 俄罗斯方块形状定义
const TETRIS_SHAPES = [
  // I形状
  [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]]
  ],
  // O形状
  [
    [[1, 1], [1, 1]]
  ],
  // T形状
  [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]]
  ],
  // S形状
  [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]]
  ],
  // Z形状
  [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]]
  ],
  // J形状
  [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]]
  ],
  // L形状
  [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]]
  ]
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = [
  '#FF0000', // 红色
  '#00FF00', // 绿色
  '#0000FF', // 蓝色
  '#FFFF00', // 黄色
  '#FF00FF', // 紫色
  '#00FFFF', // 青色
  '#FFA500'  // 橙色
];

interface Piece {
  shape: number[][];
  x: number;
  y: number;
  type: number;
  rotation: number;
}

const TetrisGame = ({ onBack, soundEnabled = true }: TetrisGameProps) => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 创建新方块
  const createPiece = useCallback((type?: number): Piece => {
    const pieceType = type !== undefined ? type : Math.floor(Math.random() * TETRIS_SHAPES.length);
    const shapes = TETRIS_SHAPES[pieceType];
    return {
      shape: shapes[0],
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      type: pieceType,
      rotation: 0
    };
  }, []);

  // 检查是否可以放置方块
  const canPlacePiece = useCallback((piece: Piece, board: number[][], dx = 0, dy = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  // 旋转方块
  const rotatePiece = useCallback((piece: Piece): Piece => {
    const shapes = TETRIS_SHAPES[piece.type];
    const nextRotation = (piece.rotation + 1) % shapes.length;
    return {
      ...piece,
      shape: shapes[nextRotation],
      rotation: nextRotation
    };
  }, []);

  // 放置方块到游戏板
  const placePiece = useCallback((piece: Piece, board: number[][]): number[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.type + 1;
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  // 清除完整的行
  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; clearedLines: number } => {
    const newBoard = [];
    let clearedLines = 0;
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (!board[y].every(cell => cell !== 0)) {
        newBoard.push([...board[y]]);
      } else {
        clearedLines++;
      }
    }
    
    // 在顶部添加空行
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, clearedLines };
  }, []);

  // 移动方块
  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;
    
    if (canPlacePiece(currentPiece, board, dx, dy)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null);
    } else if (dy > 0) {
      // 方块不能再向下移动，固定它
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, clearedLines: cleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLines(prev => prev + cleared);
      setScore(prev => prev + cleared * 100 * level);
      setLevel(Math.floor((lines + cleared) / 10) + 1);
      
      // 创建新方块
      if (nextPiece) {
        if (canPlacePiece(nextPiece, clearedBoard)) {
          setCurrentPiece(nextPiece);
          setNextPiece(createPiece());
        } else {
          setGameOver(true);
          setIsPlaying(false);
        }
      }
    }
  }, [currentPiece, board, gameOver, isPaused, canPlacePiece, placePiece, clearLines, nextPiece, level, lines, createPiece]);

  // 旋转当前方块（增加墙踢机制）
  const handleRotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    const rotated = rotatePiece(currentPiece);
    
    // 尝试基本旋转
    if (canPlacePiece(rotated, board)) {
      setCurrentPiece(rotated);
      return;
    }
    
    // 墙踢尝试：向左移动一格
    if (canPlacePiece(rotated, board, -1, 0)) {
      setCurrentPiece(prev => prev ? { ...rotated, x: prev.x - 1 } : null);
      return;
    }
    
    // 墙踢尝试：向右移动一格
    if (canPlacePiece(rotated, board, 1, 0)) {
      setCurrentPiece(prev => prev ? { ...rotated, x: prev.x + 1 } : null);
      return;
    }
    
    // 墙踢尝试：向上移动一格（特殊情况）
    if (canPlacePiece(rotated, board, 0, -1)) {
      setCurrentPiece(prev => prev ? { ...rotated, y: prev.y - 1 } : null);
      return;
    }
    
    // 如果所有墙踢都失败，则旋转失败
  }, [currentPiece, gameOver, isPaused, rotatePiece, canPlacePiece, board]);

  // 硬降（直接落到底部）
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    let piece = { ...currentPiece };
    while (canPlacePiece(piece, board, 0, 1)) {
      piece.y++;
    }
    setCurrentPiece(piece);
    movePiece(0, 1); // 立即触发固定
  }, [currentPiece, gameOver, isPaused, canPlacePiece, board, movePiece]);

  // 开始新游戏
  const startGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    const firstPiece = createPiece();
    const second = createPiece();
    
    setBoard(newBoard);
    setCurrentPiece(firstPiece);
    setNextPiece(second);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, [createPiece]);

  // 游戏循环
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      const speed = Math.max(100, 1000 - (level - 1) * 100);
      intervalRef.current = setInterval(() => {
        movePiece(0, 1);
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused, gameOver, level, movePiece]);

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          handleRotate();
          break;
        case 'Enter':
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isPaused, gameOver, movePiece, handleRotate, hardDrop]);

  // 渲染游戏板
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // 绘制当前方块
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.type + 1;
            }
          }
        }
      }
    }
    
    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-6 h-6 border border-gray-300"
            style={{
              backgroundColor: cell ? COLORS[cell - 1] : 'white'
            }}
          />
        ))}
      </div>
    ));
  };

  // 渲染下一个方块
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    return nextPiece.shape.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-4 h-4 border border-gray-300"
            style={{
              backgroundColor: cell ? COLORS[nextPiece.type] : 'transparent'
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">🧩 俄罗斯方块</h1>
          <div className="w-16" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 游戏区域 */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-center mb-4">
                  <div className="inline-block border-2 border-gray-800 bg-black p-2">
                    {renderBoard()}
                  </div>
                </div>
                
                {gameOver && (
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">游戏结束</h2>
                    <p className="text-gray-600">最终得分: {score}</p>
                  </div>
                )}
                
                <div className="flex justify-center gap-2">
                  {!isPlaying ? (
                    <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-2" />
                      开始游戏
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsPaused(!isPaused)}
                      variant="outline"
                    >
                      {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                      {isPaused ? '继续' : '暂停'}
                    </Button>
                  )}
                  <Button onClick={startGame} variant="outline">
                    重新开始
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-4">
            {/* 得分信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">游戏信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>得分:</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>等级:</span>
                  <span className="font-bold">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span>行数:</span>
                  <span className="font-bold">{lines}</span>
                </div>
              </CardContent>
            </Card>

            {/* 下一个方块 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">下一个</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="inline-block border border-gray-300 p-2 bg-white">
                    {renderNextPiece()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 控制说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">控制方式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>移动:</span>
                  <span>← →</span>
                </div>
                <div className="flex justify-between">
                  <span>加速:</span>
                  <span>↓</span>
                </div>
                <div className="flex justify-between">
                  <span>旋转:</span>
                  <span>↑ 空格</span>
                </div>
                <div className="flex justify-between">
                  <span>硬降:</span>
                  <span>Enter</span>
                </div>
              </CardContent>
            </Card>

            {/* 移动端控制按钮 */}
            <Card className="lg:hidden">
              <CardHeader>
                <CardTitle className="text-lg">触屏控制</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="col-span-3 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleRotate}
                      disabled={!isPlaying || isPaused || gameOver}
                      className="w-full h-12"
                    >
                      <RotateCw className="h-5 w-5 mr-2" />
                      旋转
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => movePiece(-1, 0)}
                    disabled={!isPlaying || isPaused || gameOver}
                    className="h-12 text-lg"
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => movePiece(0, 1)}
                    disabled={!isPlaying || isPaused || gameOver}
                    className="h-12"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => movePiece(1, 0)}
                    disabled={!isPlaying || isPaused || gameOver}
                    className="h-12 text-lg"
                  >
                    →
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={hardDrop}
                    disabled={!isPlaying || isPaused || gameOver}
                    className="h-12"
                  >
                    <ArrowUp className="h-5 w-5 mr-2" />
                    瞬间下降
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;