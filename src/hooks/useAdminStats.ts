
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  todayCheckins: number;
  symptomRecords: number;
  lifestyleRecords: number;
  loading: boolean;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    todayCheckins: 0,
    symptomRecords: 0,
    lifestyleRecords: 0,
    loading: true
  });

  const loadStats = async () => {
    try {
      console.log('开始加载管理员统计数据...');
      
      // 获取总用户数
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 获取今日打卡数
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCheckins } = await supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('checkin_date', today);

      // 获取症状记录数
      const { count: symptomRecords } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'symptom');

      // 获取生活记录数
      const { count: lifestyleRecords } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'lifestyle');

      // 获取活跃用户数（过去7天有打卡的用户）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: activeUsersData } = await supabase
        .from('daily_checkins')
        .select('user_id')
        .gte('checkin_date', sevenDaysAgo.toISOString().split('T')[0]);

      const activeUsers = new Set(activeUsersData?.map(record => record.user_id)).size;

      // 获取新注册用户数（过去7天）
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      console.log('统计数据加载完成:', {
        totalUsers,
        activeUsers,
        newUsers,
        todayCheckins,
        symptomRecords,
        lifestyleRecords
      });

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers,
        newUsers: newUsers || 0,
        todayCheckins: todayCheckins || 0,
        symptomRecords: symptomRecords || 0,
        lifestyleRecords: lifestyleRecords || 0,
        loading: false
      });

    } catch (error) {
      console.error('加载管理员统计数据失败:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadStats();
    
    // 设置定时刷新，每30秒更新一次数据
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, refreshStats: loadStats };
};
