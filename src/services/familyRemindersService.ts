import { supabase } from '@/integrations/supabase/client';
import { getBeijingDateString, getBeijingTime } from '@/utils/beijingTime';

export interface FamilyReminder {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  reminder_date: string;
  assigned_to?: string | null;
  is_completed: boolean;
  is_recurring: boolean;
  recurring_pattern?: string | null;
  created_at: string;
  updated_at: string;
}

// 注意：supabase-js 的 insert/update 会忽略值为 undefined 的字段，
// 需要清空数据库列时（如取消重复后清除 recurring_pattern）必须显式传入 null
export type FamilyReminderInput = Omit<FamilyReminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type FamilyReminderUpdate = Partial<FamilyReminderInput>;

export const familyRemindersService = {
  // 获取提醒事项
  async getFamilyReminders(): Promise<FamilyReminder[]> {
    const { data, error } = await supabase
      .from('family_reminders')
      .select('*')
      .order('reminder_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取家庭提醒失败:', error);
      throw error;
    }

    return data || [];
  },

  // 获取今日待办（按北京日界，避免 UTC 日期在北京 00:00-08:00 差一天）
  async getTodayReminders(): Promise<FamilyReminder[]> {
    const today = getBeijingDateString();
    const tomorrow = getBeijingDateString(new Date(getBeijingTime().getTime() + 24 * 60 * 60 * 1000));

    const { data, error } = await supabase
      .from('family_reminders')
      .select('*')
      .gte('reminder_date', today)
      .lt('reminder_date', tomorrow)
      .eq('is_completed', false)
      .order('reminder_date', { ascending: true });

    if (error) {
      console.error('获取今日待办失败:', error);
      throw error;
    }

    return data || [];
  },

  // 添加提醒事项
  async addFamilyReminder(reminder: FamilyReminderInput): Promise<FamilyReminder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('family_reminders')
      .insert([{ ...reminder, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('添加家庭提醒失败:', error);
      throw error;
    }

    return data;
  },

  // 更新提醒事项
  async updateFamilyReminder(id: string, updates: FamilyReminderUpdate): Promise<FamilyReminder> {
    const { data, error } = await supabase
      .from('family_reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新家庭提醒失败:', error);
      throw error;
    }

    return data;
  },

  // 切换完成状态
  async toggleReminderComplete(id: string, isCompleted: boolean): Promise<FamilyReminder> {
    return this.updateFamilyReminder(id, { is_completed: isCompleted });
  },

  // 删除提醒事项
  async deleteFamilyReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('family_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除家庭提醒失败:', error);
      throw error;
    }
  },

  // 获取未完成提醒数量
  async getIncompleteCount(): Promise<number> {
    const { count, error } = await supabase
      .from('family_reminders')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', false);

    if (error) {
      console.error('获取未完成提醒数量失败:', error);
      return 0;
    }

    return count || 0;
  }
};

export const RECURRING_PATTERNS = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' }
];