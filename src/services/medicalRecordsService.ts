
import { supabase } from '@/integrations/supabase/client';
import { notifyAdminActivity, ACTIVITY_TYPES, MODULE_NAMES } from '@/services/adminNotificationService';

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
  
  // 通知管理员
  await notifyAdminActivity({
    activity_type: ACTIVITY_TYPES.CREATE,
    activity_description: `创建了新的${record.record_type === 'visit' ? '就诊' : record.record_type === 'diagnosis' ? '诊断' : '处方'}记录`,
    module_name: MODULE_NAMES.MEDICAL_RECORDS
  });
  
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
  return (data || []) as MedicalRecord[];
};

export const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>) => {
  const { data, error } = await supabase
    .from('medical_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // 通知管理员
  await notifyAdminActivity({
    activity_type: ACTIVITY_TYPES.UPDATE,
    activity_description: '更新了医疗记录',
    module_name: MODULE_NAMES.MEDICAL_RECORDS
  });
  
  return data;
};

export const deleteMedicalRecord = async (id: string) => {
  const { error } = await supabase
    .from('medical_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  // 通知管理员
  await notifyAdminActivity({
    activity_type: ACTIVITY_TYPES.DELETE,
    activity_description: '删除了医疗记录',
    module_name: MODULE_NAMES.MEDICAL_RECORDS
  });
};
