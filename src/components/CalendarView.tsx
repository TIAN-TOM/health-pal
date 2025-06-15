
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Smile, Frown, Meh } from 'lucide-react';
import { getDailyCheckins } from '@/services/dailyCheckinService';
import { getMeniereRecords } from '@/services/meniereRecordService';
import { useToast } from '@/hooks/use-toast';

interface DayData {
  date: string;
  hasCheckin: boolean;
  moodScore?: number;
  hasSymptoms: boolean;
  symptomCount: number;
}

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 获取北京时间
  const getBeijingTime = (date: Date = new Date()) => {
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    return new Date(utcTime + (8 * 60 * 60 * 1000));
  };

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date: Date) => {
    const beijingDate = getBeijingTime(date);
    return beijingDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // 获取当月的第一天和最后一天
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = formatDate(firstDay);
      const endDate = formatDate(lastDay);

      // 获取打卡数据和症状记录
      const [checkins, records] = await Promise.all([
        getDailyCheckins(startDate, endDate),
        getMeniereRecords(startDate, endDate)
      ]);

      // 生成当月的所有日期数据
      const daysInMonth = lastDay.getDate();
      const monthDays: DayData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = formatDate(new Date(year, month, day));
        
        const checkin = checkins.find(c => c.checkin_date === date);
        const dayRecords = records.filter(r => r.timestamp.startsWith(date));
        
        monthDays.push({
          date,
          hasCheckin: !!checkin,
          moodScore: checkin?.mood_score || undefined,
          hasSymptoms: dayRecords.some(r => r.type === 'dizziness' && r.symptoms && r.symptoms.length > 0),
          symptomCount: dayRecords.filter(r => r.type === 'dizziness').length
        });
      }

      setMonthData(monthDays);
    } catch (error) {
      console.error('加载月度数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载月度数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (moodScore?: number) => {
    if (moodScore === undefined) return null;
    if (moodScore >= 7) return <Smile className="h-4 w-4 text-green-500" />;
    if (moodScore >= 4) return <Meh className="h-4 w-4 text-yellow-500" />;
    return <Frown className="h-4 w-4 text-red-500" />;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(getBeijingTime());
  };

  // 获取月份的第一天是星期几
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // 创建日历网格
  const calendarDays = [];
  
  // 添加空白格子（上个月的天数）
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 添加当月的日期
  monthData.forEach((dayData, index) => {
    calendarDays.push(dayData);
  });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthName = currentDate.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long' 
  });

  const today = formatDate(getBeijingTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            每日数据日历
          </CardTitle>
          <Button onClick={goToToday} variant="outline" size="sm">
            今天
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigateMonth('prev')}
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-medium">{monthName}</h3>
          
          <Button
            onClick={() => navigateMonth('next')}
            variant="ghost"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => {
                if (!dayData) {
                  return <div key={index} className="p-2 h-16"></div>;
                }
                
                const isToday = dayData.date === today;
                const dayNumber = new Date(dayData.date).getDate();
                
                return (
                  <div
                    key={dayData.date}
                    className={`
                      p-2 h-16 border rounded-lg flex flex-col items-center justify-between
                      ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                      ${dayData.hasCheckin ? 'bg-green-50' : ''}
                      ${dayData.hasSymptoms ? 'bg-red-50' : ''}
                    `}
                  >
                    <div className="text-sm font-medium">{dayNumber}</div>
                    
                    <div className="flex items-center space-x-1">
                      {/* 心情图标 */}
                      {getMoodIcon(dayData.moodScore)}
                      
                      {/* 打卡状态 */}
                      {dayData.hasCheckin && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      
                      {/* 症状计数 */}
                      {dayData.symptomCount > 0 && (
                        <div className="text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                          {dayData.symptomCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 图例 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>已打卡</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>症状记录数</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Smile className="h-4 w-4 text-green-500" />
                  <span>心情好 (7-10)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Meh className="h-4 w-4 text-yellow-500" />
                  <span>心情一般 (4-6)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Frown className="h-4 w-4 text-red-500" />
                  <span>心情不好 (1-3)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
