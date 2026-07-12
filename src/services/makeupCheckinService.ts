import { supabase } from '@/integrations/supabase/client';
import { getBeijingTime, getBeijingDateString, getBeijingTimeISO } from '@/utils/beijingTime';
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

  // 检查是否是未来日期（checkin_date 是北京日历日，比较基准也用北京"今天"）
  const today = getBeijingDateString();
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

  // 以北京日历日为基准，生成过去30天（不含今天）的候选日期，最近的日期在前
  const beijingNow = getBeijingTime();
  const candidateDates: string[] = [];
  for (let i = 1; i <= 30; i++) {
    const day = new Date(beijingNow);
    day.setDate(beijingNow.getDate() - i);
    candidateDates.push(getBeijingDateString(day));
  }

  const startDateStr = candidateDates[candidateDates.length - 1];
  const endDateStr = candidateDates[0];

  // 获取该时间范围内的所有打卡记录
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('checkin_date')
    .eq('user_id', user.id)
    .gte('checkin_date', startDateStr)
    .lte('checkin_date', endDateStr);

  const checkedDates = new Set((checkins || []).map(c => c.checkin_date));

  return candidateDates.filter(dateStr => !checkedDates.has(dateStr));
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

// 使用补签卡（通过服务端 SECURITY DEFINER 函数原子扣减库存）
export const consumeMakeupCard = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // 找到补签卡的 item_id
  const { data: inventory, error: fetchError } = await supabase
    .from('user_item_inventory')
    .select('item_id, quantity')
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

  const { data, error } = await supabase.rpc('consume_inventory_item', {
    p_item_id: inventory.item_id,
    p_quantity: 1,
  });

  if (error) {
    console.error('使用补签卡失败:', error);
    return false;
  }

  return (data as { success: boolean })?.success === true;
};