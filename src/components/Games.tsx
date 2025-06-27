
import React, { useState } from 'react';
import { ArrowLeft, Gamepad2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FlappyBird from '@/components/games/FlappyBird';
import Gomoku from '@/components/games/Gomoku';

interface GamesProps {
  onBack: () => void;
}

const Games = ({ onBack }: GamesProps) => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const games = [
    {
      id: 'flappy-bird',
      name: '飞鸟游戏',
      description: '经典的飞鸟游戏，点击屏幕让小鸟飞跃障碍物',
      icon: '🐦',
      component: FlappyBird
    },
    {
      id: 'gomoku',
      name: '五子棋',
      description: '与电脑对战五子棋，考验你的策略思维',
      icon: '⚫',
      component: Gomoku
    }
  ];

  const handleBackToGames = () => {
    setCurrentGame(null);
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
              <div className="w-24"></div>
            </div>
            <GameComponent onBack={handleBackToGames} />
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
          <div className="w-16"></div>
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
            <Card key={game.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">{game.icon}</span>
                  {game.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <Button
                  onClick={() => setCurrentGame(game.id)}
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
