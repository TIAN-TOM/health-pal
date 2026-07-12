import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  id?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthday?: string; // YYYY-MM-DD
  height?: number;
  weight?: number;
  medical_history?: string[];
  allergies?: string[];
  family_medical_history?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  last_birthday_wish_year?: number;
  preferred_weather_city?: string;
  preferred_weather_city2?: string;
}

// 读取当前用户偏好设置；无用户或无记录时返回 null（用 maybeSingle 避免 0 行报错）
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    gender: data.gender as UserPreferences['gender'],
    birthday: data.birthday ?? undefined,
    height: data.height ?? undefined,
    weight: data.weight ?? undefined,
    medical_history: data.medical_history ?? undefined,
    allergies: data.allergies ?? undefined,
    family_medical_history: data.family_medical_history ?? undefined,
    emergency_contact_name: data.emergency_contact_name ?? undefined,
    emergency_contact_phone: data.emergency_contact_phone ?? undefined,
    last_birthday_wish_year: data.last_birthday_wish_year ?? undefined,
    preferred_weather_city: data.preferred_weather_city ?? undefined,
    preferred_weather_city2: data.preferred_weather_city2 ?? undefined,
  };
};

// upsert 当前用户偏好：存在则 update，否则 insert（不在此处 toast，交由调用方的 mutation 处理）
export const saveUserPreferences = async (prefs: UserPreferences): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('用户未登录');

  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const result = existing
    ? await supabase.from('user_preferences').update(prefs).eq('user_id', user.id)
    : await supabase.from('user_preferences').insert({ user_id: user.id, ...prefs });

  if (result.error) throw result.error;
};

// 更新 profiles.full_name（个人资料页保存姓名用）
export const updateProfileName = async (fullName: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('用户未登录');

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id);

  if (error) throw error;
};
