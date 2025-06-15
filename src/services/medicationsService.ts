
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// 使用数据库表类型
export type Medication = Tables<'user_medications'>;

export const saveMedication = async (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('用户未登录');

  const { data, error } = await supabase
    .from('user_medications')
    .insert({
      user_id: user.id,
      name: medication.name,
      frequency: medication.frequency
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMedications = async (): Promise<Medication[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_medications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const deleteMedication = async (id: string) => {
  const { error } = await supabase
    .from('user_medications')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// 添加别名函数以匹配 Settings 组件中的调用
export const getUserMedications = getMedications;
