import { supabase } from '@/integrations/supabase/client';

interface AdminNotificationData {
  activity_type: string;
  activity_description: string;
  module_name: string;
  additional_data?: any;
}

export const notifyAdminActivity = async (data: AdminNotificationData): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('无法获取当前用户信息，跳过管理员通知');
      return;
    }

    // user_id / user_name are derived server-side from the verified JWT.
    const { error } = await supabase.functions.invoke('notify-admin-activity', {
      body: {
        activity_type: data.activity_type,
        activity_description: data.activity_description,
        module_name: data.module_name,
      }
    });

    if (error) {
      console.error('发送管理员通知失败:', error);
    } else {
      console.log('管理员通知发送成功:', data.module_name, data.activity_type);
    }
  } catch (error) {
    console.error('管理员通知服务异常:', error);
  }
};

// 预定义的常用活动类型
export const ACTIVITY_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  UPLOAD: 'upload',
  PURCHASE: 'purchase',
  GAME: 'game_play',
  LEARNING: 'learning',
  EXPORT: 'export',
  MAKEUP_CHECKIN: 'makeup_checkin'
} as const;

// 预定义的模块名称
export const MODULE_NAMES = {
  MEDICAL_RECORDS: '医疗记录',
  DIABETES_RECORDS: '糖尿病记录',
  MENIERE_RECORDS: '美尼尔记录',
  VOICE_RECORDS: '语音记录',
  EMERGENCY_CONTACTS: '紧急联系人',
  POINTS_STORE: '积分商店',
  ENGLISH_LEARNING: '英语学习',
  GAMES: '解压游戏',
  DATA_EXPORT: '数据导出',
  USER_PREFERENCES: '用户设置',
  LIFESTYLE: '生活方式记录',
  CHECKIN: '每日打卡'
} as const;