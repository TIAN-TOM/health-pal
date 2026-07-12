import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type UserRole = 'admin' | 'user';

export interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  auth_id: string;
}

export type UserCheckin = Tables<'daily_checkins'>;

// 加载所有用户资料并合并角色（profiles + user_roles 两表 join）
export const getUsersWithRoles = async (): Promise<UserWithProfile[]> => {
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError) throw profilesError;
  if (!profilesData || profilesData.length === 0) return [];

  const userIds = profilesData.map((profile) => profile.id);
  const { data: rolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .in('user_id', userIds);

  if (rolesError) throw rolesError;

  const rolesMap = new Map<string, UserRole>();
  rolesData?.forEach((role) => {
    rolesMap.set(role.user_id, role.role as UserRole);
  });

  return profilesData.map((profile) => ({
    ...profile,
    auth_id: profile.id,
    email: profile.email || 'N/A',
    full_name: profile.full_name || '未设置',
    role: (rolesMap.get(profile.id) || 'user') as UserRole,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }));
};

// 按需加载单个用户的近 30 条打卡记录
export const getUserCheckins = async (userId: string): Promise<UserCheckin[]> => {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data || [];
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

  if (error) throw error;
};

// 删除用户：先删角色再删档案，任一步失败即中止，避免留下不一致数据
export const deleteUserAccount = async (userId: string): Promise<void> => {
  const { error: rolesError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  if (rolesError) throw new Error(`删除用户角色失败: ${rolesError.message}`);

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw new Error(`删除用户档案失败: ${profileError.message}`);
};
