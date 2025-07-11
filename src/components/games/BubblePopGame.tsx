import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';

interface BubblePopGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  color: string;
  popped: boolean;
  size: number;
}

const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];

const BubblePopGame = ({ onBack, soundEnabled }: BubblePopGameProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [lastPopTime, setLastPopTime] = useState(0);

  const generateBubble = useCallback((id: number): Bubble => {
    return {
      id,
      x: Math.random() * 90, // 0-90% to stay within bounds
      y: Math.random() * 85, // 0-85% to stay within bounds
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      popped: false,
      size: Math.random() * 30 + 20 // 20-50px
    };
  }, []);

  const createBubbles = useCallback(() => {
    const bubbleCount = Math.min(5 + level * 2, 15);
    const newBubbles = Array.from({ length: bubbleCount }, (_, i) => generateBubble(i));
    setBubbles(newBubbles);
  }, [level, generateBubble]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setCombo(0);
    createBubbles();
  };

  const resetGame = () => {
    setGameActive(false);
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setCombo(0);
    setBubbles([]);
  };

  const popBubble = (bubbleId: number) => {
    if (!gameActive) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastPopTime;
    
    setBubbles(prev => prev.map(bubble => 
      bubble.id === bubbleId ? { ...bubble, popped: true } : bubble
    ));

    // 计算连击
    let newCombo = combo;
    if (timeDiff < 1000 && combo > 0) { // 1秒内连击
      newCombo = combo + 1;
    } else {
      newCombo = 1;
    }
    setCombo(newCombo);
    setLastPopTime(currentTime);

    // 计算得分 (基础分 + 连击奖励 + 关卡奖励)
    const baseScore = 10;
    const comboBonus = newCombo > 1 ? (newCombo - 1) * 5 : 0;
    const levelBonus = level * 2;
    const totalScore = baseScore + comboBonus + levelBonus;
    
    setScore(prev => prev + totalScore);

    // 移除气泡并生成新的
    setTimeout(() => {
      setBubbles(prev => {
        const remaining = prev.filter(b => b.id !== bubbleId || b.popped);
        const unpopped = remaining.filter(b => !b.popped);
        
        // 如果所有气泡都被戳破，进入下一关
        if (unpopped.length === 0) {
          setLevel(prevLevel => prevLevel + 1);
          setTimeLeft(prevTime => Math.min(prevTime + 10, 60)); // 每关增加10秒，最多60秒
          return [];
        }
        
        return remaining.filter(b => !b.popped);
      });
    }, 300);
  };

  // 游戏计时器
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  // 关卡进度 - 创建新气泡
  useEffect(() => {
    if (gameActive && bubbles.length === 0) {
      setTimeout(() => createBubbles(), 500);
    }
  }, [gameActive, bubbles.length, createBubbles]);

  // 自动生成新气泡
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setBubbles(prev => {
        if (prev.length < 8) {
          const newBubble = generateBubble(Date.now());
          return [...prev, newBubble];
        }
        return prev;
      });
    }, 2000 - (level * 100)); // 关卡越高，生成越快

    return () => clearInterval(interval);
  }, [gameActive, level, generateBubble]);

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🫧 泡泡消消乐</CardTitle>
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="font-semibold">得分: {score}</div>
              <div className="text-gray-600">关卡: {level}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">时间: {timeLeft}s</div>
              {combo > 1 && (
                <div className="text-purple-600 font-bold">连击 x{combo}!</div>
              )}
            </div>
            <div className="space-y-1">
              {!gameActive ? (
                <Button size="sm" onClick={startGame} className="bg-blue-500 hover:bg-blue-600">
                  开始游戏
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={resetGame}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  重置
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div 
              className="relative bg-gradient-to-b from-sky-100 to-blue-200 rounded-lg overflow-hidden"
              style={{ height: '400px' }}
            >
              {gameActive && bubbles.map(bubble => (
                <div
                  key={bubble.id}
                  className={`
                    absolute rounded-full cursor-pointer transition-all duration-300 transform hover:scale-110
                    ${bubble.color} ${bubble.popped ? 'animate-ping opacity-0' : 'opacity-80 hover:opacity-100'}
                    flex items-center justify-center text-white font-bold shadow-lg
                  `}
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    fontSize: `${bubble.size / 3}px`
                  }}
                  onClick={() => popBubble(bubble.id)}
                >
                  ✨
                </div>
              ))}

              {!gameActive && timeLeft === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-2xl font-bold mb-2">时间到!</h3>
                    <p className="text-lg mb-2">最终得分: {score}</p>
                    <p className="text-sm mb-4">达到关卡: {level}</p>
                    <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700">
                      再来一局
                    </Button>
                  </div>
                </div>
              )}

              {!gameActive && timeLeft > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">泡泡消消乐</h3>
                    <p className="mb-4">点击彩色气泡来戳破它们!</p>
                    <p className="text-sm mb-4">快速连击可以获得额外分数</p>
                    <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700">
                      开始游戏
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>快速点击气泡获得连击奖励</p>
            <p>每关通过后时间会增加，挑战更高分数!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BubblePopGame;