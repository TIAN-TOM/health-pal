import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface UserDetailedInfo {
  profile: Tables<'profiles'> | null;
  // 偏好字段（如 medical_history）在详情视图里按可空数组松散访问，用 any 匹配既有渲染
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences: any;
  roles: Tables<'user_roles'>[];
  checkins: Pick<
    Tables<'daily_checkins'>,
    'id' | 'user_id' | 'checkin_date' | 'mood_score' | 'note' | 'created_at' | 'updated_at' | 'photo_url'
  >[];
  stats: {
    symptomRecords: number;
    lifestyleRecords: number;
    medicationRecords: number;
    totalCheckins: number;
  };
}

// 管理员查看用户详情：聚合资料、偏好、角色、打卡与各类记录计数。
// 打卡是主数据，读取失败即 throw 让 useQuery 进入 isError；资料/偏好/角色缺失只回退为空，不阻断整体。
export const getUserDetailedInfo = async (userId: string): Promise<UserDetailedInfo> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  const { data: checkins, error: checkinsError } = await supabase
    .from('daily_checkins')
    .select('id, user_id, checkin_date, mood_score, note, created_at, updated_at, photo_url')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(30);

  if (checkinsError) throw checkinsError;

  const [dizziness, lifestyle, medication] = await Promise.all([
    supabase.from('meniere_records').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'dizziness'),
    supabase.from('meniere_records').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'lifestyle'),
    supabase.from('meniere_records').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'medication'),
  ]);

  return {
    profile: profile ?? null,
    preferences: preferences ?? null,
    roles: roles || [],
    checkins: checkins || [],
    stats: {
      symptomRecords: dizziness.count || 0,
      lifestyleRecords: lifestyle.count || 0,
      medicationRecords: medication.count || 0,
      totalCheckins: checkins?.length || 0,
    },
  };
};

export const suspendUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
};

export const reactivateUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
};

// 受 Supabase 限制，只能发送密码重置邮件
export const resetUserPassword = async (userEmail: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
    redirectTo: `${window.location.origin}/`,
  });

  if (error) throw error;
};

// adminId 由 edge function 从已验证 JWT 派生，不再从客户端传入
export const sendEmailToUser = async (userEmail: string, subject: string, message: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('admin-send-email', {
    body: { userEmail, subject, message },
  });

  if (error) throw error;
};
