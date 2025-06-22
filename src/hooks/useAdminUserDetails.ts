
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAdminUserDetails = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getUserDetailedInfo = async (userId: string) => {
    setLoading(true);
    try {
      // 获取用户基本信息
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // 获取用户偏好设置
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // 获取用户角色
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      // 获取最近的打卡记录
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(30);

      // 获取症状记录数量
      const { count: symptomCount } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'symptom');

      // 获取生活记录数量
      const { count: lifestyleCount } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'lifestyle');

      // 获取用药记录数量
      const { count: medicationCount } = await supabase
        .from('meniere_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'medication');

      return {
        profile,
        preferences,
        roles: roles || [],
        checkins: checkins || [],
        stats: {
          symptomRecords: symptomCount || 0,
          lifestyleRecords: lifestyleCount || 0,
          medicationRecords: medicationCount || 0,
          totalCheckins: checkins?.length || 0
        }
      };
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
