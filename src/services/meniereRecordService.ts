
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { getBeijingTimeISO } from '@/utils/beijingTime';

export interface MeniereRecord {
  id?: string;
  type: 'dizziness' | 'lifestyle' | 'medication' | 'voice' | 'checkin' | 'medical';
  timestamp?: string;
  data?: any;
  note?: string;
  severity?: string;
  duration?: string;
  symptoms?: string[];
  diet?: string[];
  sleep?: string;
  stress?: string;
  medications?: string[];
  dosage?: string;
}

// Generic function to save any type of Meniere record
export const saveMeniereRecord = async (record: MeniereRecord) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const beijingTime = getBeijingTimeISO();
  console.log('保存梅尼埃记录，使用北京时间:', beijingTime);

  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: record.type,
      duration: record.duration,
      severity: record.severity,
      symptoms: record.symptoms,
      diet: record.diet,
      sleep: record.sleep,
      stress: record.stress,
      medications: record.medications,
      dosage: record.dosage,
      note: record.note,
      data: record.data,
      user_id: user.id,
      timestamp: beijingTime,
      created_at: beijingTime,
      updated_at: beijingTime
    });

  if (error) throw error;
  return data;
};

export const saveDizzinessRecord = async (record: {
  duration: string;
  severity: string;
  symptoms: string[];
}) => {
  const beijingTime = getBeijingTimeISO();
  
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'dizziness',
      duration: record.duration,
      severity: record.severity,
      symptoms: record.symptoms,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!,
      timestamp: beijingTime,
      created_at: beijingTime,
      updated_at: beijingTime
    });

  if (error) throw error;
  return data;
};

export const saveLifestyleRecord = async (record: {
  diet: string[];
  sleep: string;
  stress: string;
  manualInput?: string;
}) => {
  const beijingTime = getBeijingTimeISO();
  
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'lifestyle',
      diet: record.diet,
      sleep: record.sleep,
      stress: record.stress,
      note: record.manualInput,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!,
      timestamp: beijingTime,
      created_at: beijingTime,
      updated_at: beijingTime
    });

  if (error) throw error;
  return data;
};

export const saveMedicationRecord = async (record: {
  medications: string[];
  dosage: string;
  manualInput?: string;
}) => {
  const beijingTime = getBeijingTimeISO();
  
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'medication',
      medications: record.medications,
      dosage: record.dosage,
      note: record.manualInput,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!,
      timestamp: beijingTime,
      created_at: beijingTime,
      updated_at: beijingTime
    });

  if (error) throw error;
  return data;
};

export const saveVoiceRecord = async (record: {
  note: string;
  duration?: number;
}) => {
  const beijingTime = getBeijingTimeISO();
  
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'voice',
      note: record.note,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!,
      timestamp: beijingTime,
      created_at: beijingTime,
      updated_at: beijingTime
    });

  if (error) throw error;
  return data;
};

export const getRecentRecords = async (limit: number = 5) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('meniere_records')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getRecordsForPeriod = async (days: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('meniere_records')
    .select('*')
    .eq('user_id', user.id)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data;
};

export const getMeniereRecords = async (startDate?: string, endDate?: string): Promise<MeniereRecord[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    let query = supabase
      .from('meniere_records')
      .select('*')
      .eq('user_id', user.id);

    if (startDate && endDate) {
      query = query.gte('timestamp', startDate + 'T00:00:00.000Z')
                  .lte('timestamp', endDate + 'T23:59:59.999Z');
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;

    // 转换数据库记录为 MeniereRecord 格式
    return (data || []).map(record => ({
      id: record.id,
      type: record.type as 'dizziness' | 'lifestyle' | 'medication' | 'voice',
      timestamp: record.timestamp,
      data: record.data,
      note: record.note,
      severity: record.severity,
      duration: record.duration,
      symptoms: record.symptoms,
      diet: record.diet,
      sleep: record.sleep,
      stress: record.stress,
      medications: record.medications,
      dosage: record.dosage,
    }));
  } catch (error) {
    console.error('获取梅尼埃记录失败:', error);
    throw error;
  }
};
