
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayCheckin, getCheckinHistory } from '@/services/dailyCheckinService';
import { getBeijingTime, getBeijingDateString } from '@/utils/beijingTime';
import type { Tables } from '@/integrations/supabase/types';

type DailyCheckin = Tables<'daily_checkins'>;

// 打卡历史查询配置：与 useCheckinStreak 共用同一 queryKey，
// react-query 会自动合并去重，两个 hook 同时挂载也只发一次请求
export const CHECKIN_HISTORY_QUERY_KEY = ['checkin-history', 90] as const;
export const checkinHistoryQueryFn = () => getCheckinHistory(90);

export const useDailyCheckinData = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getBeijingTime());

  const today = getBeijingDateString();

  const todayCheckinQuery = useQuery({
    queryKey: ['today-checkin', today],
    queryFn: getTodayCheckin,
  });

  const historyQuery = useQuery({
    queryKey: CHECKIN_HISTORY_QUERY_KEY,
    queryFn: checkinHistoryQueryFn,
  });

  const checkinDates = useMemo(
    () =>
      (historyQuery.data ?? []).map(
        record => new Date(record.checkin_date + 'T00:00:00+08:00')
      ),
    [historyQuery.data]
  );

  // 打卡/取消打卡后由调用方直接写入缓存，保持原有 setTodayCheckin 的用法不变
  const setTodayCheckin = (checkin: DailyCheckin | null) => {
    queryClient.setQueryData(['today-checkin', today], checkin);
  };

  const loadTodayCheckin = async () => {
    await queryClient.invalidateQueries({ queryKey: ['today-checkin'] });
  };

  const loadCheckinHistory = async () => {
    await queryClient.invalidateQueries({ queryKey: ['checkin-history'] });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return {
    todayCheckin: todayCheckinQuery.data ?? null,
    setTodayCheckin,
    checkinDates,
    selectedDate,
    loadTodayCheckin,
    loadCheckinHistory,
    handleDateSelect
  };
};
