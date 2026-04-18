
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserPoints = Tables<'user_points'>;
type PointsTransaction = Tables<'points_transactions'>;

export const getUserPoints = async (): Promise<UserPoints | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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
  if (!user) return 0;

  const { data, error } = await supabase.rpc('get_effective_user_points', {
    check_user_id: user.id
  });
  if (error) {
    console.error('获取有效积分失败:', error);
    return 0;
  }
  return data || 0;
};

/**
 * 每日打卡积分发放（服务端原子计算）
 * 客户端无法再直接修改 user_points，所有积分变动通过 SECURITY DEFINER 函数。
 */
export const updatePointsForCheckin = async (): Promise<{ points: number; streak: number } | null> => {
  const { data, error } = await supabase.rpc('award_points_for_checkin');
  if (error) {
    console.error('发放打卡积分失败:', error);
    return null;
  }
  const result = data as { success: boolean; points_awarded?: number; streak?: number; error?: string };
  if (!result?.success) {
    console.warn('打卡积分发放未成功:', result?.error);
    return null;
  }
  return {
    points: result.points_awarded || 0,
    streak: result.streak || 0
  };
};

/**
 * 用户消费积分（如补签卡兑换等场景，原子检查余额）
 */
export const spendPoints = async (
  amount: number,
  description: string = '',
  referenceId?: string
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('spend_user_points', {
    p_amount: amount,
    p_reason: description,
    p_reference_id: referenceId ?? null
  });
  if (error) {
    console.error('消费积分失败:', error);
    return false;
  }
  return (data as { success: boolean })?.success === true;
};

/**
 * 生日积分（仅用于生日礼物，服务端校验生日并防止重复领取）
 */
export const claimBirthdayBonus = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('award_birthday_bonus');
  if (error) {
    console.error('领取生日积分失败:', error);
    return false;
  }
  return (data as { success: boolean })?.success === true;
};

/**
 * 游戏通关奖励积分（服务端校验，每日封顶 100，单次最多 50）
 */
export const awardGameCompletionBonus = async (
  gameId: string,
  amount: number,
  description?: string
): Promise<{ awarded: number; dailyRemaining: number } | null> => {
  const { data, error } = await supabase.rpc('award_game_completion_bonus', {
    p_game_id: gameId,
    p_amount: amount,
    p_description: description ?? null,
  });
  if (error) {
    console.error('发放游戏奖励积分失败:', error);
    return null;
  }
  const result = data as {
    success: boolean;
    points_awarded?: number;
    daily_remaining?: number;
    error?: string;
  };
  if (!result?.success) return null;
  return {
    awarded: result.points_awarded || 0,
    dailyRemaining: result.daily_remaining ?? 0,
  };
};

// 管理员功能
export const adminUpdateUserPoints = async (
  targetUserId: string,
  pointsChange: number,
  transactionType: 'admin_grant' | 'admin_deduct',
  description: string = ''
): Promise<boolean> => {
  const { error } = await supabase.rpc('admin_update_user_points', {
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
  if (!user) return [];

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
