
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
  const fileName = `${user.data.user.id}/${today}-${Date.now()}.jpg`;

  // 上传照片
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('checkin-photos')
    .upload(fileName, photoFile);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('checkin-photos')
    .getPublicUrl(fileName);

  // 创建打卡记录
  const { data, error } = await supabase
    .from('daily_checkins')
    .insert({
      user_id: user.data.user.id,
      checkin_date: today,
      photo_url: urlData.publicUrl,
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
