import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from '@/services/profileService';

export type { UserPreferences };

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: getUserPreferences,
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: saveUserPreferences,
    onSuccess: (_data, variables) => {
      // 乐观写入缓存，避免保存后短暂闪回旧值；随后 invalidate 拉回真实行
      queryClient.setQueryData(['user-preferences', user?.id], variables);
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
      toast({ title: '保存成功', description: '您的偏好设置已更新' });
    },
    onError: (error) => {
      console.error('保存用户偏好设置失败:', error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    },
  });

  // 保留原有布尔返回契约，供调用方按成功与否分支
  const savePreferences = async (newPreferences: UserPreferences): Promise<boolean> => {
    if (!user) return false;
    try {
      await saveMutation.mutateAsync(newPreferences);
      return true;
    } catch {
      return false;
    }
  };

  return {
    preferences: preferencesQuery.data ?? null,
    loading: preferencesQuery.isPending,
    isError: preferencesQuery.isError,
    savePreferences,
    refreshPreferences: preferencesQuery.refetch,
    refetch: preferencesQuery.refetch,
  };
};
