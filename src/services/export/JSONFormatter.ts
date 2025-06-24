
import type { MeniereRecord } from '@/services/meniereRecordService';
import { 
  formatSeverity, 
  formatDuration, 
  formatStress, 
  formatSleepQuality, 
  formatSaltPreference, 
  formatGender, 
  formatTimestamp 
} from './FormatUtils';

export const generateJSONFormat = (records: MeniereRecord[], startDate: string, endDate: string) => {
  return {
    exportInfo: {
      exportDate: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      dateRange: `${startDate} 至 ${endDate}`,
      totalRecords: records.length,
      recordTypes: {
        dizziness: records.filter(r => r.type === 'dizziness').length,
        lifestyle: records.filter(r => r.type === 'lifestyle').length,
        medication: records.filter(r => r.type === 'medication').length,
        voice: records.filter(r => r.type === 'voice').length,
        checkin: records.filter(r => r.type === 'checkin').length,
        medical: records.filter(r => r.type === 'medical').length
      }
    },
    records: records.map(record => ({
      id: record.id,
      type: record.type,
      timestamp: record.timestamp,
      beijingTime: formatTimestamp(record.timestamp || ''),
      severity: record.severity ? formatSeverity(record.severity) : undefined,
      duration: record.duration ? formatDuration(record.duration) : undefined,
      symptoms: record.symptoms,
      diet: record.diet,
      sleep: record.sleep,
      stress: record.stress ? formatStress(record.stress) : undefined,
      medications: record.medications,
      dosage: record.dosage,
      note: record.note,
      additionalData: record.data ? {
        // 睡眠相关数据
        sleepQuality: record.data.sleep_quality ? formatSleepQuality(record.data.sleep_quality) : undefined,
        bedTime: record.data.bed_time,
        wakeTime: record.data.wake_time,
        sleepDuration: record.data.sleep_duration,
        
        // 饮食相关数据  
        waterIntake: record.data.water_intake,
        saltPreference: record.data.salt_preference ? formatSaltPreference(record.data.salt_preference) : undefined,
        mealTimes: record.data.meal_times,
        dietNotes: record.data.diet_notes,
        
        // 运动相关数据
        exerciseType: record.data.exercise_type,
        exerciseDuration: record.data.exercise_duration,
        exerciseIntensity: record.data.exercise_intensity,
        
        // 心情和情绪数据
        moodScore: record.data.mood_score,
        stressLevel: record.data.stress_level,
        anxietyLevel: record.data.anxiety_level,
        
        // 打卡记录数据
        checkinDate: record.data.checkin_date,
        photoUrl: record.data.photo_url,
        dailyGoals: record.data.daily_goals,
        accomplishments: record.data.accomplishments,
        
        // 医疗记录数据
        recordType: record.data.record_type,
        date: record.data.date,
        hospital: record.data.hospital,
        doctor: record.data.doctor,
        department: record.data.department,
        diagnosis: record.data.diagnosis,
        prescribedMedications: record.data.prescribed_medications,
        nextAppointment: record.data.next_appointment,
        testResults: record.data.test_results,
        treatmentPlan: record.data.treatment_plan,
        
        // 用药记录的详细数据
        medicationTime: record.data.medication_time,
        effectiveness: record.data.effectiveness,
        sideEffects: record.data.side_effects,
        adherence: record.data.adherence,
        medicationNotes: record.data.medication_notes,
        medicationName: record.data.medication_name,
        frequency: record.data.frequency,
        medicationType: record.data.medication_type,
        
        // 环境因素数据
        weather: record.data.weather,
        temperature: record.data.temperature,
        humidity: record.data.humidity,
        barometricPressure: record.data.barometric_pressure,
        
        // 个人信息相关数据
        age: record.data.age,
        gender: record.data.gender ? formatGender(record.data.gender) : undefined,
        height: record.data.height,
        weight: record.data.weight,
        medicalHistory: record.data.medical_history,
        allergies: record.data.allergies,
        emergencyContactName: record.data.emergency_contact_name,
        emergencyContactPhone: record.data.emergency_contact_phone,
        
        // 联系人信息
        contactName: record.data.contact_name,
        contactPhone: record.data.contact_phone,
        contactAvatar: record.data.contact_avatar,
        
        // 语音记录数据
        audioUrl: record.data.audio_url,
        transcription: record.data.transcription,
        audioLength: record.data.audio_length,
        
        // 其他任何数据
        ...record.data
      } : undefined
    }))
  };
};
