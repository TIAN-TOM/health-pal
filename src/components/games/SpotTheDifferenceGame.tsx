
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, CheckCircle, XCircle, Trophy, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpotTheDifferenceGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Difference {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
}

interface GameLevel {
  id: number;
  name: string;
  image1: string;
  image2: string;
  differences: Difference[];
  timeLimit: number;
}

const SpotTheDifferenceGame = ({ onBack, soundEnabled }: SpotTheDifferenceGameProps) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [foundDifferences, setFoundDifferences] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'menu'>('menu');
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState<number | null>(null);
  const { toast } = useToast();

  // 游戏关卡数据
  const levels: GameLevel[] = [
    {
      id: 1,
      name: '花园场景',
      image1: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InNreWJsdWUiLz4KICA8IS0tIEdyb3VuZCAtLT4KICA8cmVjdCB5PSIyMDAiIHdpZHRoPSI0MDAiIGhlaWdodD0iMTAwIiBmaWxsPSJncmVlbiIvPgogIDwhLS0gVHJlZSAtLT4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSJkYXJrZ3JlZW4iLz4KICA8cmVjdCB4PSI5NSIgeT0iMTkwIiB3aWR0aD0iMTAiIGhlaWdodD0iMzAiIGZpbGw9ImJyb3duIi8+CiAgPCEtLSBGbG93ZXJzIC0tPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjI0MCIgcj0iOCIgZmlsbD0icmVkIi8+CiAgPGNpcmNsZSBjeD0iMjMwIiBjeT0iMjMwIiByPSI4IiBmaWxsPSJ5ZWxsb3ciLz4KICA8Y2lyY2xlIGN4PSIyNjAiIGN5PSIyNDAiIHI9IjgiIGZpbGw9InBpbmsiLz4KICA8IS0tIEhvdXNlIC0tPgogIDxyZWN0IHg9IjMwMCIgeT0iMTQwIiB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9InRhbiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMjkwLDE0MCAzOTAsMTQwIDM0MCwxMDAiIGZpbGw9InJlZCIvPgogIDxyZWN0IHg9IjMyMCIgeT0iMTYwIiB3aWR0aD0iMTUiIGhlaWdodD0iMjAiIGZpbGw9ImJyb3duIi8+CiAgPCEtLSBTdW4gLS0+CiAgPGNpcmNsZSBjeD0iMzUwIiBjeT0iNTAiIHI9IjIwIiBmaWxsPSJ5ZWxsb3ciLz4KPC9zdmc+',
      image2: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InNreWJsdWUiLz4KICA8IS0tIEdyb3VuZCAtLT4KICA8cmVjdCB5PSIyMDAiIHdpZHRoPSI0MDAiIGhlaWdodD0iMTAwIiBmaWxsPSJncmVlbiIvPgogIDwhLS0gVHJlZSAtLT4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSJkYXJrZ3JlZW4iLz4KICA8cmVjdCB4PSI5NSIgeT0iMTkwIiB3aWR0aD0iMTAiIGhlaWdodD0iMzAiIGZpbGw9ImJyb3duIi8+CiAgPCEtLSBGbG93ZXJzICh5ZWxsb3cgZmxvd2VyIG1pc3NpbmcpIC0tPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjI0MCIgcj0iOCIgZmlsbD0icmVkIi8+CiAgPGNpcmNsZSBjeD0iMjYwIiBjeT0iMjQwIiByPSI4IiBmaWxsPSJwaW5rIi8+CiAgPCEtLSBIb3VzZSAod2luZG93IGRpZmZlcmVudCBjb2xvcikgLS0+CiAgPHJlY3QgeD0iMzAwIiB5PSIxNDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgZmlsbD0idGFuIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIyOTAsMTQwIDM5MCwxNDAgMzQwLDEwMCIgZmlsbD0icmVkIi8+CiAgPHJlY3QgeD0iMzIwIiB5PSIxNjAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIyMCIgZmlsbD0iYmx1ZSIvPgogIDwhLS0gU3VuIChzbWFsbGVyKSAtLT4KICA8Y2lyY2xlIGN4PSIzNTAiIGN5PSI1MCIgcj0iMTUiIGZpbGw9InllbGxvdyIvPgo8L3N2Zz4=',
      differences: [
        { id: 1, x: 220, y: 220, width: 20, height: 20, found: false }, // 缺少黄花
        { id: 2, x: 315, y: 155, width: 20, height: 25, found: false }, // 窗户颜色
        { id: 3, x: 340, y: 40, width: 20, height: 20, found: false }, // 太阳大小
      ],
      timeLimit: 120
    },
    {
      id: 2,
      name: '城市街道',
      image1: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFNreSAtLT4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0ibGlnaHRibHVlIi8+CiAgPCEtLSBSb2FkIC0tPgogIDxyZWN0IHk9IjI1MCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MCIgZmlsbD0iZ3JheSIvPgogIDwhLS0gQnVpbGRpbmdzIC0tPgogIDxyZWN0IHg9IjIwIiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxNTAiIGZpbGw9ImxpZ2h0Z3JheSIvPgogIDxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxNzAiIGZpbGw9ImRhcmtncmF5Ii8+CiAgPHJlY3QgeD0iMTgwIiB5PSIxMjAiIHdpZHRoPSI3MCIgaGVpZ2h0PSIxMzAiIGZpbGw9ImxpZ2h0Z3JheSIvPgogIDxyZWN0IHg9IjI4MCIgeT0iOTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9InRhbiIvPgogIDwhLS0gV2luZG93cyAtLT4KICA8cmVjdCB4PSIzMCIgeT0iMTMwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9InllbGxvdyIvPgogIDxyZWN0IHg9IjUwIiB5PSIxMzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMTEwIiB5PSIxMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMTMwIiB5PSIxMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMTkwIiB5PSIxNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMjEwIiB5PSIxNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMjMwIiB5PSIxNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMjkwIiB5PSIxMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMzEwIiB5PSIxMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPCEtLSBDYXIgLS0+CiAgPHJlY3QgeD0iMTUwIiB5PSIyNjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0icmVkIi8+CiAgPGNpcmNsZSBjeD0iMTYwIiBjeT0iMjg1IiByPSI4IiBmaWxsPSJibGFjayIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjI4NSIgcj0iOCIgZmlsbD0iYmxhY2siLz4KPC9zdmc+',
      image2: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFNreSAtLT4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0ibGlnaHRibHVlIi8+CiAgPCEtLSBSb2FkIC0tPgogIDxyZWN0IHk9IjI1MCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MCIgZmlsbD0iZ3JheSIvPgogIDwhLS0gQnVpbGRpbmdzIC0tPgogIDxyZWN0IHg9IjIwIiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxNTAiIGZpbGw9ImxpZ2h0Z3JheSIvPgogIDxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxNzAiIGZpbGw9ImRhcmtncmF5Ii8+CiAgPHJlY3QgeD0iMTgwIiB5PSIxMjAiIHdpZHRoPSI3MCIgaGVpZ2h0PSIxMzAiIGZpbGw9ImxpZ2h0Z3JheSIvPgogIDxyZWN0IHg9IjI4MCIgeT0iOTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9InRhbiIvPgogIDwhLS0gV2luZG93cyAob25lIG1pc3NpbmcpIC0tPgogIDxyZWN0IHg9IjMwIiB5PSIxMzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iNTAiIHk9IjEzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJ5ZWxsb3ciLz4KICA8cmVjdCB4PSIxMTAiIHk9IjExMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJ5ZWxsb3ciLz4KICA8IS0tIE1pc3NpbmcgYSB3aW5kb3cgLS0+CiAgPHJlY3QgeD0iMTkwIiB5PSIxNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMjEwIiB5PSIxNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMjMwIiB5PSIxNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMjkwIiB5PSIxMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPHJlY3QgeD0iMzEwIiB5PSIxMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ieWVsbG93Ii8+CiAgPCEtLSBDYXIgKGRpZmZlcmVudCBjb2xvcikgLS0+CiAgPHJlY3QgeD0iMTUwIiB5PSIyNjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmx1ZSIvPgogIDxjaXJjbGUgY3g9IjE2MCIgY3k9IjI4NSIgcj0iOCIgZmlsbD0iYmxhY2siLz4KICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIyODUiIHI9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPCEtLSBCaXJkIGFkZGVkIC0tPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjUwIiByPSI1IiBmaWxsPSJibGFjayIvPgo8L3N2Zz4=',
      differences: [
        { id: 1, x: 125, y: 105, width: 20, height: 15, found: false }, // 缺少窗户
        { id: 2, x: 145, y: 255, width: 65, height: 25, found: false }, // 汽车颜色
        { id: 3, x: 295, y: 45, width: 10, height: 10, found: false }, // 新增小鸟
      ],
      timeLimit: 150
    }
  ];

  // 游戏计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('lost');
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // 开始游戏
  const startGame = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    setTimeLeft(levels[levelIndex].timeLimit);
    setFoundDifferences([]);
    setGameState('playing');
    setScore(0);
    setHints(3);
    setShowHint(null);
  };

  // 处理点击
  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>, imageIndex: number) => {
    if (gameState !== 'playing') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const level = levels[currentLevel];
    const clickedDifference = level.differences.find(diff => 
      !foundDifferences.includes(diff.id) &&
      x >= diff.x && x <= diff.x + diff.width &&
      y >= diff.y && y <= diff.y + diff.height
    );

    if (clickedDifference) {
      const newFound = [...foundDifferences, clickedDifference.id];
      setFoundDifferences(newFound);
      setScore(score + 100 + timeLeft); // 基础分数 + 时间奖励
      
      if (soundEnabled) {
        // 播放成功音效
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLRJHkBQo7Xd8O3wVbO6/pKrjC6Fm8a5/zk8Wd/x8/Eaff3VNJkNJIXM8tXNNw/V8cXxNLX2');
        audio.play().catch(() => {});
      }

      toast({
        title: "找到了！",
        description: `获得 ${100 + timeLeft} 分`,
      });

      if (newFound.length === level.differences.length) {
        setGameState('won');
        toast({
          title: "恭喜通关！",
          description: `总分：${score + 100 + timeLeft} 分`,
        });
      }
    } else {
      // 错误点击扣分
      setScore(Math.max(0, score - 20));
      if (soundEnabled) {
        // 播放错误音效
        const audio = new Audio('data:audio/wav;base64,UklGRvQEAABXQVZFZm1kIBAAAAAAEAACAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAG');
        audio.play().catch(() => {});
      }
    }
  };

  // 使用提示
  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;
    
    const level = levels[currentLevel];
    const unfoundDifference = level.differences.find(diff => !foundDifferences.includes(diff.id));
    
    if (unfoundDifference) {
      setShowHint(unfoundDifference.id);
      setHints(hints - 1);
      setTimeout(() => setShowHint(null), 3000);
    }
  };

  // 重新开始
  const restartGame = () => {
    startGame(currentLevel);
  };

  // 返回菜单
  const backToMenu = () => {
    setGameState('menu');
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回游戏列表
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold flex items-center justify-center">
              <Eye className="h-6 w-6 mr-2 text-purple-600" />
              找不同
            </CardTitle>
            <p className="text-center text-gray-600">仔细观察两张图片，找出它们之间的不同之处</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {levels.map((level, index) => (
                <Card key={level.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <img 
                        src={level.image1} 
                        alt={`${level.name} 预览`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{level.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {level.timeLimit}秒
                      </Badge>
                      <Badge variant="outline">
                        {level.differences.length} 处不同
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => startGame(index)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      开始挑战
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">游戏说明</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 仔细比较两张图片，找出所有不同之处</li>
                <li>• 点击你认为不同的地方</li>
                <li>• 找对加分，点错扣分</li>
                <li>• 可以使用提示，但次数有限</li>
                <li>• 在时间用完前找到所有不同即可获胜</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const level = levels[currentLevel];
  const progress = (foundDifferences.length / level.differences.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={backToMenu}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回关卡选择
        </Button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-red-600" />
            <span className="font-mono text-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center">
            <Trophy className="h-4 w-4 mr-1 text-yellow-600" />
            <span className="font-bold">{score}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={useHint}
            disabled={hints <= 0}
          >
            <Zap className="h-4 w-4 mr-1" />
            提示 ({hints})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{level.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                已找到 {foundDifferences.length}/{level.differences.length}
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* 左图 */}
            <div className="relative">
              <h3 className="text-center mb-2 font-medium">图片 A</h3>
              <div 
                className="relative cursor-crosshair border-2 border-gray-300 rounded-lg overflow-hidden"
                onClick={(e) => handleImageClick(e, 0)}
              >
                <img 
                  src={level.image1} 
                  alt="图片 A"
                  className="w-full h-auto"
                  draggable={false}
                />
                
                {/* 显示已找到的不同点 */}
                {level.differences.map(diff => (
                  foundDifferences.includes(diff.id) && (
                    <div
                      key={`found-${diff.id}`}
                      className="absolute border-2 border-green-500 bg-green-200 bg-opacity-50 rounded-full animate-pulse"
                      style={{
                        left: diff.x,
                        top: diff.y,
                        width: diff.width,
                        height: diff.height
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  )
                ))}

                {/* 显示提示 */}
                {showHint && level.differences.find(d => d.id === showHint) && (
                  <div
                    className="absolute border-2 border-yellow-500 bg-yellow-200 bg-opacity-50 rounded-full animate-bounce"
                    style={{
                      left: level.differences.find(d => d.id === showHint)?.x,
                      top: level.differences.find(d => d.id === showHint)?.y,
                      width: level.differences.find(d => d.id === showHint)?.width,
                      height: level.differences.find(d => d.id === showHint)?.height
                    }}
                  />
                )}
              </div>
            </div>

            {/* 右图 */}
            <div className="relative">
              <h3 className="text-center mb-2 font-medium">图片 B</h3>
              <div 
                className="relative cursor-crosshair border-2 border-gray-300 rounded-lg overflow-hidden"
                onClick={(e) => handleImageClick(e, 1)}
              >
                <img 
                  src={level.image2} 
                  alt="图片 B"
                  className="w-full h-auto"
                  draggable={false}
                />
                
                {/* 显示已找到的不同点 */}
                {level.differences.map(diff => (
                  foundDifferences.includes(diff.id) && (
                    <div
                      key={`found-${diff.id}`}
                      className="absolute border-2 border-green-500 bg-green-200 bg-opacity-50 rounded-full animate-pulse"
                      style={{
                        left: diff.x,
                        top: diff.y,
                        width: diff.width,
                        height: diff.height
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  )
                ))}

                {/* 显示提示 */}
                {showHint && level.differences.find(d => d.id === showHint) && (
                  <div
                    className="absolute border-2 border-yellow-500 bg-yellow-200 bg-opacity-50 rounded-full animate-bounce"
                    style={{
                      left: level.differences.find(d => d.id === showHint)?.x,
                      top: level.differences.find(d => d.id === showHint)?.y,
                      width: level.differences.find(d => d.id === showHint)?.width,
                      height: level.differences.find(d => d.id === showHint)?.height
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 游戏结束状态 */}
          {gameState === 'won' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-green-800 mb-2">恭喜通关！</h3>
              <p className="text-green-700">最终得分: {score} 分</p>
              <div className="mt-3 space-x-2">
                <Button onClick={restartGame} variant="outline">
                  重新挑战
                </Button>
                <Button onClick={backToMenu}>
                  选择关卡
                </Button>
              </div>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-red-800 mb-2">时间到！</h3>
              <p className="text-red-700">已找到 {foundDifferences.length}/{level.differences.length} 个不同</p>
              <div className="mt-3 space-x-2">
                <Button onClick={restartGame} variant="outline">
                  重新挑战
                </Button>
                <Button onClick={backToMenu}>
                  选择关卡
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotTheDifferenceGame;
