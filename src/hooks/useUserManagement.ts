import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getUsersWithRoles,
  getUserCheckins,
  updateUserRole as updateUserRoleService,
  deleteUserAccount,
  type UserRole,
  type UserCheckin,
} from '@/services/userManagementService';

export const useUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // 按需加载的单用户打卡缓存，保留原有惰性加载语义
  const [userCheckins, setUserCheckins] = useState<{ [userId: string]: UserCheckin[] }>({});

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUsersWithRoles,
  });

  const loadUserCheckins = async (userId: string, forceRefresh = false): Promise<UserCheckin[]> => {
    if (!forceRefresh && userCheckins[userId]) {
      return userCheckins[userId];
    }
    try {
      const data = await getUserCheckins(userId);
      setUserCheckins((prev) => ({ ...prev, [userId]: data }));
      return data;
    } catch (error) {
      console.error('加载用户打卡记录失败:', error);
      toast({
        title: '加载打卡记录失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
      return [];
    }
  };

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRoleService(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      const user = usersQuery.data?.find((u) => u.id === userId);
      toast({
        title: '角色更新成功',
        description: `用户 ${user?.email} 的角色已更新为 ${newRole}`,
      });
      return true;
    } catch (error) {
      toast({
        title: '角色更新失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMutation = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const user = usersQuery.data?.find((u) => u.id === userId);
      await deleteMutation.mutateAsync(userId);
      clearUserCache(userId);
      toast({
        title: '删除用户成功',
        description: `用户 ${user?.email} 已被删除`,
      });
      return true;
    } catch (error) {
      toast({
        title: '删除用户失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
      return false;
    }
  };

  const clearUserCache = (userId: string) => {
    setUserCheckins((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  return {
    users: usersQuery.data ?? [],
    loading: usersQuery.isPending || updateRoleMutation.isPending || deleteMutation.isPending,
    isError: usersQuery.isError,
    userCheckins,
    loadUsers: () => {
      void usersQuery.refetch();
    },
    refetch: usersQuery.refetch,
    loadUserCheckins,
    updateUserRole,
    deleteUser,
    clearUserCache,
  };
};
