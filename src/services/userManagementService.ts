import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
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

// 删除用户：走 admin-delete-user 边缘函数做服务端级联删除（21+ 张业务表 + 存储桶 + auth 账号）。
// 客户端只删 user_roles/profiles 会让 auth 账号与全部健康数据变成孤儿数据，故改为服务端执行。
export const deleteUserAccount = async (userId: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId },
  });

  if (error) {
    // functions.invoke 对非 2xx 会抛 FunctionsHttpError，真正的中文错误在响应体里，需读取透传。
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        if (body?.error) message = body.error;
      } catch {
        // 响应体不可解析时用默认 message
      }
    }
    throw new Error(message);
  }
  if (data && data.success === false) {
    throw new Error(data.error || '删除用户失败');
  }
};
