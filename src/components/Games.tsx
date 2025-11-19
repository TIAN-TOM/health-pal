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
import { PopStarGame } from '@/components/games/PopStarGame';
import { LinkLinkGame } from '@/components/games/LinkLinkGame';
import { CoinCatchGame } from '@/components/games/CoinCatchGame';
import { FruitNinjaGame } from '@/components/games/FruitNinjaGame';
import { BejeweledGame } from '@/components/games/BejeweledGame';
import { PianoTilesGame } from '@/components/games/PianoTilesGame';

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
    },
    {
      id: 'popstar',
      name: 'PopStar消消看',
      description: '点击相同颜色的连续方块消除，连击越多分数越高',
      icon: '✨',
      component: PopStarGame
    },
    {
      id: 'linklink',
      name: '连连看',
      description: '连接相同图标消除，路径最多转两个弯',
      icon: '🔗',
      component: LinkLinkGame
    },
    {
      id: 'coincatch',
      name: '接金币',
      description: '移动接住掉落的金币，避开炸弹，挑战高分',
      icon: '💰',
      component: CoinCatchGame
    },
    {
      id: 'fruitninja',
      name: '水果忍者',
      description: '划过水果切开它们，避开炸弹，不要让水果掉落',
      icon: '🍉',
      component: FruitNinjaGame
    },
    {
      id: 'bejeweled',
      name: '宝石消除',
      description: '交换相邻宝石形成三连消除，连锁得分翻倍',
      icon: '💎',
      component: BejeweledGame
    },
    {
      id: 'pianotiles',
      name: '钢琴块',
      description: '点击黑色方块，速度越来越快，挑战你的反应力',
      icon: '🎹',
      component: PianoTilesGame
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
            <Card key={game.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">{game.icon}</span>
                  {game.name}
                  <div className="ml-auto relative group">
                    <button className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-help hover:bg-blue-600 transition-colors">
                      ?
                    </button>
                    <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-active:opacity-100 group-active:visible transition-all duration-200 z-10">
                      <h4 className="font-semibold mb-3 text-gray-800">🎮 {game.name} - 游戏攻略</h4>
                      <div className="space-y-3">
                        {game.id === 'memory-cards' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">🧠 记忆力挑战游戏</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 翻开两张卡片，寻找相同图案配对</p>
                              <p>• 记住卡片位置，减少翻牌次数</p>
                              <p>• 全部配对完成即获胜</p>
                              <p className="text-blue-600 font-medium">💡 提升记忆力和专注力的好帮手</p>
                            </div>
                          </div>
                        )}
                        {game.id === 'flappy-bird' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">🐦 增强版飞鸟冒险</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 点击屏幕控制小鸟上升，松开下降</p>
                              <p>• 穿越绿色管道，避免碰撞</p>
                              <p>• 收集特殊道具：护盾、双倍得分等</p>
                              <p>• 击败怪物获得额外奖励</p>
                              <p className="text-blue-600 font-medium">🎯 挑战反应速度和手眼协调</p>
                            </div>
                          </div>
                        )}
                        {game.id === 'gomoku' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">⚫ 智能五子棋对战</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 轮流下棋，率先连成五子获胜</p>
                              <p>• 支持简单、中等、困难三种难度</p>
                              <p>• 可撤销上一步操作</p>
                              <p>• AI智能分析，提供策略挑战</p>
                              <p className="text-blue-600 font-medium">🧠 锻炼逻辑思维和策略规划</p>
                            </div>
                          </div>
                        )}
                        {game.id === 'multiplayer-gomoku' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">👥 在线五子棋对战</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 创建或加入游戏房间</p>
                              <p>• 实时与其他玩家对战</p>
                              <p>• 观战模式，学习高手对局</p>
                              <p>• 聊天功能，交流心得</p>
                              <p className="text-blue-600 font-medium">🌐 体验真实的线上竞技乐趣</p>
                            </div>
                          </div>
                        )}
                        {game.id === 'breakout' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">🧱 经典打砖块重制</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 移动挡板反弹球击碎砖块</p>
                              <p>• 不同颜色砖块有不同分值</p>
                              <p>• 多关卡设计，难度递增</p>
                              <p>• 特殊道具：多球、加长挡板等</p>
                              <p className="text-blue-600 font-medium">🎯 考验反应速度和预判能力</p>
                            </div>
                          </div>
                        )}
                        {game.id === 'snake' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">🐍 超级贪吃蛇冒险</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 方向键控制蛇的移动方向</p>
                              <p>• 普通食物：红色苹果+10分</p>
                              <p>• 特殊食物：金色+50分，速度调节等</p>
                              <p>• 神奇道具：无敌模式、慢动作、双倍得分</p>
                              <p>• 动态障碍物增加挑战性</p>
                              <p className="text-blue-600 font-medium">🏆 挑战高分记录，成为蛇王！</p>
                            </div>
                          </div>
                        )}
                        {game.id === '2048' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">🎯 数字合并挑战</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 滑动屏幕移动数字方块</p>
                              <p>• 相同数字碰撞后合并翻倍</p>
                              <p>• 目标：合成2048数字获胜</p>
                              <p>• 可继续挑战更高数字</p>
                              <p className="text-blue-600 font-medium">🔢 提升数学思维和空间规划</p>
                            </div>
                          </div>
                        )}
                        {game.id === 'bubble-pop' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">🫧 缤纷泡泡消除乐园</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 快速点击彩色气泡进行消除</p>
                              <p>• 连击消除获得加分奖励</p>
                              <p>• 特殊气泡：冻结时间、双倍得分</p>
                              <p>• 气泡会缓慢移动增加难度</p>
                              <p>• 分层颜色系统，策略性消除</p>
                              <p className="text-blue-600 font-medium">⚡ 锻炼手速和快速决策能力</p>
                            </div>
                          </div>
                        )}
                        {game.id === 'tetris' && (
                          <div>
                            <p className="mb-2 font-medium text-gray-700">🧩 经典俄罗斯方块</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>• 旋转和移动下落的方块</p>
                              <p>• 填满完整行即可消除得分</p>
                              <p>• 速度会随等级提升而加快</p>
                              <p>• 预览下一个方块，提前规划</p>
                              <p className="text-blue-600 font-medium">🏗️ 训练空间想象和快速反应</p>
                            </div>
                          </div>
                        )}
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
