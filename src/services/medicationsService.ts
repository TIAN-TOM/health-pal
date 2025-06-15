
import { supabase } from '@/integrations/supabase/client';

export interface Medication {
  id?: string;
  name: string;
  frequency: string;
}

export const saveMedication = async (medication: Omit<Medication, 'id'>) => {
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
