
import { supabase } from '@/integrations/supabase/client';
import { getBeijingDateString, getCurrentBeijingTime } from '@/utils/beijingTime';
import type { MeniereRecord } from '@/services/meniereRecordService';

export const getRecordsByDateRange = async (startDate: Date, endDate: Date): Promise<MeniereRecord[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    getCurrentBeijingTime();
    console.log('查询日期范围:', startDate.toISOString(), '-', endDate.toISOString());

    // 获取所有用户记录
    const { data: records, error: recordsError } = await supabase
      .from('meniere_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (recordsError) {
      console.error('获取记录失败:', recordsError);
      throw recordsError;
    }

    console.log('获取到的记录数量:', records?.length || 0);
    
    // 获取用户打卡记录
    const { data: checkins, error: checkinsError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('checkin_date', getBeijingDateString(startDate))
      .lte('checkin_date', getBeijingDateString(endDate))
      .order('checkin_date', { ascending: false });

    if (checkinsError) {
      console.error('获取打卡记录失败:', checkinsError);
    }

    console.log('获取到的打卡记录数量:', checkins?.length || 0);

    // 获取医疗记录
    const { data: medicalRecords, error: medicalError } = await supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', getBeijingDateString(startDate))
      .lte('date', getBeijingDateString(endDate))
      .order('date', { ascending: false });

    if (medicalError) {
      console.error('获取医疗记录失败:', medicalError);
    }

    console.log('获取到的医疗记录数量:', medicalRecords?.length || 0);

    // 合并记录，将打卡记录和医疗记录转换为统一格式
    const allRecords: MeniereRecord[] = [...(records || [])].map(record => ({
      id: record.id,
      type: record.type as 'dizziness' | 'lifestyle' | 'medication' | 'voice',
      timestamp: record.timestamp,
      data: record.data,
      note: record.note,
      severity: record.severity,
      duration: record.duration,
      symptoms: record.symptoms,
      diet: record.diet,
      sleep: record.sleep,
      stress: record.stress,
      medications: record.medications,
      dosage: record.dosage
    }));
    
    if (checkins && checkins.length > 0) {
      checkins.forEach(checkin => {
        allRecords.push({
          id: `checkin-${checkin.id}`,
          type: 'checkin',
          timestamp: checkin.created_at,
          note: checkin.note,
          data: {
            mood_score: checkin.mood_score,
            checkin_date: checkin.checkin_date,
            note: checkin.note,
            photo_url: checkin.photo_url
          },
          severity: undefined,
          duration: undefined,
          symptoms: undefined,
          diet: undefined,
          sleep: undefined,
          stress: undefined,
          medications: undefined,
          dosage: undefined
        });
      });
    }

    // 添加医疗记录
    if (medicalRecords && medicalRecords.length > 0) {
      medicalRecords.forEach(medRecord => {
        allRecords.push({
          id: `medical-${medRecord.id}`,
          type: 'medical',
          timestamp: medRecord.created_at,
          note: medRecord.notes,
          data: {
            record_type: medRecord.record_type,
            date: medRecord.date,
            hospital: medRecord.hospital,
            doctor: medRecord.doctor,
            department: medRecord.department,
            diagnosis: medRecord.diagnosis,
            symptoms: medRecord.symptoms,
            prescribed_medications: medRecord.prescribed_medications,
            notes: medRecord.notes,
            next_appointment: medRecord.next_appointment
          },
          severity: undefined,
          duration: undefined,
          symptoms: undefined,
          diet: undefined,
          sleep: undefined,
          stress: undefined,
          medications: undefined,
          dosage: undefined
        });
      });
    }

    return allRecords;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
};
