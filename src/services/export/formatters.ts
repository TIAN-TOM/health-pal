
import type { MeniereRecord } from '@/services/meniereRecordService';

// 格式化严重程度
const formatSeverity = (severity: string): string => {
  const severityMap: { [key: string]: string } = {
    'mild': '轻微',
    'moderate': '中度',
    'severe': '严重',
    'very-severe': '非常严重'
  };
  return severityMap[severity] || severity;
};

// 格式化持续时间
const formatDuration = (duration: string): string => {
  const durationMap: { [key: string]: string } = {
    'few-minutes': '几分钟',
    'few-hours': '几小时',
    'half-day': '半天',
    'full-day': '一整天',
    'multiple-days': '多天'
  };
  return durationMap[duration] || duration;
};

// 格式化压力程度
const formatStress = (stress: string): string => {
  const stressMap: { [key: string]: string } = {
    'none': '无压力',
    'low': '轻微压力',
    'moderate': '中等压力',
    'high': '较大压力',
    'severe': '重度压力'
  };
  return stressMap[stress] || stress;
};

// 格式化睡眠质量
const formatSleepQuality = (quality: string): string => {
  const qualityMap: { [key: string]: string } = {
    'excellent': '非常好',
    'good': '良好',
    'fair': '一般',
    'poor': '较差',
    'very-poor': '很差'
  };
  return qualityMap[quality] || quality;
};

// 格式化口味偏好
const formatSaltPreference = (preference: string): string => {
  const preferenceMap: { [key: string]: string } = {
    'light': '清淡',
    'normal': '适中',
    'salty': '偏咸',
    'very-salty': '很咸'
  };
  return preferenceMap[preference] || preference;
};

// 格式化时间戳为北京时间
const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 生成JSON格式数据
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
        
        // 饮食相关数据
        waterIntake: record.data.water_intake,
        saltPreference: record.data.salt_preference ? formatSaltPreference(record.data.salt_preference) : undefined,
        
        // 运动相关数据
        exerciseType: record.data.exercise_type,
        exerciseDuration: record.data.exercise_duration,
        
        // 打卡记录数据
        moodScore: record.data.mood_score,
        checkinDate: record.data.checkin_date,
        photoUrl: record.data.photo_url,
        
        // 医疗记录数据
        recordType: record.data.record_type,
        date: record.data.date,
        hospital: record.data.hospital,
        doctor: record.data.doctor,
        department: record.data.department,
        diagnosis: record.data.diagnosis,
        prescribedMedications: record.data.prescribed_medications,
        nextAppointment: record.data.next_appointment,
        symptoms: record.data.symptoms,
        
        // 用药记录的详细数据（增强版）
        medicationTime: record.data.medication_time,
        effectiveness: record.data.effectiveness,
        sideEffects: record.data.side_effects,
        
        // 其他任何数据
        ...record.data
      } : undefined
    }))
  };
};

