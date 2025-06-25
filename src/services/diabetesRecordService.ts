
import { supabase } from '@/integrations/supabase/client';
import { getBeijingTimeISO } from '@/utils/beijingTime';

export interface DiabetesRecord {
  id?: string;
  blood_sugar: number;
  measurement_time: string;
  insulin_dose?: string;
  medication?: string;
  diet?: string;
  exercise?: string;
  note?: string;
  timestamp?: string;
}

export const saveDiabetesRecord = async (record: Omit<DiabetesRecord, 'id' | 'timestamp'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const beijingTime = getBeijingTimeISO();
  
  const { data, error } = await supabase
    .from('diabetes_records')
    .insert({
      user_id: user.id,
      blood_sugar: record.blood_sugar,
      measurement_time: record.measurement_time,
      insulin_dose: record.insulin_dose,
      medication: record.medication,
      diet: record.diet,
      exercise: record.exercise,
      note: record.note,
      timestamp: beijingTime,
      created_at: beijingTime,
      updated_at: beijingTime
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDiabetesRecords = async (startDate?: string, endDate?: string): Promise<DiabetesRecord[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    let query = supabase
      .from('diabetes_records')
      .select('*')
      .eq('user_id', user.id);

    if (startDate && endDate) {
      query = query.gte('timestamp', startDate + 'T00:00:00.000Z')
                  .lte('timestamp', endDate + 'T23:59:59.999Z');
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取糖尿病记录失败:', error);
    throw error;
  }
};
