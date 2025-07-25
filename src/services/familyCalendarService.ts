import { supabase } from '@/integrations/supabase/client';

export interface FamilyCalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  participants?: string[];
  color: string;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export const familyCalendarService = {
  // 获取日历事件
  async getFamilyCalendarEvents(startDate?: string, endDate?: string): Promise<FamilyCalendarEvent[]> {
    let query = supabase
      .from('family_calendar_events')
      .select('*')
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('event_date', startDate);
    }
    if (endDate) {
      query = query.lte('event_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取家庭日历事件失败:', error);
      throw error;
    }

    return data || [];
  },

  // 获取当月事件
  async getMonthEvents(year: number, month: number): Promise<FamilyCalendarEvent[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    return this.getFamilyCalendarEvents(startDate, endDate);
  },

  // 获取今日事件
  async getTodayEvents(): Promise<FamilyCalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getFamilyCalendarEvents(today, today);
  },

  // 添加日历事件
  async addFamilyCalendarEvent(event: Omit<FamilyCalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FamilyCalendarEvent> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('family_calendar_events')
      .insert([{ ...event, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('添加家庭日历事件失败:', error);
      throw error;
    }

    return data;
  },

  // 更新日历事件
  async updateFamilyCalendarEvent(id: string, updates: Partial<FamilyCalendarEvent>): Promise<FamilyCalendarEvent> {
    const { data, error } = await supabase
      .from('family_calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新家庭日历事件失败:', error);
      throw error;
    }

    return data;
  },

  // 删除日历事件
  async deleteFamilyCalendarEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('family_calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除家庭日历事件失败:', error);
      throw error;
    }
  }
};

export const EVENT_COLORS = [
  '#3B82F6', // 蓝色
  '#EF4444', // 红色
  '#10B981', // 绿色
  '#F59E0B', // 黄色
  '#8B5CF6', // 紫色
  '#F97316', // 橙色
  '#06B6D4', // 青色
  '#84CC16', // 绿黄色
];

// 中国传统节日
export const TRADITIONAL_FESTIVALS = [
  { date: '01-01', name: '元旦' },
  { date: '02-14', name: '情人节' },
  { date: '03-08', name: '妇女节' },
  { date: '04-01', name: '愚人节' },
  { date: '05-01', name: '劳动节' },
  { date: '05-04', name: '青年节' },
  { date: '06-01', name: '儿童节' },
  { date: '10-01', name: '国庆节' },
  { date: '12-25', name: '圣诞节' },
];