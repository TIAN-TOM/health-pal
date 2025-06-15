
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type DailyCheckin = Tables<'daily_checkins'>;

// 获取北京时间的日期字符串 (YYYY-MM-DD)
const getBeijingDateString = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const beijingTime = new Date(utc + (8 * 3600000));
  return beijingTime.toISOString().split('T')[0];
};

// 获取北京时间的ISO字符串
const getBeijingTimeISO = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const beijingTime = new Date(utc + (8 * 3600000));
  return beijingTime.toISOString();
};

export const createCheckin = async (
  moodScore: number,
  note?: string,
  photoUrl?: string
): Promise<DailyCheckin> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const checkinDate = getBeijingDateString();

  // 检查今日是否已打卡
  const { data: existingCheckin } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('checkin_date', checkinDate)
    .maybeSingle();

  if (existingCheckin) {
    throw new Error('今日已完成打卡');
  }

  // 创建新的打卡记录，使用北京时间
  const { data, error } = await supabase
    .from('daily_checkins')
    .insert({
      user_id: user.id,
      checkin_date: checkinDate,
      mood_score: moodScore,
      note,
      photo_url: photoUrl,
      created_at: getBeijingTimeISO(),
      updated_at: getBeijingTimeISO()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`打卡失败: ${error.message}`);
  }

  // 获取用户资料用于通知
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // 异步调用通知管理员的Edge Function
  try {
    await supabase.functions.invoke('notify-admin-checkin', {
      body: {
        user_id: user.id,
        user_name: profile?.full_name || '未知用户',
        checkin_date: checkinDate,
        mood_score: moodScore
      }
    });
  } catch (notifyError) {
    console.error('通知管理员失败:', notifyError);
    // 不影响打卡成功，只是通知失败
  }

  return data;
};

export const getTodayCheckin = async (): Promise<DailyCheckin | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const today = getBeijingDateString();

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error) {
    console.error('获取今日打卡记录失败:', error);
    return null;
  }

  return data;
};

export const getRecentCheckins = async (limit: number = 10): Promise<DailyCheckin[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('checkin_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取打卡记录失败:', error);
    return [];
  }

  return data || [];
};

export const getCheckinsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<DailyCheckin[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .gte('checkin_date', startDate)
    .lte('checkin_date', endDate)
    .order('checkin_date', { ascending: false });

  if (error) {
    console.error('获取时间范围内打卡记录失败:', error);
    return [];
  }

  return data || [];
};

export const getCheckinHistory = async (limit: number = 30): Promise<DailyCheckin[]> => {
  return getRecentCheckins(limit);
};
