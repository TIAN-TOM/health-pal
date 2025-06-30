import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Clock, Zap, Eye, Shuffle, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MemoryCardGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface GameCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  isHinted: boolean;
}

interface PowerUp {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  cost: number;
  cooldown: number;
  currentCooldown: number;
}

interface CardTheme {
  id: string;
  name: string;
  description: string;
  cards: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
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
  const [selectedTheme, setSelectedTheme] = useState('animals');
  const [coins, setCoins] = useState(0);
  const [totalCoins, setTotalCoins] = useState(() => {
    return parseInt(localStorage.getItem('memory-game-coins') || '0');
  });
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: 'peek',
      name: '窥视',
      icon: <Eye className="h-4 w-4" />,
      description: '短暂显示所有卡片',
      cost: 3,
      cooldown: 0,
      currentCooldown: 0
    },
    {
      id: 'hint',
      name: '提示',
      icon: <Zap className="h-4 w-4" />,
      description: '高亮一对匹配的卡片',
      cost: 5,
      cooldown: 0,
      currentCooldown: 0
    },
    {
      id: 'shuffle',
      name: '重排',
      icon: <Shuffle className="h-4 w-4" />,
      description: '重新排列未匹配的卡片',
      cost: 2,
      cooldown: 10,
      currentCooldown: 0
    }
  ]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const cardThemes: CardTheme[] = [
    {
      id: 'animals',
      name: '可爱动物',
      description: '萌萌的小动物们',
      cards: {
        easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
        medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐼', '🐨', '🐸', '🐵'],
        hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐼', '🐨', '🐸', '🐵', '🦁', '🐯', '🐷', '🐮', '🐺', '🦝']
      }
    },
    {
      id: 'fruits',
      name: '新鲜水果',
      description: '营养美味的水果',
      cards: {
        easy: ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝'],
        medium: ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍'],
        hard: ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍', '🥑', '🍈', '🍉', '🫐', '🥥', '🍋']
      }
    },
    {
      id: 'nature',
      name: '自然风光',
      description: '美丽的自然景象',
      cards: {
        easy: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼'],
        medium: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🌳', '🌲'],
        hard: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🌳', '🌲', '⭐', '🌙', '☀️', '🌈', '⚡', '❄️']
      }
    },
    {
      id: 'food',
      name: '美味食物',
      description: '令人垂涎的美食',
      cards: {
        easy: ['🍕', '🍔', '🌮', '🍝', '🍜', '🍱'],
        medium: ['🍕', '🍔', '🌮', '🍝', '🍜', '🍱', '🍰', '🍪', '🍩', '🧁'],
        hard: ['🍕', '🍔', '🌮', '🍝', '🍜', '🍱', '🍰', '🍪', '🍩', '🧁', '🍦', '🍧', '🥐', '🥞', '🧀', '🥨']
      }
    },
    {
      id: 'sports',
      name: '运动器材',
      description: '各种运动用品',
      cards: {
        easy: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'],
        medium: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥎', '🏑'],
        hard: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥎', '🏑', '🥍', '🏒', '🏹', '⛳', '🥊', '🥋']
      }
    },
    {
      id: 'music',
      name: '音乐艺术',
      description: '美妙的音乐世界',
      cards: {
        easy: ['🎵', '🎶', '🎼', '🎹', '🎸', '🥁'],
        medium: ['🎵', '🎶', '🎼', '🎹', '🎸', '🥁', '🎺', '🎷', '🎻', '🪕'],
        hard: ['🎵', '🎶', '🎼', '🎹', '🎸', '🥁', '🎺', '🎷', '🎻', '🪕', '🎯', '🎪', '🎭', '🎨', '🖼️', '🎬']
      }
    }
  ];

  const gridSizes = {
    easy: { pairs: 6, cols: 4 },
    medium: { pairs: 10, cols: 5 },
    hard: { pairs: 16, cols: 8 }
  };

  // 播放音效
  const playSound = (type: 'flip' | 'match' | 'complete' | 'combo' | 'powerup') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    let frequency = 440;
    let duration = 0.2;
    
    switch (type) {
      case 'flip':
        frequency = 523;
        duration = 0.1;
        break;
      case 'match':
        frequency = 659;
        duration = 0.2;
        break;
      case 'complete':
        frequency = 880;
        duration = 0.5;
        break;
      case 'combo':
        frequency = 784;
        duration = 0.3;
        break;
      case 'powerup':
        frequency = 1047;
        duration = 0.2;
        break;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // 初始化游戏
  const initializeGame = () => {
    const { pairs } = gridSizes[difficulty];
    const currentTheme = cardThemes.find(theme => theme.id === selectedTheme);
    const selectedEmojis = currentTheme?.cards[difficulty].slice(0, pairs) || [];
    
    const gameCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
        isHinted: false
      }));

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsGameComplete(false);
    setGameTime(0);
    setIsGameActive(true);
    setCoins(0);
    setCombo(0);
    setMaxCombo(0);
    
    // 重置道具冷却
    setPowerUps(prev => prev.map(powerUp => ({
      ...powerUp,
      currentCooldown: 0
    })));
  };

  const usePowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp || powerUp.currentCooldown > 0 || totalCoins < powerUp.cost) return;

    setTotalCoins(prev => {
      const newTotal = prev - powerUp.cost;
      localStorage.setItem('memory-game-coins', newTotal.toString());
      return newTotal;
    });

    setPowerUps(prev => prev.map(p => 
      p.id === powerUpId 
        ? { ...p, currentCooldown: p.cooldown }
        : p
    ));

    playSound('powerup');

    switch (powerUpId) {
      case 'peek':
        setCards(prev => prev.map(card => 
          card.isMatched ? card : { ...card, isFlipped: true }
        ));
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.isMatched || flippedCards.includes(card.id) ? card : { ...card, isFlipped: false }
          ));
        }, 3000);
        break;
        
      case 'hint':
        const unmatchedCards = cards.filter(card => !card.isMatched);
        const values = new Set();
        const pairs: GameCard[] = [];
        
        for (const card of unmatchedCards) {
          if (values.has(card.value)) {
            const pair = unmatchedCards.find(c => c.value === card.value && c.id !== card.id);
            if (pair) {
              pairs.push(card, pair);
              break;
            }
          } else {
            values.add(card.value);
          }
        }
        
        if (pairs.length === 2) {
          setCards(prev => prev.map(card => 
            pairs.some(p => p.id === card.id) 
              ? { ...card, isHinted: true }
              : card
          ));
          setTimeout(() => {
            setCards(prev => prev.map(card => ({ ...card, isHinted: false })));
          }, 2000);
        }
        break;
        
      case 'shuffle':
        const matchedCards = cards.filter(card => card.isMatched);
        const unmatchedValues = cards.filter(card => !card.isMatched).map(card => card.value);
        const shuffledValues = [...unmatchedValues].sort(() => Math.random() - 0.5);
        
        let shuffleIndex = 0;
        setCards(prev => prev.map(card => {
          if (card.isMatched) return card;
          return {
            ...card,
            value: shuffledValues[shuffleIndex++],
            isFlipped: false
          };
        }));
        setFlippedCards([]);
        break;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && !isGameComplete) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        setPowerUps(prev => prev.map(powerUp => ({
          ...powerUp,
          currentCooldown: Math.max(0, powerUp.currentCooldown - 1)
        })));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isGameComplete]);

  useEffect(() => {
    const { pairs } = gridSizes[difficulty];
    if (matches === pairs && isGameActive) {
      setIsGameComplete(true);
      setIsGameActive(false);
      
      const timeBonus = Math.max(0, 300 - gameTime);
      const moveBonus = Math.max(0, pairs * 2 - moves);
      const comboBonus = maxCombo * 2;
      const finalCoins = Math.floor((timeBonus + moveBonus + comboBonus) / 10) + pairs;
      
      setCoins(finalCoins);
      setTotalCoins(prev => {
        const newTotal = prev + finalCoins;
        localStorage.setItem('memory-game-coins', newTotal.toString());
        return newTotal;
      });
      
      playSound('complete');
    }
  }, [matches, difficulty, isGameActive, gameTime, moves, maxCombo]);

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
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          setCombo(prev => {
            const newCombo = prev + 1;
            setMaxCombo(current => Math.max(current, newCombo));
            if (newCombo > 1) {
              playSound('combo');
            }
            return newCombo;
          });
          
          playSound('match');
        }, 500);
      } else {
        setCombo(0);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyText = (level: string) => {
    const map = { easy: '简单', medium: '中等', hard: '困难' };
    return map[level as keyof typeof map] || level;
  };

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
  }, [difficulty, selectedTheme]);

  const { cols } = gridSizes[difficulty];
  const currentTheme = cardThemes.find(theme => theme.id === selectedTheme);

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
          {combo > 1 && (
            <div className="text-orange-600 font-bold">
              连击 x{combo}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-yellow-600 font-bold">💰 {totalCoins}</div>
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

      {/* 游戏设置栏 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">主题:</span>
            <Select value={selectedTheme} onValueChange={setSelectedTheme} disabled={isGameActive && moves > 0}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cardThemes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">难度:</span>
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
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          {currentTheme?.description}
        </div>
      </div>

      {/* 道具栏 */}
      <div className="flex justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
        {powerUps.map(powerUp => (
          <Button
            key={powerUp.id}
            onClick={() => usePowerUp(powerUp.id)}
            disabled={powerUp.currentCooldown > 0 || totalCoins < powerUp.cost}
            variant="outline"
            size="sm"
            className={`flex flex-col items-center p-2 h-auto ${
              powerUp.currentCooldown > 0 ? 'opacity-50' : ''
            }`}
            title={`${powerUp.description} (花费: ${powerUp.cost}💰)`}
          >
            {powerUp.icon}
            <span className="text-xs">{powerUp.name}</span>
            <span className="text-xs text-yellow-600">💰{powerUp.cost}</span>
            {powerUp.currentCooldown > 0 && (
              <span className="text-xs text-red-500">{powerUp.currentCooldown}s</span>
            )}
          </Button>
        ))}
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
              <div>主题: {currentTheme?.name}</div>
              <div>难度: {getDifficultyText(difficulty)}</div>
              <div>用时: {formatTime(gameTime)}</div>
              <div>总步数: {moves}</div>
              <div>最大连击: {maxCombo}</div>
              <div className="text-yellow-600 font-bold">
                获得金币: +{coins}💰
              </div>
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
          maxWidth: cols <= 5 ? '320px' : '480px',
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
              ${card.isHinted ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''}
            `}
            onClick={() => handleCardClick(card.id)}
          >
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className={`
                text-lg sm:text-xl transition-all duration-500 
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
          <li>• 选择喜欢的图案主题和难度等级</li>
          <li>• 点击卡片翻开，找到相同的一对获得连击奖励</li>
          <li>• 使用金币购买道具帮助游戏进行</li>
          <li>• 完成游戏获得金币奖励，效率越高奖励越多</li>
        </ul>
      </div>
    </div>
  );
};

export default MemoryCardGame;
