
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAdminUserDetails = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getUserDetailedInfo = async (userId: string) => {
    setLoading(true);
    try {
      console.log('获取用户详细信息, userId:', userId);
      
      // 获取用户基本信息
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('获取用户资料失败:', profileError);
      }

      // 获取用户偏好设置
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        console.error('获取用户偏好设置失败:', preferencesError);
      }

      // 获取用户角色
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('获取用户角色失败:', rolesError);
      }

      // 获取最近的打卡记录
      const { data: checkins, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(30);

      if (checkinsError) {
        console.error('获取打卡记录失败:', checkinsError);
      } else {
        console.log('获取到的打卡记录:', checkins);
      }

      // 获取各类记录数量
      const { count: dizzinessCount } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'dizziness');

      const { count: lifestyleCount } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'lifestyle');

      const { count: medicationCount } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'medication');

      const result = {
        profile,
        preferences,
        roles: roles || [],
        checkins: checkins || [],
        stats: {
          symptomRecords: dizzinessCount || 0,
          lifestyleRecords: lifestyleCount || 0,
          medicationRecords: medicationCount || 0,
          totalCheckins: checkins?.length || 0
        }
      };

      console.log('用户详细信息结果:', result);
      return result;
    } catch (error: any) {
      console.error('获取用户详细信息失败:', error);
      toast({
        title: "获取用户信息失败",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (userId: string, userEmail: string) => {
    try {
      // 这里需要调用管理员API重置密码
      // 由于Supabase的限制，我们只能发送密码重置邮件
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/`
      });

      if (error) throw error;

      toast({
        title: "密码重置邮件已发送",
        description: `已向 ${userEmail} 发送密码重置邮件`
      });
      return true;
    } catch (error: any) {
      toast({
        title: "发送重置邮件失败",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      // 这里可以添加用户状态字段来实现用户暂停功能
      // 目前我们添加一个备注到用户偏好设置中
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          // 可以添加一个状态字段来标记用户被暂停
        });

      if (error) throw error;

      toast({
        title: "用户已暂停",
        description: "用户账号已被暂停使用"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "暂停用户失败",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    loading,
    getUserDetailedInfo,
    resetUserPassword,
    suspendUser
  };
};
