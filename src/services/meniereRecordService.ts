
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export interface MeniereRecord {
  id?: string;
  type: 'dizziness' | 'lifestyle' | 'medication' | 'voice';
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

// 获取北京时间的ISO字符串
const getBeijingTimeISO = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const beijingTime = new Date(utc + (8 * 3600000));
  return beijingTime.toISOString();
};

// Generic function to save any type of Meniere record
export const saveMeniereRecord = async (record: MeniereRecord) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

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
      timestamp: getBeijingTimeISO(), // 使用北京时间
      created_at: getBeijingTimeISO(),
      updated_at: getBeijingTimeISO()
    });

  if (error) throw error;
  return data;
};

export const saveDizzinessRecord = async (record: {
  duration: string;
  severity: string;
  symptoms: string[];
}) => {
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'dizziness',
      duration: record.duration,
      severity: record.severity,
      symptoms: record.symptoms,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!,
      timestamp: getBeijingTimeISO(),
      created_at: getBeijingTimeISO(),
      updated_at: getBeijingTimeISO()
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
      timestamp: getBeijingTimeISO(),
      created_at: getBeijingTimeISO(),
      updated_at: getBeijingTimeISO()
    });

  if (error) throw error;
  return data;
};

export const saveMedicationRecord = async (record: {
  medications: string[];
  dosage: string;
  manualInput?: string;
}) => {
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'medication',
      medications: record.medications,
      dosage: record.dosage,
      note: record.manualInput,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!,
      timestamp: getBeijingTimeISO(),
      created_at: getBeijingTimeISO(),
      updated_at: getBeijingTimeISO()
    });

  if (error) throw error;
  return data;
};

export const saveVoiceRecord = async (record: {
  note: string;
  duration?: number;
}) => {
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'voice',
      note: record.note,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!,
      timestamp: getBeijingTimeISO(),
      created_at: getBeijingTimeISO(),
      updated_at: getBeijingTimeISO()
    });

  if (error) throw error;
  return data;
};

export const getRecentRecords = async (limit: number = 5) => {
  const { data, error } = await supabase
    .from('meniere_records')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getRecordsForPeriod = async (days: number) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('meniere_records')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data;
};
