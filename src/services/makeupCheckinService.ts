import { supabase } from '@/integrations/supabase/client';
import { getBeijingTimeISO } from '@/utils/beijingTime';
import { notifyAdminActivity, ACTIVITY_TYPES, MODULE_NAMES } from '@/services/adminNotificationService';
import type { Tables } from '@/integrations/supabase/types';

type DailyCheckin = Tables<'daily_checkins'>;

// 补签打卡记录
export const createMakeupCheckin = async (
  targetDate: string,
  moodScore: number = 3,
  note?: string
): Promise<DailyCheckin> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  // 检查目标日期是否已经有打卡记录
  const { data: existingCheckin } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('checkin_date', targetDate)
    .maybeSingle();

  if (existingCheckin) {
    throw new Error('该日期已有打卡记录');
  }

  // 检查是否是未来日期
  const today = new Date().toISOString().split('T')[0];
  if (targetDate > today) {
    throw new Error('不能补签未来的日期');
  }

  // 创建补签记录
  const { data, error } = await supabase
    .from('daily_checkins')
    .insert({
      user_id: user.id,
      checkin_date: targetDate,
      mood_score: moodScore,
      note: note || '使用补签卡补签',
      is_makeup: true,
      created_at: getBeijingTimeISO(),
      updated_at: getBeijingTimeISO()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`补签失败: ${error.message}`);
  }

  // 通知管理员
  try {
    await notifyAdminActivity({
      activity_type: ACTIVITY_TYPES.MAKEUP_CHECKIN,
      activity_description: `使用补签卡补签了 ${targetDate} 的打卡记录`,
      module_name: MODULE_NAMES.CHECKIN
    });
  } catch (error) {
    console.error('通知管理员失败:', error);
  }

  return data;
};

// 获取可补签的日期列表（过去30天内的未打卡日期）
export const getAvailableMakeupDates = async (): Promise<string[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // 获取过去30天的日期范围
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // 获取该时间范围内的所有打卡记录
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('checkin_date')
    .eq('user_id', user.id)
    .gte('checkin_date', startDateStr)
    .lte('checkin_date', endDateStr);

  const checkedDates = new Set((checkins || []).map(c => c.checkin_date));
  
  // 生成所有可能的日期
  const allDates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (current < new Date()) { // 不包括今天
      const dateStr = current.toISOString().split('T')[0];
      if (!checkedDates.has(dateStr)) {
        allDates.push(dateStr);
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return allDates.reverse(); // 最近的日期在前
};

// 检查用户是否有补签卡
export const getUserMakeupCards = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return 0;
  }

  const { data, error } = await supabase
    .from('user_item_inventory')
    .select('quantity')
    .eq('user_id', user.id)
    .eq('item_type', 'makeup_card')
    .maybeSingle();

  if (error) {
    console.error('获取补签卡数量失败:', error);
    return 0;
  }

  return data?.quantity || 0;
};

// 使用补签卡
export const useMakeupCard = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  // 获取当前补签卡数量
  const { data: inventory, error: fetchError } = await supabase
    .from('user_item_inventory')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_type', 'makeup_card')
    .maybeSingle();

  if (fetchError) {
    console.error('获取补签卡失败:', fetchError);
    return false;
  }

  if (!inventory || inventory.quantity <= 0) {
    return false;
  }

  // 减少补签卡数量
  const { error: updateError } = await supabase
    .from('user_item_inventory')
    .update({ 
      quantity: inventory.quantity - 1,
      updated_at: getBeijingTimeISO()
    })
    .eq('id', inventory.id);

  if (updateError) {
    console.error('使用补签卡失败:', updateError);
    return false;
  }

  return true;
};