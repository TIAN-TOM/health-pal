
import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MemoryCardGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface GameCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryCardGame = ({ onBack, soundEnabled }: MemoryCardGameProps) => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const cardEmojis = {
    easy: ['🌟', '🎯', '🎪', '🎭', '🎨', '🎵'],
    medium: ['🌟', '🎯', '🎪', '🎭', '🎨', '🎵', '🌸', '🦋', '🌈', '⭐'],
    hard: ['🌟', '🎯', '🎪', '🎭', '🎨', '🎵', '🌸', '🦋', '🌈', '⭐', '🎀', '🎈', '🌺', '🍀', '🔥', '💎']
  };

  const gridSizes = {
    easy: { pairs: 6, cols: 4 },
    medium: { pairs: 10, cols: 5 },
    hard: { pairs: 16, cols: 8 }
  };

  // 播放音效
  const playSound = (type: 'flip' | 'match' | 'complete') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    let frequency = 440;
    
    switch (type) {
      case 'flip':
        frequency = 523;
        break;
      case 'match':
        frequency = 659;
        break;
      case 'complete':
        frequency = 880;
        break;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // 初始化游戏
  const initializeGame = () => {
    const { pairs } = gridSizes[difficulty];
    const selectedEmojis = cardEmojis[difficulty].slice(0, pairs);
    const gameCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsGameComplete(false);
    setGameTime(0);
    setIsGameActive(true);
  };

  // 游戏计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && !isGameComplete) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isGameComplete]);

  // 检查游戏完成
  useEffect(() => {
    const { pairs } = gridSizes[difficulty];
    if (matches === pairs && isGameActive) {
      setIsGameComplete(true);
      setIsGameActive(false);
      playSound('complete');
    }
  }, [matches, difficulty, isGameActive]);

  // 处理卡片点击
  const handleCardClick = (cardId: number) => {
    if (!isGameActive || isGameComplete) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    playSound('flip');
    
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // 匹配成功
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          playSound('match');
        }, 500);
      } else {
        // 不匹配，翻回去
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取难度文本
  const getDifficultyText = (level: string) => {
    const map = { easy: '简单', medium: '中等', hard: '困难' };
    return map[level as keyof typeof map] || level;
  };

  // 获取评分
  const getScoreRating = () => {
    const { pairs } = gridSizes[difficulty];
    const perfectMoves = pairs;
    const efficiency = perfectMoves / moves;
    
    if (efficiency >= 0.9) return { text: '完美！', color: 'text-yellow-600', emoji: '🏆' };
    if (efficiency >= 0.7) return { text: '优秀！', color: 'text-green-600', emoji: '⭐' };
    if (efficiency >= 0.5) return { text: '不错！', color: 'text-blue-600', emoji: '👍' };
    return { text: '继续努力！', color: 'text-purple-600', emoji: '💪' };
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const { cols } = gridSizes[difficulty];

  return (
    <div className="space-y-4">
      {/* 游戏状态栏 */}
      <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-mono">{formatTime(gameTime)}</span>
          </div>
          <div>步数: {moves}</div>
          <div>配对: {matches}/{gridSizes[difficulty].pairs}</div>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="px-2 py-1 border rounded text-sm"
            disabled={isGameActive && moves > 0}
          >
            <option value="easy">简单 (3×4)</option>
            <option value="medium">中等 (4×5)</option>
            <option value="hard">困难 (4×8)</option>
          </select>
          <Button
            onClick={initializeGame}
            size="sm"
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            重新开始
          </Button>
        </div>
      </div>

      {/* 游戏完成提示 */}
      {isGameComplete && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">
              <Trophy className="h-6 w-6 inline mr-2 text-yellow-600" />
              恭喜完成！
              {getScoreRating().emoji}
            </div>
            <div className="space-y-1 text-sm">
              <div>难度: {getDifficultyText(difficulty)}</div>
              <div>用时: {formatTime(gameTime)}</div>
              <div>总步数: {moves}</div>
              <div className={`font-semibold ${getScoreRating().color}`}>
                {getScoreRating().text}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 游戏网格 */}
      <div 
        className={`grid gap-2 justify-center`}
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: cols <= 5 ? '400px' : '600px',
          margin: '0 auto'
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`
              aspect-square cursor-pointer transition-all duration-500 transform hover:scale-105
              ${card.isFlipped || card.isMatched 
                ? 'bg-white border-blue-300 shadow-md' 
                : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
              }
              ${card.isMatched ? 'ring-2 ring-green-400 bg-green-50' : ''}
            `}
            onClick={() => handleCardClick(card.id)}
          >
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className={`
                text-2xl sm:text-3xl transition-all duration-500 
                ${card.isFlipped || card.isMatched 
                  ? 'opacity-100 transform rotate-0' 
                  : 'opacity-0 transform rotate-180'
                }
              `}>
                {(card.isFlipped || card.isMatched) ? card.value : '?'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 游戏说明 */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h3 className="font-medium mb-2">🧠 游戏说明：</h3>
        <ul className="space-y-1">
          <li>• 点击卡片翻开，找到相同的一对</li>
          <li>• 记住卡片位置，用最少步数完成游戏</li>
          <li>• 选择不同难度挑战你的记忆力</li>
          <li>• 训练大脑，提升专注力和记忆力</li>
        </ul>
      </div>
    </div>
  );
};

export default MemoryCardGame;
