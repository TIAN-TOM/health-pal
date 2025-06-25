
import { supabase } from '@/integrations/supabase/client';
import { getMeniereRecords } from '@/services/meniereRecordService';
import { getDailyCheckins } from '@/services/dailyCheckinService';
import { getDiabetesRecords } from '@/services/diabetesRecordService';

export interface ExportData {
  meniereRecords: any[];
  dailyCheckins: any[];
  diabetesRecords: any[];
  emergencyContacts: any[];
  medicalRecords: any[];
  userMedications: any[];
}

export const getRecordsByDateRange = async (startDate: string, endDate: string): Promise<ExportData> => {
  try {
    console.log('获取数据范围:', startDate, '到', endDate);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    // 并行获取所有数据
    const [
      meniereRecords,
      dailyCheckins,
      diabetesRecords,
      emergencyContacts,
      medicalRecords,
      userMedications
    ] = await Promise.all([
      getMeniereRecords(startDate, endDate),
      getDailyCheckins(startDate, endDate),
      getDiabetesRecords(startDate, endDate),
      getEmergencyContacts(),
      getMedicalRecords(startDate, endDate),
      getUserMedications()
    ]);

    return {
      meniereRecords: meniereRecords || [],
      dailyCheckins: dailyCheckins || [],
      diabetesRecords: diabetesRecords || [],
      emergencyContacts: emergencyContacts || [],
      medicalRecords: medicalRecords || [],
      userMedications: userMedications || []
    };
  } catch (error) {
    console.error('获取导出数据失败:', error);
    throw error;
  }
};

// 获取紧急联系人
const getEmergencyContacts = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// 获取医疗记录
const getMedicalRecords = async (startDate?: string, endDate?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', user.id);

  if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

// 获取用户药物
const getUserMedications = async () => {
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
