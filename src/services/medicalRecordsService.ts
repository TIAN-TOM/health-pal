
import { supabase } from '@/integrations/supabase/client';

export interface MedicalRecord {
  id?: string;
  record_type: 'visit' | 'diagnosis' | 'prescription';
  date: string;
  hospital?: string;
  doctor?: string;
  department?: string;
  diagnosis?: string;
  symptoms?: string;
  prescribed_medications?: string[];
  notes?: string;
  next_appointment?: string;
}

export const saveMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('用户未登录');

  const { data, error } = await supabase
    .from('medical_records')
    .insert({
      user_id: user.id,
      ...record
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>) => {
  const { data, error } = await supabase
    .from('medical_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMedicalRecord = async (id: string) => {
  const { error } = await supabase
    .from('medical_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
