
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBeijingDateString } from '@/utils/beijingTime';
import { calculateStreak } from '@/utils/checkinStreak';
import {
  CHECKIN_HISTORY_QUERY_KEY,
  checkinHistoryQueryFn,
} from '@/hooks/useDailyCheckinData';

export const useCheckinStreak = () => {
  const queryClient = useQueryClient();

  // 与 useDailyCheckinData 共用同一 queryKey，react-query 自动去重，避免重复请求
  const { data, isLoading } = useQuery({
    queryKey: CHECKIN_HISTORY_QUERY_KEY,
    queryFn: checkinHistoryQueryFn,
  });

  const streakDays = useMemo(
    () => calculateStreak(data ?? [], getBeijingDateString()),
    [data]
  );

  const refreshStreak = async () => {
    await queryClient.invalidateQueries({ queryKey: ['checkin-history'] });
  };

  return { streakDays, loading: isLoading, refreshStreak };
};
