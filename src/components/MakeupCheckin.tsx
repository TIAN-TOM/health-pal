
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { getMakeupCardsCount, useMakeupCard } from '@/services/pointsStoreService';
import { getUserPoints } from '@/services/pointsService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getBeijingDateString } from '@/utils/beijingTime';

const MakeupCheckin = () => {
  const [makeupCards, setMakeupCards] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [checkinHistory, setCheckinHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 加载补签卡数量
    const cardCount = getMakeupCardsCount();
    setMakeupCards(cardCount);

    // 加载打卡历史
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('checkin_date')
        .eq('user_id', user.id);
      
      if (checkins) {
        setCheckinHistory(checkins.map(c => c.checkin_date));
      }
    }
  };

  const handleMakeupCheckin = async () => {
    if (!selectedDate) {
      toast({
        title: "请选择日期",
        description: "请先选择要补签的日期",
        variant: "destructive",
      });
      return;
    }

    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const today = getBeijingDateString();

    // 检查是否选择了未来日期
    if (selectedDateString >= today) {
      toast({
        title: "无法补签",
        description: "不能补签今天或未来的日期",
        variant: "destructive",
      });
      return;
    }

    // 检查是否已经打卡
    if (checkinHistory.includes(selectedDateString)) {
      toast({
        title: "无法补签",
        description: "该日期已经打卡过了",
        variant: "destructive",
      });
      return;
    }

    // 检查补签卡数量
    if (makeupCards <= 0) {
      toast({
        title: "补签卡不足",
        description: "请先在积分商城购买补签卡",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 创建补签记录
      const { error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          checkin_date: selectedDateString,
          mood_score: 5,
          note: '使用补签卡补签'
        });

      if (error) {
        throw error;
      }

      // 使用补签卡
      const cardUsed = useMakeupCard();
      if (!cardUsed) {
        throw new Error('使用补签卡失败');
      }

      toast({
        title: "补签成功！",
        description: `已成功补签 ${selectedDateString}`,
      });

      // 重新加载数据
      await loadData();
      setSelectedDate(undefined);

    } catch (error) {
      console.error('补签失败:', error);
      toast({
        title: "补签失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDateUnavailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const today = getBeijingDateString();
    
    // 禁用今天及未来日期，以及已打卡日期
    return dateString >= today || checkinHistory.includes(dateString);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <CalendarIcon className="h-4 w-4 mr-2" />
          补签打卡
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
            补签打卡
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 补签卡状态 */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium">补签卡余量</span>
                </div>
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  {makeupCards} 张
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 日期选择 */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">选择补签日期</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateUnavailable}
              className="rounded-md border"
            />
          </div>

          {/* 使用说明 */}
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">使用说明：</p>
                <ul className="space-y-1 text-xs">
                  <li>• 每张补签卡可以补签一天</li>
                  <li>• 不能补签今天或未来日期</li>
                  <li>• 已打卡的日期无法补签</li>
                  <li>• 补签卡可在积分商城购买</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleMakeupCheckin}
              disabled={!selectedDate || makeupCards <= 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  补签中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  确认补签
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MakeupCheckin;
