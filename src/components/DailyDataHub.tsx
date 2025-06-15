import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Heart, MessageCircle, Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTodayCheckin, createCheckin, getCheckinHistory } from '@/services/dailyCheckinService';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';
import { getBeijingTime, formatBeijingTime, formatBeijingDateTime } from '@/utils/beijingTime';
import CalendarView from './CalendarView';
import HistoryView from './HistoryView';

type DailyCheckin = Tables<'daily_checkins'>;

interface DailyDataHubProps {
  onBack: () => void;
}

const DailyDataHub = ({ onBack }: DailyDataHubProps) => {
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [moodScore, setMoodScore] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkinDates, setCheckinDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getBeijingTime());
  const { toast } = useToast();

  useEffect(() => {
    loadTodayCheckin();
    loadCheckinHistory();
  }, []);

  const loadTodayCheckin = async () => {
    try {
      const checkin = await getTodayCheckin();
      setTodayCheckin(checkin);
    } catch (error) {
      console.error('获取今日打卡记录失败:', error);
    }
  };

  const loadCheckinHistory = async () => {
    try {
      const records = await getCheckinHistory(90);
      const dates = records.map(record => new Date(record.checkin_date + 'T00:00:00+08:00')); // 使用北京时间
      setCheckinDates(dates);
    } catch (error) {
      console.error('加载打卡历史失败:', error);
    }
  };

  const handleCheckin = async () => {
    try {
      setLoading(true);
      const newCheckin = await createCheckin(moodScore, note || undefined);
      setTodayCheckin(newCheckin);
      setNote('');
      loadCheckinHistory(); // 重新加载历史记录以更新日历
      toast({
        title: "打卡成功！",
        description: "今日打卡已完成，继续保持好习惯！",
      });
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const isCheckinDate = (date: Date) => {
    return checkinDates.some(checkinDate => 
      format(checkinDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const handleRecordClick = (record: any) => {
    console.log('记录被点击:', record);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 返回按钮 */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">每日数据中心</h1>
        </div>

        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="checkin">每日打卡</TabsTrigger>
            <TabsTrigger value="calendar">日历视图</TabsTrigger>
            <TabsTrigger value="list">列表视图</TabsTrigger>
            <TabsTrigger value="checkin-calendar">打卡日历</TabsTrigger>
          </TabsList>

          <TabsContent value="checkin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  每日打卡
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayCheckin ? (
                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center mb-3">
                      <Check className="h-8 w-8 text-green-600 mr-2" />
                      <span className="text-xl font-bold text-green-800">今日已打卡</span>
                    </div>
                    <div className="text-green-700">
                      <p>心情评分: {getMoodEmoji(todayCheckin.mood_score || 3)} {getMoodText(todayCheckin.mood_score || 3)} ({todayCheckin.mood_score}/5)</p>
                      {todayCheckin.note && (
                        <p className="mt-2 text-sm">备注: {todayCheckin.note}</p>
                      )}
                      <p className="text-xs text-green-600 mt-2">
                        打卡时间: {formatBeijingTime(todayCheckin.created_at)} (北京时间)
                      </p>
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
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-500">1</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={moodScore}
                          onChange={(e) => setMoodScore(Number(e.target.value))}
                          className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-500">5</span>
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  历史数据列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryView onRecordClick={handleRecordClick} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin-calendar">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">打卡日历</CardTitle>
                <p className="text-sm text-gray-600">绿色日期表示已打卡的日子</p>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border w-full"
                  modifiers={{
                    checkin: checkinDates,
                  }}
                  modifiersStyles={{
                    checkin: {
                      backgroundColor: '#22c55e',
                      color: 'white',
                      fontWeight: 'bold',
                    },
                  }}
                  disabled={(date) => date > getBeijingTime()}
                  locale={zhCN}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span>已打卡</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                      <span>未打卡</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    当前时间: {formatBeijingDateTime(getBeijingTime())} (北京时间)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DailyDataHub;
