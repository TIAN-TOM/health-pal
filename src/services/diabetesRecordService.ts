
import { supabase } from '@/integrations/supabase/client';
import { getBeijingTimeISO, beijingDayToUtcRange } from '@/utils/beijingTime';
import { notifyAdminActivity, ACTIVITY_TYPES, MODULE_NAMES } from '@/services/adminNotificationService';

export interface DiabetesRecord {
  id?: string;
  blood_sugar: number;
  measurement_time: string;
  insulin_dose?: string | null;
  medication?: string | null;
  diet?: string | null;
  exercise?: string | null;
  note?: string | null;
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
  
  // 通知管理员
  await notifyAdminActivity({
    activity_type: ACTIVITY_TYPES.CREATE,
    activity_description: `记录了血糖值 ${record.blood_sugar} ${record.measurement_time}`,
    module_name: MODULE_NAMES.DIABETES_RECORDS
  });
  
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
      // startDate/endDate 是北京日；timestamp 存真 UTC，按北京日窗口换算
      const { startUtc, endUtc } = beijingDayToUtcRange(startDate, endDate);
      query = query.gte('timestamp', startUtc).lte('timestamp', endUtc);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取糖尿病记录失败:', error);
    throw error;
  }
};
