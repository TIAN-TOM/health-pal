
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'user';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  auth_id: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCheckins, setUserCheckins] = useState<{ [userId: string]: any[] }>({});
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('开始加载用户...');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('获取用户资料失败:', profilesError);
        throw profilesError;
      }

      console.log('获取到的用户资料:', profilesData);

      if (!profilesData || profilesData.length === 0) {
        console.log('没有找到用户资料');
        setUsers([]);
        return;
      }

      const userIds = profilesData.map(profile => profile.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (rolesError) {
        console.error('获取用户角色失败:', rolesError);
        throw rolesError;
      }

      console.log('获取到的用户角色:', rolesData);

      const rolesMap = new Map();
      rolesData?.forEach(role => {
        rolesMap.set(role.user_id, role.role);
      });

      const usersWithProfile = profilesData.map(profile => ({
        ...profile,
        auth_id: profile.id,
        email: profile.email || 'N/A',
        full_name: profile.full_name || '未设置',
        role: (rolesMap.get(profile.id) || 'user') as UserRole,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }));

      console.log('最终用户数据:', usersWithProfile);
      setUsers(usersWithProfile);
      
      toast({
        title: "用户加载成功",
        description: `成功加载 ${usersWithProfile.length} 个用户`
      });
    } catch (error: any) {
      console.error('加载用户失败:', error);
      toast({
        title: "加载用户失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserCheckins = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setUserCheckins(prev => ({ ...prev, [userId]: data || [] }));
    } catch (error: any) {
      console.error('加载用户打卡记录失败:', error);
      toast({
        title: "加载打卡记录失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole as UserRole
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      const user = users.find(u => u.id === userId);
      toast({
        title: "角色更新成功",
        description: `用户 ${user?.email} 的角色已更新为 ${newRole}`
      });

      return true;
    } catch (error: any) {
      toast({
        title: "角色更新失败",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));

      const user = users.find(u => u.id === userId);
      toast({
        title: "删除用户成功",
        description: `用户 ${user?.email} 已被删除`
      });

      return true;
    } catch (error: any) {
      toast({
        title: "删除用户失败",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    userCheckins,
    loadUsers,
    loadUserCheckins,
    updateUserRole,
    deleteUser
  };
};
