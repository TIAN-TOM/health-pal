import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import { useHighScore } from '@/hooks/useHighScore';

interface BubblePopGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  color: typeof COLORS[0];
  popped: boolean;
  size: number;
  isSpecial?: boolean;
  speed?: number;
}

const COLORS = [
  { bg: 'bg-red-400', glow: 'shadow-red-300', points: 10 },
  { bg: 'bg-blue-400', glow: 'shadow-blue-300', points: 10 },
  { bg: 'bg-green-400', glow: 'shadow-green-300', points: 10 },
  { bg: 'bg-yellow-400', glow: 'shadow-yellow-300', points: 15 },
  { bg: 'bg-purple-400', glow: 'shadow-purple-300', points: 15 },
  { bg: 'bg-pink-400', glow: 'shadow-pink-300', points: 20 },
  { bg: 'bg-orange-400', glow: 'shadow-orange-300', points: 25 },
];

const BubblePopGame = ({ onBack, soundEnabled }: BubblePopGameProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [lastPopTime, setLastPopTime] = useState(0);
  const [powerUps, setPowerUps] = useState<string[]>([]);
  const [animatingBubbles, setAnimatingBubbles] = useState<number[]>([]);
  const { highScore, reportScore } = useHighScore('bubble-pop-high-score');

  const generateBubble = useCallback((id: number): Bubble => {
    const isSpecial = Math.random() < 0.1; // 10% 特殊气泡
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    return {
      id,
      x: Math.random() * 85, // 0-85% to stay within bounds
      y: Math.random() * 80, // 0-80% to stay within bounds
      color,
      popped: false,
      size: isSpecial ? Math.random() * 20 + 35 : Math.random() * 25 + 20, // 特殊气泡更大
      isSpecial,
      speed: isSpecial ? Math.random() * 2 + 0.5 : Math.random() * 1 + 0.2 // 特殊气泡移动更快
    };
  }, []);

  const createBubbles = useCallback(() => {
    const bubbleCount = Math.min(6 + level * 2, 20);
    const newBubbles = Array.from({ length: bubbleCount }, (_, i) => generateBubble(i));
    setBubbles(newBubbles);
  }, [level, generateBubble]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setCombo(0);
    setPowerUps([]);
    setAnimatingBubbles([]);
    createBubbles();
  };

  const resetGame = () => {
    setGameActive(false);
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setCombo(0);
    setPowerUps([]);
    setAnimatingBubbles([]);
    setBubbles([]);
  };

  const popBubble = (bubbleId: number) => {
    if (!gameActive || animatingBubbles.includes(bubbleId)) return;

    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastPopTime;
    
    setAnimatingBubbles(prev => [...prev, bubbleId]);
    
    setBubbles(prev => prev.map(b => 
      b.id === bubbleId ? { ...b, popped: true } : b
    ));

    // 计算连击
    let newCombo = combo;
    if (timeDiff < 1500 && combo > 0) { // 1.5秒内连击
      newCombo = combo + 1;
    } else {
      newCombo = 1;
    }
    setCombo(newCombo);
    setLastPopTime(currentTime);

    // 计算得分 (基础分 + 颜色奖励 + 连击奖励 + 关卡奖励 + 特殊奖励)
    let baseScore = bubble.color.points;
    const comboBonus = newCombo > 1 ? (newCombo - 1) * 5 : 0;
    const levelBonus = level * 2;
    const specialBonus = bubble.isSpecial ? 50 : 0;
    
    if (powerUps.includes('double')) {
      baseScore *= 2;
    }
    
    const totalScore = baseScore + comboBonus + levelBonus + specialBonus;
    setScore(prev => prev + totalScore);

    // 特殊气泡效果
    if (bubble.isSpecial) {
      const effects = ['freeze', 'double', 'bonus_time'];
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];
      
      setPowerUps(prev => [...prev, randomEffect]);
      
      // 特殊效果处理
      if (randomEffect === 'freeze') {
        // 冻结所有气泡2秒
        setTimeout(() => setPowerUps(prev => prev.filter(p => p !== 'freeze')), 2000);
      } else if (randomEffect === 'double') {
        // 双倍得分5秒
        setTimeout(() => setPowerUps(prev => prev.filter(p => p !== 'double')), 5000);
      } else if (randomEffect === 'bonus_time') {
        // 奖励时间
        setTimeLeft(prev => prev + 10);
        setPowerUps(prev => prev.filter(p => p !== 'bonus_time'));
      }
    }

    // 连击特殊效果
    if (newCombo >= 5) {
      setTimeLeft(prev => prev + 5); // 连击5次奖励5秒
    }

    // 移除气泡并生成新的
    setTimeout(() => {
      setAnimatingBubbles(prev => prev.filter(id => id !== bubbleId));
      setBubbles(prev => {
        const remaining = prev.filter(b => b.id !== bubbleId);
        const unpopped = remaining.filter(b => !b.popped);
        
        // 如果所有气泡都被戳破，进入下一关
        if (unpopped.length === 0) {
          setLevel(prevLevel => prevLevel + 1);
          setTimeLeft(prevTime => Math.min(prevTime + 15, 60)); // 每关增加15秒，最多60秒
          return [];
        }
        
        return remaining;
      });
    }, 400);
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
        if (prev.length < 12 + level) {
          const newBubble = generateBubble(Date.now() + Math.random());
          return [...prev, newBubble];
        }
        return prev;
      });
    }, Math.max(1500 - (level * 80), 500)); // 关卡越高，生成越快，最少500ms

    return () => clearInterval(interval);
  }, [gameActive, level, generateBubble]);

  // 气泡移动动画
  useEffect(() => {
    if (!gameActive || powerUps.includes('freeze')) return;

    const interval = setInterval(() => {
      setBubbles(prev => prev.map(bubble => {
        const newX = bubble.x + (bubble.speed || 0.5) * (Math.random() > 0.5 ? 1 : -1);
        const newY = bubble.y + (bubble.speed || 0.5) * (Math.random() > 0.5 ? 1 : -1);
        return {
          ...bubble,
          x: Math.max(0, Math.min(85, newX)),
          y: Math.max(0, Math.min(80, newY))
        };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameActive, powerUps]);

  // 保存最高分
  useEffect(() => {
    reportScore(score);
  }, [score, reportScore]);

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🫧 泡泡消消乐</CardTitle>
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="font-semibold">得分: {score}</div>
              <div className="text-gray-600">关卡: {level}</div>
              <div className="text-xs text-purple-600">最高: {highScore}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">时间: {timeLeft}s</div>
              {combo > 1 && (
                <div className="text-purple-600 font-bold animate-pulse">连击 x{combo}!</div>
              )}
              {powerUps.length > 0 && (
                <div className="flex gap-1 justify-center mt-1">
                  {powerUps.includes('freeze') && <span className="text-xs bg-blue-500 text-white px-1 rounded">❄️冻结</span>}
                  {powerUps.includes('double') && <span className="text-xs bg-yellow-500 text-white px-1 rounded">⭐双倍</span>}
                </div>
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
                    ${bubble.color.bg} ${bubble.popped ? 'animate-ping opacity-0' : 'opacity-90 hover:opacity-100'}
                    ${bubble.isSpecial ? 'animate-pulse ring-2 ring-yellow-400' : ''}
                    ${powerUps.includes('freeze') ? 'animate-none' : ''}
                    flex items-center justify-center text-white font-bold shadow-xl
                    ${bubble.color.glow}
                  `}
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    fontSize: `${bubble.size / 3}px`,
                    boxShadow: bubble.isSpecial ? '0 0 20px rgba(255, 215, 0, 0.6)' : undefined
                  }}
                  onClick={() => popBubble(bubble.id)}
                >
                  {bubble.isSpecial ? '⭐' : '✨'}
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

          <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
            <p>快速点击气泡获得连击奖励，不同颜色有不同分数</p>
            <p>⭐ 特殊气泡有神奇效果: 冻结、双倍得分、奖励时间</p>
            <p>连击5次可获得时间奖励!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BubblePopGame;