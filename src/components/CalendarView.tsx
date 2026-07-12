
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, RefreshCw } from 'lucide-react';
import { getTodayBeijingDate } from '@/utils/beijingTime';
import { useCalendarData } from '@/hooks/useCalendarData';
import CalendarHeader from './calendar/CalendarHeader';
import CalendarGrid from './calendar/CalendarGrid';
import CalendarLegend from './calendar/CalendarLegend';

const CalendarView = () => {
  const {
    currentDate,
    monthData,
    loading,
    isError,
    loadMonthData,
    refetch,
    handleDeleteAllCheckins,
    navigateMonth,
    goToToday
  } = useCalendarData();

  const displayDate = new Date(currentDate);
  const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // 创建日历网格
  const calendarDays: ((typeof monthData)[number] | null)[] = [];
  
  // 添加空白格子（上个月的天数）
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 添加当月的日期
  monthData.forEach((dayData) => {
    calendarDays.push(dayData);
  });

  const monthName = displayDate.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long' 
  });

  const today = getTodayBeijingDate();

  // 正确计算北京时间显示
  const formatBeijingTimeDisplay = () => {
    const now = new Date();
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
        <CardTitle className="text-xl flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          每日数据日历
        </CardTitle>
        
        <CalendarHeader
          monthName={monthName}
          onNavigateMonth={navigateMonth}
          onGoToToday={goToToday}
          onRefresh={loadMonthData}
          onDeleteAll={handleDeleteAllCheckins}
          loading={loading}
        />
      </CardHeader>
      
      <CardContent>
        {isError ? (
          <div className="text-center py-8 space-y-3" role="alert">
            <p className="text-gray-600">日历数据加载失败，请检查网络后重试</p>
            <Button variant="outline" onClick={() => refetch()}>
              重新加载
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <CalendarGrid calendarDays={calendarDays} today={today} />
            <CalendarLegend />
            
            {/* 当前时间显示 */}
            <div className="pt-2 border-t text-xs text-gray-600 text-center">
              当前北京时间: {formatBeijingTimeDisplay()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
