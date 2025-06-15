
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
      user_id: (await supabase.auth.getUser()).data.user?.id!
    });

  if (error) throw error;
  return data;
};

export const saveLifestyleRecord = async (record: {
  diet: string[];
  sleep: string;
  stress: string;
}) => {
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'lifestyle',
      diet: record.diet,
      sleep: record.sleep,
      stress: record.stress,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!
    });

  if (error) throw error;
  return data;
};

export const saveMedicationRecord = async (record: {
  medications: string[];
  dosage: string;
}) => {
  const { data, error } = await supabase
    .from('meniere_records')
    .insert({
      type: 'medication',
      medications: record.medications,
      dosage: record.dosage,
      data: record,
      user_id: (await supabase.auth.getUser()).data.user?.id!
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
      user_id: (await supabase.auth.getUser()).data.user?.id!
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
