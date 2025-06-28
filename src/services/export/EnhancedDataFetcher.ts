
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
  userProfile?: any;
  medications?: any[];
}

export const getRecordsByDateRange = async (startDate: Date, endDate: Date): Promise<ExportData> => {
  try {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log('获取数据范围:', startDateStr, '到', endDateStr);
    
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
      userMedications,
      userProfile
    ] = await Promise.all([
      getMeniereRecords(startDateStr, endDateStr),
      getDailyCheckins(startDateStr, endDateStr),
      getDiabetesRecords(startDateStr, endDateStr),
      getEmergencyContacts(),
      getMedicalRecords(startDateStr, endDateStr),
      getUserMedications(),
      getUserProfile()
    ]);

    return {
      meniereRecords: meniereRecords || [],
      dailyCheckins: dailyCheckins || [],
      diabetesRecords: diabetesRecords || [],
      emergencyContacts: emergencyContacts || [],
      medicalRecords: medicalRecords || [],
      userMedications: userMedications || [],
      userProfile: userProfile,
      medications: userMedications || []
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

// 获取用户个人资料
const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('获取用户资料失败:', error);
  }
  
  return data;
};
