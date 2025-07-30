import React, { useState } from 'react';
import { ArrowLeft, Gamepad2, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { notifyAdminActivity, ACTIVITY_TYPES, MODULE_NAMES } from '@/services/adminNotificationService';
import EnhancedFlappyBird from '@/components/games/EnhancedFlappyBird';
import EnhancedGomoku from '@/components/games/EnhancedGomoku';
import BreakoutGame from '@/components/games/BreakoutGame';
import MemoryCardGame from '@/components/games/MemoryCardGame';
import SnakeGame from '@/components/games/SnakeGame';
import Game2048 from '@/components/games/Game2048';
import BubblePopGame from '@/components/games/BubblePopGame';
import MultiplayerGomoku from '@/components/games/MultiplayerGomoku';
import TetrisGame from '@/components/games/TetrisGame';

interface GamesProps {
  onBack: () => void;
}

const Games = ({ onBack }: GamesProps) => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('games-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const games = [
    {
      id: 'memory-cards',
      name: '记忆翻牌',
      description: '挑战你的记忆力，找到相同的卡片配对',
      icon: '🧠',
      component: MemoryCardGame
    },
    {
      id: 'flappy-bird',
      name: '小鸟会飞',
      description: '经典的飞鸟游戏，收集道具，体验特殊效果',
      icon: '🐦',
      component: EnhancedFlappyBird
    },
    {
      id: 'gomoku',
      name: '五子棋',
      description: '与智能电脑对战五子棋，可调节难度等级',
      icon: '⚫',
      component: EnhancedGomoku
    },
    {
      id: 'multiplayer-gomoku',
      name: '多人五子棋',
      description: '在线实时对战，邀请好友一起下棋',
      icon: '👥',
      component: MultiplayerGomoku
    },
    {
      id: 'breakout',
      name: '打砖块',
      description: '控制挡板弹球击碎彩色砖块，关卡不断升级',
      icon: '🧱',
      component: BreakoutGame
    },
    {
      id: 'snake',
      name: '贪吃蛇',
      description: '经典贪吃蛇游戏，吃食物长大，避免撞墙',
      icon: '🐍',
      component: SnakeGame
    },
    {
      id: '2048',
      name: '2048',
      description: '滑动数字方块，合并相同数字，挑战2048',
      icon: '🎯',
      component: Game2048
    },
    {
      id: 'bubble-pop',
      name: '泡泡消消乐',
      description: '快速点击彩色气泡，连击获得更高分数',
      icon: '🫧',
      component: BubblePopGame
    },
    {
      id: 'tetris',
      name: '俄罗斯方块',
      description: '经典俄罗斯方块游戏，消除完整行获得高分',
      icon: '🧩',
      component: TetrisGame
    }
  ];

  const handleBackToGames = () => {
    setCurrentGame(null);
  };

  const handleStartGame = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      // 通知管理员用户开始游戏
      await notifyAdminActivity({
        activity_type: ACTIVITY_TYPES.GAME,
        activity_description: `开始玩游戏 "${game.name}"`,
        module_name: MODULE_NAMES.GAMES
      });
      setCurrentGame(gameId);
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('games-sound-enabled', JSON.stringify(enabled));
  };

  if (currentGame) {
    const game = games.find(g => g.id === currentGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={handleBackToGames}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回游戏列表
              </Button>
              <h1 className="text-xl font-bold">{game.name}</h1>
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
            </div>
            <GameComponent onBack={handleBackToGames} soundEnabled={soundEnabled} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">解压小游戏</h1>
          <div className="flex items-center gap-2">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <Switch
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Gamepad2 className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">放松心情，享受游戏</h2>
          </div>
          <p className="text-gray-600 text-sm">适度游戏有助于缓解压力，保持心理健康</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow duration-200 relative group">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">{game.icon}</span>
                  {game.name}
                  <div className="ml-auto relative">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-help hover:bg-blue-600 transition-colors">
                      ?
                    </div>
                    <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <h4 className="font-semibold mb-2">游戏说明:</h4>
                      <p className="mb-2">{game.description}</p>
                      <div className="text-xs text-gray-500">
                        {game.id === 'memory-cards' && '翻开相同图案的卡片，训练记忆力'}
                        {game.id === 'flappy-bird' && '点击屏幕控制小鸟飞行，避开障碍物'}
                        {game.id === 'gomoku' && '五子连线获胜，支持不同难度'}
                        {game.id === 'multiplayer-gomoku' && '与其他玩家在线对战'}
                        {game.id === 'breakout' && '移动挡板控制球击破砖块'}
                        {game.id === 'snake' && '方向键控制，吃食物成长，有道具和特殊食物'}
                        {game.id === '2048' && '滑动合并数字，目标达到2048'}
                        {game.id === 'bubble-pop' && '点击彩色气泡，连击获得高分，特殊气泡有惊喜'}
                        {game.id === 'tetris' && '旋转和移动方块，消除完整行'}
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <Button
                  onClick={() => handleStartGame(game.id)}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  开始游戏
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start">
            <Gamepad2 className="h-5 w-5 text-yellow-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">温馨提示</h3>
              <p className="text-yellow-700 text-sm">
                游戏是为了放松心情和缓解压力，请合理安排游戏时间。记录健康数据和保持良好的生活习惯同样重要。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
