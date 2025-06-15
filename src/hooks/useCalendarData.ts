
import { useState, useEffect } from 'react';
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

export const useCalendarData = () => {
  const [currentDate, setCurrentDate] = useState(getBeijingTime());
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const { start: startDate, end: endDate } = getMonthRange(currentDate);
      
      console.log('查询日期范围:', startDate, '到', endDate);

      const [checkins, records] = await Promise.all([
        getDailyCheckins(startDate, endDate),
        getMeniereRecords(startDate, endDate)
      ]);

      console.log('获取到的打卡数据:', checkins.length, '条');
      console.log('获取到的症状记录:', records.length, '条');

      const displayDate = new Date(currentDate);
      const year = displayDate.getFullYear();
      const month = displayDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthDays: DayData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const date = getBeijingDateString(dayDate);
        
        const checkin = checkins.find(c => c.checkin_date === date);
        
        const dayRecords = records.filter(r => {
          if (!r.timestamp) return false;
          const recordDate = new Date(r.timestamp);
          const recordDateString = getBeijingDateString(recordDate);
          return recordDateString === date;
        });
        
        const totalRecordsCount = dayRecords.length;
        const hasAnySymptoms = dayRecords.some(r => {
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
      await loadMonthData();
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

  useEffect(() => {
    console.log('日历组件初始化，当前北京时间:', currentDate.toISOString());
    loadMonthData();
  }, [currentDate]);

  return {
    currentDate,
    monthData,
    loading,
    loadMonthData,
    handleDeleteAllCheckins,
    navigateMonth,
    goToToday
  };
};
