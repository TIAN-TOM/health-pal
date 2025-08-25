
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getBeijingTime } from '@/utils/beijingTime';
import { zhCN } from 'date-fns/locale';
import { Flame, Calendar as CalendarIcon, Ticket } from 'lucide-react';
import { useCheckinStreak } from '@/hooks/useCheckinStreak';
import { getUserMakeupCards, createMakeupCheckin, getAvailableMakeupDates, useMakeupCard } from '@/services/makeupCheckinService';
import { useToast } from '@/hooks/use-toast';

interface CheckinCalendarSectionProps {
  checkinDates: Date[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onMakeupSuccess?: () => void;
}

const CheckinCalendarSection = ({ checkinDates, selectedDate, onDateSelect, onMakeupSuccess }: CheckinCalendarSectionProps) => {
  const { streakDays, loading } = useCheckinStreak();
  const { toast } = useToast();
  const [makeupCardsCount, setMakeupCardsCount] = useState(0);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showMakeupDialog, setShowMakeupDialog] = useState(false);
  const [selectedMakeupDate, setSelectedMakeupDate] = useState('');
  const [moodScore, setMoodScore] = useState(3);
  const [note, setNote] = useState('');
  const [makeupLoading, setMakeupLoading] = useState(false);

  useEffect(() => {
    loadMakeupData();
  }, []);

  const loadMakeupData = async () => {
    const [cardsCount, dates] = await Promise.all([
      getUserMakeupCards(),
      getAvailableMakeupDates()
    ]);
    setMakeupCardsCount(cardsCount);
    setAvailableDates(dates);
  };

  const handleMakeupCheckin = async () => {
    if (!selectedMakeupDate) {
      toast({
        title: "请选择补签日期",
        variant: "destructive",
      });
      return;
    }

    try {
      setMakeupLoading(true);
      
      // 使用补签卡
      const cardUsed = await useMakeupCard();
      if (!cardUsed) {
        toast({
          title: "补签卡不足",
          description: "请先购买补签卡",
          variant: "destructive",
        });
        return;
      }

      // 创建补签记录
      await createMakeupCheckin(selectedMakeupDate, moodScore, note || undefined);
      
      toast({
        title: "补签成功！",
        description: `已补签 ${selectedMakeupDate} 的打卡记录`,
      });

      // 重置表单
      setSelectedMakeupDate('');
      setMoodScore(3);
      setNote('');
      setShowMakeupDialog(false);
      
      // 刷新数据
      await loadMakeupData();
      onMakeupSuccess?.();
      
    } catch (error: any) {
      toast({
        title: "补签失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMakeupLoading(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>打卡日历</span>
          <div className="flex items-center space-x-4">
            {makeupCardsCount > 0 && (
              <Dialog open={showMakeupDialog} onOpenChange={setShowMakeupDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                    <Ticket className="h-4 w-4 mr-1" />
                    补签 ({makeupCardsCount})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                      使用补签卡
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <span>剩余补签卡：{makeupCardsCount} 张</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">选择补签日期</label>
                      <Select value={selectedMakeupDate} onValueChange={setSelectedMakeupDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择要补签的日期" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.length > 0 ? (
                            availableDates.map(date => (
                              <SelectItem key={date} value={date}>
                                {new Date(date).toLocaleDateString('zh-CN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short'
                                })}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>暂无可补签日期</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">补签时心情评分</label>
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getMoodEmoji(moodScore)}</span>
                        <span className="font-medium">{getMoodText(moodScore)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-500">1</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={moodScore}
                          onChange={(e) => setMoodScore(Number(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-500">5</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">备注（可选）</label>
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="记录当时的心情或情况..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowMakeupDialog(false)}
                        className="flex-1"
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleMakeupCheckin}
                        disabled={makeupLoading || !selectedMakeupDate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {makeupLoading ? '补签中...' : '确认补签'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {!loading && (
              <div className="flex items-center space-x-2 text-orange-600">
                <Flame className="h-5 w-5" />
                <span className="text-sm font-medium">
                  连续打卡 {streakDays} 天
                </span>
              </div>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          绿色日期表示已打卡的日子
          {makeupCardsCount > 0 && (
            <>，<Badge variant="outline" className="ml-1 text-blue-600 border-blue-300">拥有 {makeupCardsCount} 张补签卡</Badge></>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
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
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>已打卡</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <span>未打卡</span>
            </div>
          </div>
          {streakDays > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center text-orange-800">
                <Flame className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {streakDays >= 7 ? '太棒了！' : '继续加油！'}已连续打卡 {streakDays} 天
                  {streakDays >= 7 && '，坚持就是胜利！'}
                </span>
              </div>
            </div>
          )}
          
          {/* 补签卡使用按钮 */}
          {makeupCardsCount > 0 && availableDates.length > 0 && (
            <div className="mt-3">
              <Dialog open={showMakeupDialog} onOpenChange={setShowMakeupDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Ticket className="h-4 w-4 mr-2" />
                    使用补签卡 ({makeupCardsCount}张)
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Ticket className="h-5 w-5 mr-2 text-blue-600" />
                      补签打卡
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">选择补签日期</label>
                      <Select value={selectedMakeupDate} onValueChange={setSelectedMakeupDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择要补签的日期" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.map(date => (
                            <SelectItem key={date} value={date}>{date}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">心情评分 (1-5分)</label>
                      <Select value={moodScore.toString()} onValueChange={(value) => setMoodScore(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(score => (
                            <SelectItem key={score} value={score.toString()}>
                              {score}分 {'★'.repeat(score)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">今日感想</label>
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="记录您当天的心情和感想..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleMakeupCheckin}
                      disabled={!selectedMakeupDate || makeupLoading}
                      className="w-full"
                    >
                      {makeupLoading ? '补签中...' : '确认补签'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckinCalendarSection;