// 生成纯文本格式数据
export const generateTextFormat = (records: MeniereRecord[], startDate: string, endDate: string): string => {
  const header = `梅尼埃症记录导出报告
=====================================
导出时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
记录时间范围: ${startDate} 至 ${endDate}
总记录数: ${records.length}

记录类型统计:
- 眩晕症状记录: ${records.filter(r => r.type === 'dizziness').length} 条
- 饮食作息记录: ${records.filter(r => r.type === 'lifestyle').length} 条
- 用药记录: ${records.filter(r => r.type === 'medication').length} 条
- 语音记录: ${records.filter(r => r.type === 'voice').length} 条
- 每日打卡记录: ${records.filter(r => r.type === 'checkin').length} 条
- 医疗记录: ${records.filter(r => r.type === 'medical').length} 条

=====================================

详细记录:
`;

  const recordTexts = records.map((record, index) => {
    let text = `${index + 1}. 【${getRecordTypeText(record.type)}】\n`;
    text += `   时间: ${formatTimestamp(record.timestamp || '')}\n`;
    
    // 眩晕记录详情
    if (record.type === 'dizziness') {
      if (record.severity) text += `   严重程度: ${formatSeverity(record.severity)}\n`;
      if (record.duration) text += `   持续时间: ${formatDuration(record.duration)}\n`;
      if (record.symptoms && record.symptoms.length > 0) {
        text += `   症状: ${record.symptoms.join(', ')}\n`;
      }
    }
    
    // 生活方式记录详情
    if (record.type === 'lifestyle') {
      if (record.sleep) text += `   睡眠时长: ${record.sleep}\n`;
      if (record.data?.sleep_quality) text += `   睡眠质量: ${formatSleepQuality(record.data.sleep_quality)}\n`;
      if (record.data?.bed_time) text += `   入睡时间: ${record.data.bed_time}\n`;
      if (record.data?.wake_time) text += `   起床时间: ${record.data.wake_time}\n`;
      if (record.data?.water_intake) text += `   饮水量: ${record.data.water_intake}\n`;
      if (record.data?.exercise_type) text += `   运动类型: ${record.data.exercise_type}\n`;
      if (record.data?.exercise_duration) text += `   运动时长: ${record.data.exercise_duration}\n`;
      if (record.data?.salt_preference) text += `   口味偏好: ${formatSaltPreference(record.data.salt_preference)}\n`;
      if (record.diet && record.diet.length > 0) {
        text += `   饮食: ${record.diet.join(', ')}\n`;
      }
      if (record.stress) text += `   压力程度: ${formatStress(record.stress)}\n`;
    }
    
    // 用药记录详情（增强版）
    if (record.type === 'medication') {
      if (record.medications && record.medications.length > 0) {
        text += `   药物: ${record.medications.join(', ')}\n`;
      }
      if (record.dosage) text += `   剂量: ${record.dosage}\n`;
      if (record.data?.medication_time) text += `   用药时间: ${record.data.medication_time}\n`;
      if (record.data?.effectiveness) text += `   药效评价: ${record.data.effectiveness}\n`;
      if (record.data?.side_effects) text += `   副作用: ${record.data.side_effects}\n`;
    }

    // 打卡记录详情
    if (record.type === 'checkin') {
      if (record.data?.mood_score) text += `   心情评分: ${record.data.mood_score}/10\n`;
      if (record.data?.checkin_date) text += `   打卡日期: ${record.data.checkin_date}\n`;
    }

    // 医疗记录详情
    if (record.type === 'medical') {
      if (record.data?.record_type) text += `   记录类型: ${record.data.record_type}\n`;
      if (record.data?.hospital) text += `   医院: ${record.data.hospital}\n`;
      if (record.data?.doctor) text += `   医生: ${record.data.doctor}\n`;
      if (record.data?.department) text += `   科室: ${record.data.department}\n`;
      if (record.data?.diagnosis) text += `   诊断: ${record.data.diagnosis}\n`;
      if (record.data?.prescribed_medications && record.data.prescribed_medications.length > 0) {
        text += `   处方药物: ${record.data.prescribed_medications.join(', ')}\n`;
      }
      if (record.data?.next_appointment) text += `   下次复诊: ${record.data.next_appointment}\n`;
      if (record.data?.symptoms) text += `   症状描述: ${record.data.symptoms}\n`;
    }
    
    // 备注
    if (record.note) {
      text += `   备注: ${record.note}\n`;
    }
    
    return text;
  }).join('\n');

  return header + recordTexts + '\n\n报告结束';
};

// 获取记录类型的中文名称
const getRecordTypeText = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'dizziness': '眩晕症状',
    'lifestyle': '饮食作息',
    'medication': '用药记录',
    'voice': '语音记录',
    'checkin': '每日打卡',
    'medical': '医疗记录'
  };
  return typeMap[type] || type;
};
