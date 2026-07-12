import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Heart, MessageCircle, Check, Award, Activity } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { createCheckin, cancelCheckin } from '@/services/dailyCheckinService';
import { updatePointsForCheckin, getUserPoints, type UserPoints } from '@/services/pointsService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PointsStore from '@/components/PointsStore';
import type { Tables } from '@/integrations/supabase/types';

type DailyCheckin = Tables<'daily_checkins'>;

interface CheckinSectionProps {
  todayCheckin: DailyCheckin | null;
  onCheckinSuccess: (checkin: DailyCheckin | null) => void;
  onReloadHistory: () => void;
  onNavigateToRecords?: () => void;
}

const CheckinSection = ({ todayCheckin, onCheckinSuccess, onReloadHistory, onNavigateToRecords }: CheckinSectionProps) => {
  const [moodScore, setMoodScore] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<{ points: number; streak: number } | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const { toast } = useToast();
  const { userRole } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUserPoints();
  }, []);

  const loadUserPoints = async () => {
    const points = await getUserPoints();
    setUserPoints(points);
  };

  const handleCheckin = async () => {
    try {
      setLoading(true);
      
      // 创建打卡记录
      const newCheckin = await createCheckin(moodScore, note || undefined);
      
      // 更新积分
      const pointsResult = await updatePointsForCheckin();
      if (pointsResult) {
        setEarnedPoints(pointsResult);
        await loadUserPoints(); // 重新加载积分信息
      }
      
      onCheckinSuccess(newCheckin);
      setNote('');
      onReloadHistory();
      // 失效打卡历史查询，让日历和连续打卡天数自动刷新
      queryClient.invalidateQueries({ queryKey: ['checkin-history'] });
      
      toast({
        title: "打卡成功！",
        description: pointsResult 
          ? `获得 ${pointsResult.points} 积分，连续打卡 ${pointsResult.streak} 天！` 
          : "今日打卡已完成，继续保持好习惯！",
      });

      // 打卡成功后显示记录询问弹窗，等待用户自行选择，不自动跳转
      setShowRecordDialog(true);
    } catch (error: any) {
      toast({
        title: "打卡失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 5) return '😄';
    if (score >= 4) return '😊';
    if (score >= 3) return '😐';
    if (score >= 2) return '😔';
    return '😞';
  };

  const getMoodText = (score: number) => {
    if (score >= 5) return '很好';
    if (score >= 4) return '不错';
    if (score >= 3) return '一般';
    if (score >= 2) return '不太好';
    return '很糟糕';
  };

  const getStreakReward = (streak: number) => {
    if (streak >= 100) return { emoji: '🏆', text: '百日坚持！', color: 'text-yellow-600' };
    if (streak >= 30) return { emoji: '💎', text: '月度达人！', color: 'text-purple-600' };
    if (streak >= 7) return { emoji: '🔥', text: '一周连击！', color: 'text-orange-600' };
    if (streak >= 3) return { emoji: '⭐', text: '连续打卡', color: 'text-blue-600' };
    return null;
  };

  const handleCancelCheckin = async () => {
    try {
      setCancelLoading(true);
      
      if (!todayCheckin) return;
      
      // 使用服务函数删除打卡记录
      await cancelCheckin(todayCheckin.id);
      
      // 正确重置前端状态，传递null表示今日未打卡
      onCheckinSuccess(null);
      setEarnedPoints(null);
      onReloadHistory();
      // 失效打卡历史查询，让日历和连续打卡天数自动刷新
      queryClient.invalidateQueries({ queryKey: ['checkin-history'] });
      
      console.log('前端状态已重置，应该可以重新打卡');
      
      toast({
        title: "取消打卡成功",
        description: "今日打卡记录已删除，可以重新打卡了",
      });
    } catch (error: any) {
      console.error('取消打卡失败:', error);
      toast({
        title: "取消打卡失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              每日打卡
            </CardTitle>
            {userPoints && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1 text-yellow-600" />
                  <span className="font-bold text-yellow-600">{userPoints.total_points}</span>
                  <span className="text-gray-600 ml-1">积分</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayCheckin ? (
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center mb-3">
                <Check className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-green-800">今日已打卡</span>
                {userRole === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelCheckin}
                    disabled={cancelLoading}
                    className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {cancelLoading ? '取消中...' : '取消打卡'}
                  </Button>
                )}
              </div>
              <div className="text-green-700 space-y-2">
                <p>心情评分: {getMoodEmoji(todayCheckin.mood_score || 3)} {getMoodText(todayCheckin.mood_score || 3)} ({todayCheckin.mood_score}/5)</p>
                {todayCheckin.note && (
                  <p className="text-sm">备注: {todayCheckin.note}</p>
                )}
                {earnedPoints && earnedPoints.points > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="h-5 w-5 text-yellow-600 mr-1" />
                      <span className="font-bold text-yellow-600">获得 {earnedPoints.points} 积分！</span>
                    </div>
                    {getStreakReward(earnedPoints.streak) && (
                      <div className={`flex items-center justify-center ${getStreakReward(earnedPoints.streak)?.color}`}>
                        <span className="text-lg mr-1">{getStreakReward(earnedPoints.streak)?.emoji}</span>
                        <span className="font-medium">{getStreakReward(earnedPoints.streak)?.text}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">今日心情如何？</h3>
                <div className="flex justify-center items-center space-x-4 mb-4">
                  <span className="text-2xl">{getMoodEmoji(moodScore)}</span>
                  <span className="font-medium">{getMoodText(moodScore)}</span>
                </div>
                <div className="flex justify-center gap-2" role="group" aria-label="心情评分">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const selected = moodScore === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setMoodScore(score)}
                        aria-label={`心情 ${score} 分`}
                        aria-pressed={selected}
                        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-lg border-2 px-2 py-1 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                          selected
                            ? 'scale-110 border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="text-2xl" aria-hidden="true">{getMoodEmoji(score)}</span>
                        <span className={selected ? 'text-sm font-bold text-blue-700' : 'text-sm text-gray-600'}>{score}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  今日感想（可选）
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录今天的心情或感想..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleCheckin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                {loading ? '打卡中...' : '完成打卡'}
              </Button>

              {/* 积分奖励说明 */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  积分奖励规则
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• 每日打卡：10分 + 连击奖励</p>
                  <p>• 连续7天：额外20分</p>
                  <p>• 连续30天：额外50分</p>
                  <p>• 连续100天：额外100分</p>
                  <p>• 积分可用于兑换游戏道具</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 积分商城 */}
      <PointsStore />

      {/* 记录询问弹窗：停留至用户自行选择，不自动跳转 */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="w-[95vw] max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              打卡完成！
            </DialogTitle>
            <DialogDescription className="text-center">
              是否要继续进行健康记录？记录今日的症状、药物或生活方式数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowRecordDialog(false)}
              className="w-full min-h-[48px] sm:w-auto"
            >
              暂不记录
            </Button>
            <Button
              onClick={() => {
                setShowRecordDialog(false);
                onNavigateToRecords?.();
              }}
              className="bg-green-600 hover:bg-green-700 w-full min-h-[48px] sm:w-auto"
            >
              <Activity className="h-4 w-4 mr-2" />
              去记录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckinSection;
