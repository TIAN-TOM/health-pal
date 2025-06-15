
import { useState, useEffect } from 'react';
import { getTodayCheckin, getCheckinHistory } from '@/services/dailyCheckinService';
import { getBeijingTime } from '@/utils/beijingTime';
import type { Tables } from '@/integrations/supabase/types';

type DailyCheckin = Tables<'daily_checkins'>;

export const useDailyCheckinData = () => {
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [checkinDates, setCheckinDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getBeijingTime());

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
      const dates = records.map(record => new Date(record.checkin_date + 'T00:00:00+08:00'));
      setCheckinDates(dates);
    } catch (error) {
      console.error('加载打卡历史失败:', error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    loadTodayCheckin();
    loadCheckinHistory();
  }, []);

  return {
    todayCheckin,
    setTodayCheckin,
    checkinDates,
    selectedDate,
    loadTodayCheckin,
    loadCheckinHistory,
    handleDateSelect
  };
};
