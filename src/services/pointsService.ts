
import { supabase } from '@/integrations/supabase/client';
import { getBeijingDateString } from '@/utils/beijingTime';

export interface UserPoints {
  user_id: string;
  total_points: number;
  checkin_streak: number;
  last_checkin_date: string | null;
  created_at: string;
  updated_at: string;
}

export const getUserPoints = async (): Promise<UserPoints | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('获取用户积分失败:', error);
    return null;
  }

  return data;
};

export const updatePointsForCheckin = async (): Promise<{ points: number; streak: number } | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const today = getBeijingDateString();
  
  // 获取当前用户积分信息
  let userPoints = await getUserPoints();
  
  if (!userPoints) {
    // 首次打卡，创建积分记录
    const { data, error } = await supabase
      .from('user_points')
      .insert({
        user_id: user.id,
        total_points: 10,
        checkin_streak: 1,
        last_checkin_date: today
      })
      .select()
      .single();

    if (error) {
      console.error('创建积分记录失败:', error);
      return null;
    }

    return { points: 10, streak: 1 };
  }

  // 检查连续打卡
  let newStreak = 1;
  let basePoints = 10;
  
  if (userPoints.last_checkin_date) {
    const lastDate = new Date(userPoints.last_checkin_date);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // 连续打卡
      newStreak = userPoints.checkin_streak + 1;
    } else if (daysDiff > 1) {
      // 中断了，重新开始
      newStreak = 1;
    } else {
      // 同一天重复打卡，不增加积分
      return { points: 0, streak: userPoints.checkin_streak };
    }
  }

  // 计算积分奖励
  let bonusPoints = 0;
  if (newStreak >= 7) {
    bonusPoints += 20; // 连续7天额外奖励
  }
  if (newStreak >= 30) {
    bonusPoints += 50; // 连续30天额外奖励
  }
  if (newStreak >= 100) {
    bonusPoints += 100; // 连续100天额外奖励
  }

  // 连击奖励：每连续打卡一天多1分
  const streakBonus = Math.min(newStreak - 1, 10); // 最多额外10分
  const totalEarnedPoints = basePoints + bonusPoints + streakBonus;

  // 更新积分
  const { error } = await supabase
    .from('user_points')
    .update({
      total_points: userPoints.total_points + totalEarnedPoints,
      checkin_streak: newStreak,
      last_checkin_date: today,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('更新积分失败:', error);
    return null;
  }

  return { points: totalEarnedPoints, streak: newStreak };
};

export const spendPoints = async (amount: number): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const userPoints = await getUserPoints();
  if (!userPoints || userPoints.total_points < amount) {
    return false;
  }

  const { error } = await supabase
    .from('user_points')
    .update({
      total_points: userPoints.total_points - amount,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);

  return !error;
};

export const addPoints = async (amount: number, reason: string = ''): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  let userPoints = await getUserPoints();
  
  if (!userPoints) {
    // 首次创建积分记录
    const { error } = await supabase
      .from('user_points')
      .insert({
        user_id: user.id,
        total_points: amount,
        checkin_streak: 0,
        last_checkin_date: null
      });

    return !error;
  }

  const { error } = await supabase
    .from('user_points')
    .update({
      total_points: userPoints.total_points + amount,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);

  return !error;
};
