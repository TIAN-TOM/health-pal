
import type { MeniereRecord } from '@/services/meniereRecordService';
import { formatTimestamp } from './FormatUtils';

export const generateJSONFormat = (records: MeniereRecord[], startDate: string, endDate: string) => {
  // 过滤掉不相关的记录类型，只保留对分析病情有帮助的信息
  const relevantRecords = records.filter(record => {
    // 排除包含个人无关信息的记录
    if (record.data?.emergency_contacts || 
        record.data?.contact_name || 
        record.data?.contact_phone ||
        record.data?.relationship) {
      return false;
    }
    return true;
  });

  // 按类型分组记录
  const groupedRecords = {
    // 症状记录 - 核心分析数据
    symptoms: relevantRecords.filter(r => r.type === 'dizziness').map(record => ({
      timestamp: formatTimestamp(record.timestamp || ''),
      severity: record.severity,
      duration: record.duration,
      symptoms: record.symptoms || [],
      triggers: record.data?.triggers || [],
      note: record.note,
      weather: record.data?.weather,
      temperature: record.data?.temperature,
      humidity: record.data?.humidity,
      barometric_pressure: record.data?.barometric_pressure
    })),

    // 生活方式记录 - 分析病情相关因素
    lifestyle: relevantRecords.filter(r => r.type === 'lifestyle').map(record => ({
      timestamp: formatTimestamp(record.timestamp || ''),
      sleep_hours: record.sleep,
      sleep_quality: record.data?.sleep_quality,
      bed_time: record.data?.bed_time,
      wake_time: record.data?.wake_time,
      water_intake: record.data?.water_intake,
      exercise_type: record.data?.exercise_type,
      exercise_duration: record.data?.exercise_duration,
      exercise_intensity: record.data?.exercise_intensity,
      salt_preference: record.data?.salt_preference,
      diet: record.diet || [],
      stress_level: record.stress,
      mood_score: record.data?.mood_score,
      note: record.note
    })),

    // 用药记录 - 治疗效果分析
    medications: relevantRecords.filter(r => r.type === 'medication').map(record => ({
      timestamp: formatTimestamp(record.timestamp || ''),
      medication_name: record.data?.medication_name || (record.medications && record.medications[0]),
      dosage: record.dosage,
      frequency: record.data?.frequency,
      medication_time: record.data?.medication_time,
      effectiveness: record.data?.effectiveness,
      side_effects: record.data?.side_effects,
      adherence: record.data?.adherence,
      note: record.note
    })),

    // 每日打卡 - 整体健康状态
    daily_checkins: relevantRecords.filter(r => r.type === 'checkin' && !r.data?.age && !r.data?.gender).map(record => ({
      timestamp: formatTimestamp(record.timestamp || ''),
      mood_score: record.data?.mood_score,
      daily_goals: record.data?.daily_goals,
      accomplishments: record.data?.accomplishments,
      note: record.note
    })),

    // 医疗记录 - 专业诊断和治疗
    medical_records: relevantRecords.filter(r => r.type === 'medical').map(record => ({
      timestamp: formatTimestamp(record.timestamp || ''),
      hospital: record.data?.hospital,
      doctor: record.data?.doctor,
      department: record.data?.department,
      diagnosis: record.data?.diagnosis,
      prescribed_medications: record.data?.prescribed_medications || [],
      next_appointment: record.data?.next_appointment,
      symptoms_description: record.data?.symptoms,
      test_results: record.data?.test_results,
      treatment_plan: record.data?.treatment_plan,
      note: record.note
    })),

    // 语音记录 - 症状描述补充
    voice_records: relevantRecords.filter(r => r.type === 'voice').map(record => ({
      timestamp: formatTimestamp(record.timestamp || ''),
      transcription: record.data?.transcription,
      audio_length: record.data?.audio_length,
      note: record.note
    }))
  };

  // 提取患者基本信息（用于分析参考）
  const personalInfo = records.find(r => 
    r.data?.record_type === 'user_profile' || 
    (r.data?.age || r.data?.gender || r.data?.height || r.data?.weight)
  );

  const patientProfile = personalInfo?.data ? {
    age: personalInfo.data.age,
    gender: personalInfo.data.gender,
    height: personalInfo.data.height,
    weight: personalInfo.data.weight,
    medical_history: personalInfo.data.medical_history || [],
    allergies: personalInfo.data.allergies || []
  } : null;

  // 生成分析友好的数据结构
  return {
    export_info: {
      export_time: new Date().toISOString(),
      date_range: {
        start: startDate,
        end: endDate
      },
      total_records: relevantRecords.length,
      record_counts: {
        symptoms: groupedRecords.symptoms.length,
        lifestyle: groupedRecords.lifestyle.length,
        medications: groupedRecords.medications.length,
        daily_checkins: groupedRecords.daily_checkins.length,
        medical_records: groupedRecords.medical_records.length,
        voice_records: groupedRecords.voice_records.length
      }
    },
    patient_profile: patientProfile,
    health_data: groupedRecords,
    analysis_notes: [
      "此数据专为AI分析优化，包含梅尼埃症状、生活方式、用药和医疗记录",
      "数据已排除个人联系信息等无关分析的内容",
      "时间戳均为北京时间格式",
      "建议重点关注症状严重程度与生活方式、用药的关联性"
    ]
  };
};
