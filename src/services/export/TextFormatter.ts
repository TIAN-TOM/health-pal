
import type { MeniereRecord } from '@/services/meniereRecordService';
import { 
  formatSeverity, 
  formatDuration, 
  formatStress, 
  formatSleepQuality, 
  formatSaltPreference, 
  formatTimestamp, 
  getRecordTypeText 
} from './FormatUtils';

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
      if (record.data?.exercise_intensity) text += `   运动强度: ${record.data.exercise_intensity}\n`;
      if (record.data?.salt_preference) text += `   口味偏好: ${formatSaltPreference(record.data.salt_preference)}\n`;
      if (record.diet && record.diet.length > 0) {
        text += `   饮食: ${record.diet.join(', ')}\n`;
      }
      if (record.stress) text += `   压力程度: ${formatStress(record.stress)}\n`;
      if (record.data?.mood_score) text += `   心情评分: ${record.data.mood_score}/10\n`;
    }
    
    // 用药记录详情
    if (record.type === 'medication') {
      if (record.medications && record.medications.length > 0) {
        text += `   药物: ${record.medications.join(', ')}\n`;
      }
      if (record.dosage) text += `   剂量: ${record.dosage}\n`;
      if (record.data?.medication_name) text += `   药物名称: ${record.data.medication_name}\n`;
      if (record.data?.frequency) text += `   服用频率: ${record.data.frequency}\n`;
      if (record.data?.medication_time) text += `   用药时间: ${record.data.medication_time}\n`;
      if (record.data?.effectiveness) text += `   药效评价: ${record.data.effectiveness}\n`;
      if (record.data?.side_effects) text += `   副作用: ${record.data.side_effects}\n`;
      if (record.data?.adherence) text += `   服药依从性: ${record.data.adherence}\n`;
      if (record.data?.medication_type) text += `   记录类型: ${record.data.medication_type}\n`;
    }

    // 打卡记录详情
    if (record.type === 'checkin') {
      if (record.data?.mood_score) text += `   心情评分: ${record.data.mood_score}/10\n`;
      if (record.data?.checkin_date) text += `   打卡日期: ${record.data.checkin_date}\n`;
      if (record.data?.daily_goals) text += `   每日目标: ${record.data.daily_goals}\n`;
      if (record.data?.accomplishments) text += `   完成情况: ${record.data.accomplishments}\n`;
      
      // 用户基本信息
      if (record.data?.record_type === 'user_profile') {
        if (record.data?.age) text += `   年龄: ${record.data.age}\n`;
        if (record.data?.gender) text += `   性别: ${record.data.gender}\n`;
        if (record.data?.height) text += `   身高: ${record.data.height}cm\n`;
        if (record.data?.weight) text += `   体重: ${record.data.weight}kg\n`;
        if (record.data?.medical_history && record.data.medical_history.length > 0) {
          text += `   既往病史: ${record.data.medical_history.join(', ')}\n`;
        }
        if (record.data?.allergies && record.data.allergies.length > 0) {
          text += `   过敏史: ${record.data.allergies.join(', ')}\n`;
        }
        if (record.data?.emergency_contact_name) text += `   紧急联系人: ${record.data.emergency_contact_name}\n`;
        if (record.data?.emergency_contact_phone) text += `   紧急联系电话: ${record.data.emergency_contact_phone}\n`;
      }
      
      // 紧急联系人信息
      if (record.data?.record_type === 'emergency_contact') {
        if (record.data?.contact_name) text += `   联系人姓名: ${record.data.contact_name}\n`;
        if (record.data?.contact_phone) text += `   联系电话: ${record.data.contact_phone}\n`;
      }
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
      if (record.data?.test_results) text += `   检查结果: ${record.data.test_results}\n`;
      if (record.data?.treatment_plan) text += `   治疗方案: ${record.data.treatment_plan}\n`;
    }

    // 语音记录详情
    if (record.type === 'voice') {
      if (record.data?.transcription) text += `   语音转录: ${record.data.transcription}\n`;
      if (record.data?.audio_length) text += `   音频时长: ${record.data.audio_length}秒\n`;
    }

    // 环境因素
    if (record.data?.weather) text += `   天气: ${record.data.weather}\n`;
    if (record.data?.temperature) text += `   温度: ${record.data.temperature}°C\n`;
    if (record.data?.humidity) text += `   湿度: ${record.data.humidity}%\n`;
    
    // 备注
    if (record.note) {
      text += `   备注: ${record.note}\n`;
    }
    
    return text;
  }).join('\n');

  return header + recordTexts + '\n\n报告结束';
};
