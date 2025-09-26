
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

      // 获取最近的打卡记录 - 管理员可以查看所有用户的记录
      const { data: checkins, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('id, user_id, checkin_date, mood_score, note, created_at, updated_at, photo_url')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(30);

      console.log('正在获取用户打卡记录, userId:', userId);
      if (checkinsError) {
        console.error('获取打卡记录失败:', checkinsError);
        // 显示具体错误信息给管理员
        toast({
          title: "获取打卡记录失败",
          description: `错误详情: ${checkinsError.message}`,
          variant: "destructive"
        });
      } else {
        console.log('成功获取打卡记录数量:', checkins?.length);
        console.log('打卡记录详情:', checkins);
        
        // 如果有记录，检查是否包含note字段
        if (checkins && checkins.length > 0) {
          const recordsWithNotes = checkins.filter(c => c.note && c.note.trim());
          console.log('包含今日感想的记录数:', recordsWithNotes.length);
        }
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
      console.log('开始暂停用户, userId:', userId);
      
      // 更新用户状态为暂停
      const { data, error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('暂停用户数据库操作失败:', error);
        throw error;
      }

      console.log('暂停用户成功，更新结果:', data);

      toast({
        title: "用户已暂停",
        description: "用户账号已被暂停使用，用户将无法登录系统"
      });
      return true;
    } catch (error: any) {
      console.error('暂停用户失败:', error);
      toast({
        title: "暂停用户失败",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const reactivateUser = async (userId: string) => {
    try {
      console.log('开始恢复用户, userId:', userId);
      
      // 恢复用户状态为正常
      const { data, error } = await supabase
        .from('profiles')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('恢复用户数据库操作失败:', error);
        throw error;
      }

      console.log('恢复用户成功，更新结果:', data);

      toast({
        title: "用户已恢复",
        description: "用户账号已恢复正常，可以正常登录系统"
      });
      return true;
    } catch (error: any) {
      console.error('恢复用户失败:', error);
      toast({
        title: "恢复用户失败",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const sendEmailToUser = async (userEmail: string, subject: string, message: string, adminId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-send-email', {
        body: {
          userEmail,
          subject,
          message,
          adminId
        }
      });

      if (error) throw error;

      toast({
        title: "邮件发送成功",
        description: `已向 ${userEmail} 发送邮件`
      });
      return true;
    } catch (error: any) {
      toast({
        title: "发送邮件失败",
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
    suspendUser,
    reactivateUser,
    sendEmailToUser
  };
};
