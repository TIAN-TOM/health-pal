
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type VoiceRecord = Tables<'voice_records'>;
type VoiceRecordInsert = TablesInsert<'voice_records'>;

export const createVoiceRecord = async (data: Omit<VoiceRecordInsert, 'user_id'>): Promise<VoiceRecord> => {
  const { data: record, error } = await supabase
    .from('voice_records')
    .insert({
      ...data,
      user_id: (await supabase.auth.getUser()).data.user?.id!
    })
    .select()
    .single();

  if (error) {
    console.error('创建语音记录失败:', error);
    throw error;
  }

  return record;
};

export const updateVoiceRecord = async (id: string, updates: Partial<VoiceRecord>): Promise<VoiceRecord> => {
  const { data: record, error } = await supabase
    .from('voice_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('更新语音记录失败:', error);
    throw error;
  }

  return record;
};

export const getUserVoiceRecords = async (): Promise<VoiceRecord[]> => {
  const { data: records, error } = await supabase
    .from('voice_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取语音记录失败:', error);
    throw error;
  }

  return records || [];
};

export const deleteVoiceRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('voice_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除语音记录失败:', error);
    throw error;
  }
};

export const uploadVoiceFile = async (audioBlob: Blob, fileName: string): Promise<string> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('用户未登录');

  const filePath = `${user.id}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('voice-records')
    .upload(filePath, audioBlob, {
      contentType: 'audio/webm',
      upsert: false
    });

  if (error) {
    console.error('上传语音文件失败:', error);
    throw error;
  }

  return data.path;
};

export const getVoiceFileUrl = async (filePath: string): Promise<string> => {
  const { data } = await supabase.storage
    .from('voice-records')
    .createSignedUrl(filePath, 60 * 60); // 1小时有效期

  if (!data?.signedUrl) {
    throw new Error('获取语音文件URL失败');
  }

  return data.signedUrl;
};

export const deleteVoiceFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('voice-records')
    .remove([filePath]);

  if (error) {
    console.error('删除语音文件失败:', error);
    throw error;
  }
};
