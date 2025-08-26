
import { supabase } from '@/integrations/supabase/client';
import { getBeijingDateString } from '@/utils/beijingTime';
import type { Tables } from '@/integrations/supabase/types';

type UserPoints = Tables<'user_points'>;
type PointsTransaction = Tables<'points_transactions'>;

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

export const getEffectiveUserPoints = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return 0;
  }

  const { data, error } = await supabase.rpc('get_effective_user_points', {
    check_user_id: user.id
  });

  if (error) {
    console.error('获取有效积分失败:', error);
    return 0;
  }

  return data || 0;
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

    // 记录积分交易
    await supabase.from('points_transactions').insert({
      user_id: user.id,
      amount: 10,
      transaction_type: 'checkin',
      description: '每日打卡奖励'
    });

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
      newStreak = userPoints.checkin_streak + 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    } else {
      return { points: 0, streak: userPoints.checkin_streak };
    }
  }

  // 计算积分奖励
  let bonusPoints = 0;
  if (newStreak >= 7) bonusPoints += 20;
  if (newStreak >= 30) bonusPoints += 50;
  if (newStreak >= 100) bonusPoints += 100;

  const streakBonus = Math.min(newStreak - 1, 10);
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

  // 记录积分交易
  await supabase.from('points_transactions').insert({
    user_id: user.id,
    amount: totalEarnedPoints,
    transaction_type: 'checkin',
    description: `每日打卡奖励 (连续${newStreak}天)`
  });

  return { points: totalEarnedPoints, streak: newStreak };
};

export const spendPoints = async (amount: number, description: string = '', referenceId?: string): Promise<boolean> => {
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

  if (!error) {
    // 记录积分交易
    await supabase.from('points_transactions').insert({
      user_id: user.id,
      amount: -amount,
      transaction_type: 'purchase',
      description,
      reference_id: referenceId
    });
  }

  return !error;
};

export const addPoints = async (amount: number, reason: string = '', transactionType: string = 'reward'): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  let userPoints = await getUserPoints();
  
  if (!userPoints) {
    const { error } = await supabase
      .from('user_points')
      .insert({
        user_id: user.id,
        total_points: amount,
        checkin_streak: 0,
        last_checkin_date: null
      });

    if (!error) {
      await supabase.from('points_transactions').insert({
        user_id: user.id,
        amount,
        transaction_type: transactionType,
        description: reason
      });
    }

    return !error;
  }

  const { error } = await supabase
    .from('user_points')
    .update({
      total_points: userPoints.total_points + amount,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);

  if (!error) {
    await supabase.from('points_transactions').insert({
      user_id: user.id,
      amount,
      transaction_type: transactionType,
      description: reason
    });
  }

  return !error;
};

// 管理员功能
export const adminUpdateUserPoints = async (
  targetUserId: string, 
  pointsChange: number, 
  transactionType: 'admin_grant' | 'admin_deduct', 
  description: string = ''
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('admin_update_user_points', {
    target_user_id: targetUserId,
    points_change: pointsChange,
    transaction_type: transactionType,
    description
  });

  if (error) {
    console.error('管理员更新积分失败:', error);
    return false;
  }

  return true;
};

export const getPointsTransactions = async (userId?: string): Promise<PointsTransaction[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const targetUserId = userId || user.id;
  
  const { data, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('获取积分交易记录失败:', error);
    return [];
  }

  return data || [];
};

export type { UserPoints, PointsTransaction };
