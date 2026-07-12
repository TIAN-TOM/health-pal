import { supabase } from '@/integrations/supabase/client';
import { getBeijingTimeISO } from '@/utils/beijingTime';
import type { Tables } from '@/integrations/supabase/types';

export type Announcement = Tables<'announcements'>;

export interface AnnouncementInput {
  title: string;
  content: string;
  is_active: boolean;
}

// 首页展示：仅取生效中的公告，最多 3 条
export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw error;
  return data || [];
};

// 管理后台：全部公告（含已停用）
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createAnnouncement = async (input: AnnouncementInput): Promise<Announcement> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('用户未登录');

  const nowISO = getBeijingTimeISO();
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title: input.title,
      content: input.content,
      is_active: input.is_active,
      author_id: user.id,
      created_at: nowISO,
      updated_at: nowISO,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAnnouncement = async (id: string, patch: AnnouncementInput): Promise<void> => {
  const { error } = await supabase
    .from('announcements')
    .update({ ...patch, updated_at: getBeijingTimeISO() })
    .eq('id', id);

  if (error) throw error;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
};

// 切换发布状态，caller 传入目标状态（!currentStatus）
export const setAnnouncementActive = async (id: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('announcements')
    .update({ is_active: isActive, updated_at: getBeijingTimeISO() })
    .eq('id', id);

  if (error) throw error;
};
