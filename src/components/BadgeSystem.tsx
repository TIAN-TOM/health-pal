
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Star, Medal, Crown, Target, Zap, Heart, Flame } from 'lucide-react';
import { getUserPurchases, type UserPurchase } from '@/services/pointsStoreService';
import { getUserPoints } from '@/services/pointsService';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'achievement' | 'purchase' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition?: string;
  unlocked: boolean;
}

const BadgeSystem = () => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [userPoints, setUserPoints] = useState<any>(null);

  useEffect(() => {
    loadBadgeData();
  }, []);

  const loadBadgeData = async () => {
    const [purchases, points] = await Promise.all([
      getUserPurchases(),
      getUserPoints()
    ]);

    setUserPurchases(purchases);
    setUserPoints(points);

    // 生成徽章数据
    const badgeList: BadgeData[] = [
      // 成就徽章
      {
        id: 'newcomer',
        name: '新手上路',
        description: '完成首次打卡',
        icon: <Star className="h-6 w-6" />,
        type: 'achievement',
        rarity: 'common',
        condition: '完成首次打卡',
        unlocked: points?.checkin_streak >= 1
      },
      {
        id: 'persistent',
        name: '坚持不懈',
        description: '连续打卡7天',
        icon: <Flame className="h-6 w-6" />,
        type: 'achievement',
        rarity: 'rare',
        condition: '连续打卡7天',
        unlocked: points?.checkin_streak >= 7
      },
      {
        id: 'dedication',
        name: '持之以恒',
        description: '连续打卡30天',
        icon: <Medal className="h-6 w-6" />,
        type: 'achievement',
        rarity: 'epic',
        condition: '连续打卡30天',
        unlocked: points?.checkin_streak >= 30
      },
      {
        id: 'legendary_streak',
        name: '传奇坚持',
        description: '连续打卡100天',
        icon: <Crown className="h-6 w-6" />,
        type: 'achievement',
        rarity: 'legendary',
        condition: '连续打卡100天',
        unlocked: points?.checkin_streak >= 100
      },
      {
        id: 'point_collector',
        name: '积分收集者',
        description: '累计获得1000积分',
        icon: <Target className="h-6 w-6" />,
        type: 'achievement',
        rarity: 'rare',
        condition: '累计获得1000积分',
        unlocked: points?.total_points >= 1000
      },
      {
        id: 'point_master',
        name: '积分大师',
        description: '累计获得5000积分',
        icon: <Zap className="h-6 w-6" />,
        type: 'achievement',
        rarity: 'epic',
        condition: '累计获得5000积分',
        unlocked: points?.total_points >= 5000
      },
      // 购买徽章
      ...purchases
        .filter(p => p.points_store_items?.item_type === 'virtual_badge')
        .map(p => ({
          id: p.item_id,
          name: p.points_store_items?.item_name || '专属徽章',
          description: p.points_store_items?.item_description || '通过积分商城获得的专属徽章',
          icon: <Trophy className="h-6 w-6" />,
          type: 'purchase' as const,
          rarity: 'epic' as const,
          condition: '积分商城购买',
          unlocked: true
        }))
    ];

    setBadges(badgeList);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-300 bg-gray-50';
      case 'rare': return 'text-blue-600 border-blue-300 bg-blue-50';
      case 'epic': return 'text-purple-600 border-purple-300 bg-purple-50';
      case 'legendary': return 'text-yellow-600 border-yellow-300 bg-yellow-50';
      default: return 'text-gray-600 border-gray-300 bg-gray-50';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return '普通';
      case 'rare': return '稀有';
      case 'epic': return '史诗';
      case 'legendary': return '传奇';
      default: return '普通';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'achievement': return '成就';
      case 'purchase': return '购买';
      case 'special': return '特殊';
      default: return '普通';
    }
  };

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Trophy className="h-4 w-4 mr-2" />
          我的徽章 ({unlockedBadges.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            徽章收集
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 统计信息 */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">徽章收集进度</h3>
                    <p className="text-sm text-gray-600">
                      已解锁 {unlockedBadges.length} / {badges.length} 个徽章
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round((unlockedBadges.length / badges.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">完成度</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 已解锁徽章 */}
          {unlockedBadges.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                已解锁徽章
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {unlockedBadges.map((badge) => (
                  <Card key={badge.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${getRarityColor(badge.rarity)}`}>
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-800">{badge.name}</h4>
                            <Badge className={getRarityColor(badge.rarity)}>
                              {getRarityText(badge.rarity)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getTypeText(badge.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{badge.description}</p>
                          {badge.condition && (
                            <p className="text-xs text-gray-500">解锁条件: {badge.condition}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 未解锁徽章 */}
          {lockedBadges.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Target className="h-4 w-4 mr-2 text-gray-500" />
                未解锁徽章
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {lockedBadges.map((badge) => (
                  <Card key={badge.id} className="opacity-60 hover:opacity-80 transition-opacity">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-gray-100 text-gray-400">
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-600">{badge.name}</h4>
                            <Badge variant="outline" className="text-gray-500">
                              {getRarityText(badge.rarity)}
                            </Badge>
                            <Badge variant="outline" className="text-xs text-gray-500">
                              {getTypeText(badge.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{badge.description}</p>
                          {badge.condition && (
                            <p className="text-xs text-gray-400">解锁条件: {badge.condition}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无徽章数据</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeSystem;
