import { supabase } from '@/integrations/supabase/client';

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  photo_url?: string;
  mood_score?: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export const getTodayCheckin = async (): Promise<DailyCheckin | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('checkin_date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createCheckin = async (photoFile: File, moodScore: number, note?: string) => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('用户未登录');

  const today = new Date().toISOString().split('T')[0];

  // 创建打卡记录，不再需要照片
  const { data, error } = await supabase
    .from('daily_checkins')
    .insert({
      user_id: user.data.user.id,
      checkin_date: today,
      mood_score: moodScore,
      note: note
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCheckinHistory = async (days: number = 7) => {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .order('checkin_date', { ascending: false })
    .limit(days);

  if (error) throw error;
  return data;
};

export const getRecentCheckins = async (limit: number = 5) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('checkin_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};
