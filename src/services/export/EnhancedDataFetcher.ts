
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

    // 获取用药记录
    const { data: medications, error: medicationsError } = await supabase
      .from('user_medications')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (medicationsError) {
      console.error('获取用药记录失败:', medicationsError);
    }

    console.log('获取到的用药记录数量:', medications?.length || 0);

    // 获取紧急联系人记录
    const { data: emergencyContacts, error: emergencyError } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (emergencyError) {
      console.error('获取紧急联系人失败:', emergencyError);
    }

    // 获取用户偏好设置
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (prefsError) {
      console.error('获取用户偏好设置失败:', prefsError);
    }

    // 合并记录，将所有记录转换为统一格式
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
    
    // 添加打卡记录
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

    // 添加用药管理记录
    if (medications && medications.length > 0) {
      medications.forEach(med => {
        allRecords.push({
          id: `medication-management-${med.id}`,
          type: 'medication',
          timestamp: med.created_at,
          note: `用药管理 - ${med.name}`,
          data: {
            medication_name: med.name,
            frequency: med.frequency,
            medication_type: 'management'
          },
          severity: undefined,
          duration: undefined,
          symptoms: undefined,
          diet: undefined,
          sleep: undefined,
          stress: undefined,
          medications: [med.name],
          dosage: med.frequency
        });
      });
    }

    // 添加用户偏好设置信息（作为一条特殊记录）
    if (userPrefs) {
      allRecords.push({
        id: `user-preferences-${userPrefs.id}`,
        type: 'checkin',
        timestamp: userPrefs.updated_at,
        note: '用户基本信息',
        data: {
          age: userPrefs.age,
          gender: userPrefs.gender,
          height: userPrefs.height,
          weight: userPrefs.weight,
          medical_history: userPrefs.medical_history,
          allergies: userPrefs.allergies,
          emergency_contact_name: userPrefs.emergency_contact_name,
          emergency_contact_phone: userPrefs.emergency_contact_phone,
          record_type: 'user_profile'
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
    }

    // 添加紧急联系人信息
    if (emergencyContacts && emergencyContacts.length > 0) {
      emergencyContacts.forEach(contact => {
        allRecords.push({
          id: `emergency-contact-${contact.id}`,
          type: 'checkin',
          timestamp: contact.created_at,
          note: `紧急联系人 - ${contact.name}`,
          data: {
            contact_name: contact.name,
            contact_phone: contact.phone,
            contact_avatar: contact.avatar,
            record_type: 'emergency_contact'
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

    // 按时间排序
    allRecords.sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());

    return allRecords;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
};
