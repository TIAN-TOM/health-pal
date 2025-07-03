
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Trophy, Gift, Camera, Smile } from 'lucide-react';
import { CheckinStatus } from './CheckinStatus';
import { CheckinCalendar } from './CheckinCalendar';
import { useAuth } from '@/hooks/useAuth';
import { updatePointsForCheckin, getUserPoints } from '@/services/pointsService';
import { getBeijingDateString } from '@/utils/beijingTime';
import { useToast } from '@/hooks/use-toast';
import MakeupCheckin from './MakeupCheckin';
import BadgeSystem from './BadgeSystem';

const DailyCheckin = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [userPoints, setUserPoints] = useState<any>(null);
  const [streakBonus, setStreakBonus] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkTodayStatus();
    }
  }, [user]);

  const checkTodayStatus = async () => {
    const points = await getUserPoints();
    setUserPoints(points);

    if (points?.last_checkin_date === getBeijingDateString()) {
      setHasCheckedIn(true);
    }

    // 计算连击奖励
    if (points?.checkin_streak) {
      let bonus = 0;
      if (points.checkin_streak >= 7) bonus += 20;
      if (points.checkin_streak >= 30) bonus += 50;
      if (points.checkin_streak >= 100) bonus += 100;
      setStreakBonus(bonus);
    }
  };

  const handleCheckin = async () => {
    if (!user || hasCheckedIn) return;

    setIsChecking(true);
    try {
      const result = await updatePointsForCheckin();
      
      if (result) {
        setHasCheckedIn(true);
        toast({
          title: "打卡成功！",
          description: `获得 ${result.points} 积分，连续打卡 ${result.streak} 天`,
        });
        
        // 刷新用户积分信息
        await checkTodayStatus();
      } else {
        toast({
          title: "打卡失败",
          description: "请稍后重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('打卡失败:', error);
      toast({
        title: "打卡失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
    setIsChecking(false);
  };

  const getStreakReward = (streak: number) => {
    let basePoints = 10;
    let bonusPoints = 0;
    
    if (streak >= 7) bonusPoints += 20;
    if (streak >= 30) bonusPoints += 50;
    if (streak >= 100) bonusPoints += 100;
    
    const streakBonus = Math.min(streak - 1, 10);
    return basePoints + bonusPoints + streakBonus;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Calendar className="mr-2 h-6 w-6 text-blue-600" />
            每日打卡
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 打卡状态 */}
          <div className="text-center space-y-4">
            {hasCheckedIn ? (
              <div className="space-y-2">
                <div className="text-4xl">✅</div>
                <h3 className="text-lg font-semibold text-green-700">今日已打卡</h3>
                <p className="text-sm text-gray-600">感谢您的坚持！</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleCheckin}
                  disabled={isChecking || !user}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  {isChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      打卡中...
                    </>
                  ) : (
                    <>
                      <Smile className="mr-2 h-5 w-5" />
                      立即打卡
                    </>
                  )}
                </Button>
                
                {userPoints && (
                  <div className="text-sm text-gray-600">
                    <p>打卡可获得: {getStreakReward((userPoints.checkin_streak || 0) + 1)} 积分</p>
                    {userPoints.checkin_streak > 0 && (
                      <p>当前连击: {userPoints.checkin_streak} 天</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 积分信息 */}
          {userPoints && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-semibold text-gray-800">
                  {userPoints.total_points || 0}
                </div>
                <div className="text-xs text-gray-500">总积分</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <Trophy className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <div className="text-lg font-semibold text-gray-800">
                  {userPoints.checkin_streak || 0}
                </div>
                <div className="text-xs text-gray-500">连续天数</div>
              </div>
            </div>
          )}

          {/* 连击奖励说明 */}
          {userPoints?.checkin_streak > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <Gift className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">连击奖励</span>
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• 连续7天: +20积分奖励</p>
                <p>• 连续30天: +50积分奖励</p>
                <p>• 连续100天: +100积分奖励</p>
                <p>• 每日连击奖励: +{Math.min(userPoints.checkin_streak, 10)}积分</p>
              </div>
            </div>
          )}

          {/* 功能按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <MakeupCheckin />
            <BadgeSystem />
          </div>
        </CardContent>
      </Card>

      {/* 打卡状态和日历 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CheckinStatus />
        <CheckinCalendar />
      </div>
    </div>
  );
};

export default DailyCheckin;
