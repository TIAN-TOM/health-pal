
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Calendar, Zap, Crown, Heart, Target, Trophy, Flame, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: string;
    condition_value?: number;
  };
}

interface BadgeSystemProps {
  onBack?: () => void;
}

const BadgeSystem = ({ onBack }: BadgeSystemProps) => {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  // 预定义的徽章数据
  const predefinedBadges = [
    {
      id: 'checkin-7',
      name: '连续打卡7天',
      description: '连续7天打卡',
      icon: 'Calendar',
      type: 'checkin',
      condition_value: 7,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'checkin-30',
      name: '连续打卡30天',
      description: '连续30天打卡',
      icon: 'Flame',
      type: 'checkin',
      condition_value: 30,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'checkin-100',
      name: '连续打卡100天',
      description: '连续100天打卡',
      icon: 'Crown',
      type: 'checkin',
      condition_value: 100,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'points-1000',
      name: '积分达人',
      description: '累计获得1000积分',
      icon: 'Star',
      type: 'points',
      condition_value: 1000,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'points-5000',
      name: '积分大师',
      description: '累计获得5000积分',
      icon: 'Trophy',
      type: 'points',
      condition_value: 5000,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'first-checkin',
      name: '初次打卡',
      description: '完成第一次打卡',
      icon: 'CheckCircle',
      type: 'milestone',
      condition_value: 1,
      color: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'health-guardian',
      name: '健康守护者',
      description: '记录30条健康数据',
      icon: 'Heart',
      type: 'health',
      condition_value: 30,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'record-master',
      name: '记录大师',
      description: '记录100条健康数据',
      icon: 'Target',
      type: 'health',
      condition_value: 100,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Calendar,
      Flame,
      Crown,
      Star,
      Trophy,
      CheckCircle,
      Heart,
      Target,
      Award,
      Zap
    };
    return iconMap[iconName] || Award;
  };

  useEffect(() => {
    if (user) {
      checkAndAwardBadges();
    }
  }, [user]);

  const checkAndAwardBadges = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 获取用户的打卡数据
      const { data: checkinData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false });

      // 获取用户积分数据
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('total_points, checkin_streak')
        .eq('user_id', user.id)
        .single();

      // 获取用户健康记录数据
      const { data: healthRecords } = await supabase
        .from('meniere_records')
        .select('id')
        .eq('user_id', user.id);

      // 检查各种徽章条件
      const earnedBadges: string[] = [];

      // 检查打卡徽章
      if (checkinData && checkinData.length > 0) {
        earnedBadges.push('first-checkin');
        
        if (pointsData?.checkin_streak >= 7) earnedBadges.push('checkin-7');
        if (pointsData?.checkin_streak >= 30) earnedBadges.push('checkin-30');
        if (pointsData?.checkin_streak >= 100) earnedBadges.push('checkin-100');
      }

      // 检查积分徽章
      if (pointsData?.total_points >= 1000) earnedBadges.push('points-1000');
      if (pointsData?.total_points >= 5000) earnedBadges.push('points-5000');

      // 检查健康记录徽章
      const recordCount = healthRecords?.length || 0;
      if (recordCount >= 30) earnedBadges.push('health-guardian');
      if (recordCount >= 100) earnedBadges.push('record-master');

      // 模拟用户获得的徽章（实际应用中这里会查询数据库）
      const mockUserBadges = earnedBadges.map(badgeId => {
        const badge = predefinedBadges.find(b => b.id === badgeId);
        return {
          id: `user-badge-${badgeId}`,
          badge_id: badgeId,
          earned_at: new Date().toISOString(),
          badge: badge!
        };
      });

      setUserBadges(mockUserBadges);
    } catch (error) {
      console.error('检查徽章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Award className="mr-2 h-6 w-6 text-yellow-600" />
            我的徽章
          </h1>
          <p className="text-gray-600">您获得的成就徽章</p>
        </div>

        {userBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {userBadges.map((userBadge) => {
              const IconComponent = getIconComponent(userBadge.badge.icon);
              return (
                <Card key={userBadge.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{userBadge.badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{userBadge.badge.description}</p>
                    <Badge className={predefinedBadges.find(b => b.id === userBadge.badge_id)?.color || 'bg-gray-100 text-gray-800'}>
                      已获得
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">
                      获得时间: {new Date(userBadge.earned_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无徽章</h3>
              <p className="text-gray-500">继续使用应用，解锁更多成就徽章！</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-blue-600" />
              所有徽章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predefinedBadges.map((badge) => {
                const IconComponent = getIconComponent(badge.icon);
                const isEarned = userBadges.some(ub => ub.badge_id === badge.id);
                
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isEarned 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        isEarned 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                          : 'bg-gray-300'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${isEarned ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <h4 className={`font-medium mb-1 ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>
                        {badge.name}
                      </h4>
                      <p className={`text-sm ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                        {badge.description}
                      </p>
                      {!isEarned && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          未获得
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BadgeSystem;
