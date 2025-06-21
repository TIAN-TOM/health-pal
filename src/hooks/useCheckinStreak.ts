
import { useState, useEffect } from 'react';
import { getCheckinHistory } from '@/services/dailyCheckinService';
import { getBeijingDateString } from '@/utils/beijingTime';

export const useCheckinStreak = () => {
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateStreak = async () => {
    try {
      setLoading(true);
      // 获取最近90天的打卡记录
      const records = await getCheckinHistory(90);
      
      if (records.length === 0) {
        setStreakDays(0);
        return;
      }

      // 按日期排序（最新的在前）
      const sortedRecords = records.sort((a, b) => 
        new Date(b.checkin_date).getTime() - new Date(a.checkin_date).getTime()
      );

      let streak = 0;
      const today = getBeijingDateString();
      
      // 检查是否包含今天
      const todayRecord = sortedRecords.find(record => record.checkin_date === today);
      
      if (todayRecord) {
        streak = 1;
        
        // 从今天开始往前计算连续天数
        const todayDate = new Date(today);
        for (let i = 1; i < sortedRecords.length; i++) {
          const checkDate = new Date(todayDate);
          checkDate.setDate(checkDate.getDate() - i);
          const expectedDate = getBeijingDateString(checkDate);
          
          const hasRecord = sortedRecords.some(record => record.checkin_date === expectedDate);
          if (hasRecord) {
            streak++;
          } else {
            break;
          }
        }
      } else {
        // 如果今天没有打卡，检查昨天开始的连续记录
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getBeijingDateString(yesterday);
        
        const yesterdayRecord = sortedRecords.find(record => record.checkin_date === yesterdayStr);
        
        if (yesterdayRecord) {
          streak = 1;
          
          // 从昨天开始往前计算
          for (let i = 2; i < sortedRecords.length + 1; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            const expectedDate = getBeijingDateString(checkDate);
            
            const hasRecord = sortedRecords.some(record => record.checkin_date === expectedDate);
            if (hasRecord) {
              streak++;
            } else {
              break;
            }
          }
        }
      }

      setStreakDays(streak);
    } catch (error) {
      console.error('计算连续打卡天数失败:', error);
      setStreakDays(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStreak();
  }, []);

  return { streakDays, loading, refreshStreak: calculateStreak };
};
