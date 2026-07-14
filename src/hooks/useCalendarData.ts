import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDailyCheckins, deleteAllCheckins } from '@/services/dailyCheckinService';
import { getMeniereRecords } from '@/services/meniereRecordService';
import { useToast } from '@/hooks/use-toast';
import {
  getBeijingTime,
  getBeijingDateString,
  getBeijingDayOf,
  getMonthRange,
} from '@/utils/beijingTime';

interface DayData {
  date: string;
  hasCheckin: boolean;
  moodScore?: number;
  hasSymptoms: boolean;
  symptomCount: number;
}

export const useCalendarData = () => {
  const [currentDate, setCurrentDate] = useState(getBeijingTime());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { start: startDate, end: endDate } = getMonthRange(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthQuery = useQuery({
    queryKey: ['calendar-month', startDate, endDate],
    queryFn: async (): Promise<DayData[]> => {
      const [checkins, records] = await Promise.all([
        getDailyCheckins(startDate, endDate),
        getMeniereRecords(startDate, endDate),
      ]);

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthDays: DayData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const date = getBeijingDateString(dayDate);

        const checkin = checkins.find((c) => c.checkin_date === date);

        const dayRecords = records.filter((r) => {
          if (!r.timestamp) return false;
          // r.timestamp 是真 UTC，按北京日归桶（不能用读本地字段的 getBeijingDateString）
          return getBeijingDayOf(r.timestamp) === date;
        });

        const totalRecordsCount = dayRecords.length;
        const hasAnySymptoms = dayRecords.some((r) => {
          if (r.type === 'dizziness' && r.symptoms && r.symptoms.length > 0) return true;
          if (r.type === 'lifestyle' && ((r.diet?.length ?? 0) > 0 || r.sleep || r.stress)) return true;
          if (r.type === 'medication' && (r.medications?.length ?? 0) > 0) return true;
          if (r.type === 'voice' && r.note) return true;
          return false;
        });

        monthDays.push({
          date,
          hasCheckin: !!checkin,
          moodScore: checkin?.mood_score || undefined,
          hasSymptoms: hasAnySymptoms,
          symptomCount: totalRecordsCount,
        });
      }

      return monthDays;
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllCheckins,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-month'] });
      toast({ title: '删除成功', description: '所有打卡记录已删除' });
    },
    onError: (error) => {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    },
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(getBeijingTime());
  };

  return {
    currentDate,
    monthData: monthQuery.data ?? [],
    loading: monthQuery.isPending || deleteAllMutation.isPending,
    isError: monthQuery.isError,
    loadMonthData: () => {
      void monthQuery.refetch();
    },
    refetch: monthQuery.refetch,
    handleDeleteAllCheckins: () => deleteAllMutation.mutate(),
    navigateMonth,
    goToToday,
  };
};
