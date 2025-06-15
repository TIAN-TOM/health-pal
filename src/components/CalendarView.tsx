
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Smile, Frown, Meh, RefreshCw } from 'lucide-react';
import { getDailyCheckins } from '@/services/dailyCheckinService';
import { getMeniereRecords } from '@/services/meniereRecordService';
import { useToast } from '@/hooks/use-toast';
import { getBeijingTime, getBeijingDateString, getMonthRange, getTodayBeijingDate, deleteAllCheckins } from '@/utils/beijingTime';

interface DayData {
  date: string;
  hasCheckin: boolean;
  moodScore?: number;
  hasSymptoms: boolean;
  symptomCount: number;
}

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(getBeijingTime());
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('日历组件初始化，当前北京时间:', currentDate.toISOString());
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const { start: startDate, end: endDate } = getMonthRange(currentDate);
      
      console.log('查询日期范围:', startDate, '到', endDate);

      // 获取打卡数据和症状记录
      const [checkins, records] = await Promise.all([
        getDailyCheckins(startDate, endDate),
        getMeniereRecords(startDate, endDate)
      ]);

      console.log('获取到的打卡数据:', checkins.length, '条');
      console.log('获取到的症状记录:', records.length, '条');

      // 使用 currentDate 来生成当前显示月份的日期数据
      const displayDate = new Date(currentDate);
      const year = displayDate.getFullYear();
      const month = displayDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthDays: DayData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const date = getBeijingDateString(dayDate);
        
        const checkin = checkins.find(c => c.checkin_date === date);
        
        // 修复症状记录统计逻辑
        const dayRecords = records.filter(r => {
          if (!r.timestamp) return false;
          const recordDate = new Date(r.timestamp);
          const recordDateString = getBeijingDateString(recordDate);
          return recordDateString === date;
        });
        
        // 统计所有类型的记录，不仅仅是眩晕记录
        const totalRecordsCount = dayRecords.length;
        const hasAnySymptoms = dayRecords.some(r => {
          // 检查是否有症状记录
          if (r.type === 'dizziness' && r.symptoms && r.symptoms.length > 0) return true;
          if (r.type === 'lifestyle' && (r.diet?.length > 0 || r.sleep || r.stress)) return true;
          if (r.type === 'medication' && r.medications?.length > 0) return true;
          if (r.type === 'voice' && r.note) return true;
          return false;
        });
        
        monthDays.push({
          date,
          hasCheckin: !!checkin,
          moodScore: checkin?.mood_score || undefined,
          hasSymptoms: hasAnySymptoms,
          symptomCount: totalRecordsCount
        });
      }

      console.log('处理后的月度数据:', monthDays.filter(d => d.symptomCount > 0));
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

  const handleDeleteAllCheckins = async () => {
    try {
      setLoading(true);
      await deleteAllCheckins();
      await loadMonthData(); // 重新加载数据
      toast({
        title: "删除成功",
        description: "所有打卡记录已删除",
      });
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (moodScore?: number) => {
    if (moodScore === undefined) return null;
    if (moodScore >= 4) return <Smile className="h-4 w-4 text-green-500" />;
    if (moodScore >= 3) return <Meh className="h-4 w-4 text-yellow-500" />;
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
    console.log('切换月份到:', newDate.getFullYear(), newDate.getMonth() + 1);
  };

  const goToToday = () => {
    const todayBeijing = getBeijingTime();
    setCurrentDate(todayBeijing);
    console.log('跳转到今天，北京时间:', todayBeijing.toISOString());
  };

  // 获取当前显示月份的信息
  const beijingCurrentDate = getBeijingTime();
  const displayDate = new Date(currentDate);
  const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
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
  const monthName = displayDate.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long' 
  });

  // 获取今天的北京时间日期用于比较
  const today = getTodayBeijingDate();
  console.log('今天的北京时间日期:', today);
  console.log('当前北京时间完整:', beijingCurrentDate.toISOString());

  // 正确计算北京时间显示
  const formatBeijingTimeDisplay = () => {
    const now = new Date();
    // 直接使用本地时间转换为中国时区显示
    return now.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            每日数据日历
          </CardTitle>
          <div className="flex space-x-2">
            <Button onClick={loadMonthData} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleDeleteAllCheckins} variant="destructive" size="sm">
              清空记录
            </Button>
            <Button onClick={goToToday} variant="outline" size="sm">
              今天
            </Button>
          </div>
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
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
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
                const dayNumber = new Date(dayData.date + 'T00:00:00').getDate();
                
                console.log('检查日期:', dayData.date, '是否为今天:', isToday, '今天日期:', today);
                
                return (
                  <div
                    key={dayData.date}
                    className={`
                      p-2 h-16 border rounded-lg flex flex-col items-center justify-between
                      ${isToday ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200'}
                      ${dayData.hasCheckin ? 'bg-green-50' : ''}
                      ${dayData.hasSymptoms ? 'bg-red-50' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                      {dayNumber}
                      {isToday && <div className="text-xs text-blue-600">今天</div>}
                    </div>
                    
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
                  <span>记录数量</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Smile className="h-4 w-4 text-green-500" />
                  <span>心情好 (4-5分)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Meh className="h-4 w-4 text-yellow-500" />
                  <span>心情一般 (3分)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Frown className="h-4 w-4 text-red-500" />
                  <span>心情不好 (1-2分)</span>
                </div>
              </div>
            </div>
            
            {/* 当前时间显示 - 修复北京时间显示 */}
            <div className="pt-2 border-t text-xs text-gray-500 text-center">
              当前北京时间: {formatBeijingTimeDisplay()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
