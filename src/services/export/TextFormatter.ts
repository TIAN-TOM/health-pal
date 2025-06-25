
import { ExportData } from './EnhancedDataFetcher';
import { formatDate, formatDateTime, formatMoodScore } from './FormatUtils';
import { extractPersonalInfo } from './PersonalInfoHandler';

export const generateTextFormat = (data: ExportData): string => {
  const sections: string[] = [];
  
  // 添加个人信息
  const personalInfoSection = extractPersonalInfo(data.meniereRecords || []);
  if (personalInfoSection) {
    sections.push(personalInfoSection);
  }

  // 糖尿病管理记录
  if (data.diabetesRecords && data.diabetesRecords.length > 0) {
    sections.push("=== 糖尿病管理记录 ===");
    data.diabetesRecords.forEach((record, index) => {
      sections.push(`${index + 1}. ${formatDateTime(record.timestamp)}`);
      sections.push(`   血糖值: ${record.blood_sugar} mmol/L (${getMeasurementTimeText(record.measurement_time)})`);
      
      if (record.insulin_dose) {
        sections.push(`   胰岛素剂量: ${record.insulin_dose}`);
      }
      if (record.medication) {
        sections.push(`   药物: ${record.medication}`);
      }
      if (record.diet) {
        sections.push(`   饮食: ${record.diet}`);
      }
      if (record.exercise) {
        sections.push(`   运动: ${record.exercise}`);
      }
      if (record.note) {
        sections.push(`   备注: ${record.note}`);
      }
      sections.push("");
    });
  }

  // 眩晕症状记录
  if (data.meniereRecords && data.meniereRecords.length > 0) {
    const dizzinessRecords = data.meniereRecords.filter(r => r.type === 'dizziness');
    if (dizzinessRecords.length > 0) {
      sections.push("=== 眩晕症状记录 ===");
      dizzinessRecords.forEach((record, index) => {
        sections.push(`${index + 1}. ${formatDateTime(record.timestamp)}`);
        sections.push(`   持续时间: ${record.duration}`);
        sections.push(`   严重程度: ${record.severity}`);
        if (record.symptoms && record.symptoms.length > 0) {
          sections.push(`   症状: ${record.symptoms.join(', ')}`);
        }
        if (record.note) {
          sections.push(`   备注: ${record.note}`);
        }
        sections.push("");
      });
    }
  }

  // 饮食与作息记录
  if (data.meniereRecords && data.meniereRecords.length > 0) {
    const lifestyleRecords = data.meniereRecords.filter(r => r.type === 'lifestyle');
    if (lifestyleRecords.length > 0) {
      sections.push("=== 饮食与作息记录 ===");
      lifestyleRecords.forEach((record, index) => {
        sections.push(`${index + 1}. ${formatDateTime(record.timestamp)}`);
        if (record.diet && record.diet.length > 0) {
          sections.push(`   饮食: ${record.diet.join(', ')}`);
        }
        if (record.sleep) {
          sections.push(`   睡眠: ${record.sleep}`);
        }
        if (record.stress) {
          sections.push(`   压力水平: ${record.stress}`);
        }
        if (record.note) {
          sections.push(`   备注: ${record.note}`);
        }
        sections.push("");
      });
    }
  }

  // 用药记录
  if (data.meniereRecords && data.meniereRecords.length > 0) {
    const medicationRecords = data.meniereRecords.filter(r => r.type === 'medication');
    if (medicationRecords.length > 0) {
      sections.push("=== 用药记录 ===");
      medicationRecords.forEach((record, index) => {
        sections.push(`${index + 1}. ${formatDateTime(record.timestamp)}`);
        if (record.medications && record.medications.length > 0) {
          sections.push(`   药物: ${record.medications.join(', ')}`);
        }
        if (record.dosage) {
          sections.push(`   剂量: ${record.dosage}`);
        }
        if (record.note) {
          sections.push(`   备注: ${record.note}`);
        }
        sections.push("");
      });
    }
  }

  // 每日打卡记录
  if (data.dailyCheckins && data.dailyCheckins.length > 0) {
    sections.push("=== 每日打卡记录 ===");
    data.dailyCheckins.forEach((checkin, index) => {
      sections.push(`${index + 1}. ${formatDate(checkin.checkin_date)}`);
      sections.push(`   心情评分: ${formatMoodScore(checkin.mood_score)}`);
      if (checkin.note) {
        sections.push(`   感想: ${checkin.note}`);
      }
      sections.push("");
    });
  }

  // 医疗记录
  if (data.medicalRecords && data.medicalRecords.length > 0) {
    sections.push("=== 医疗记录 ===");
    data.medicalRecords.forEach((record, index) => {
      sections.push(`${index + 1}. ${formatDate(record.date)} - ${getRecordTypeText(record.record_type)}`);
      
      if (record.hospital) sections.push(`   医院: ${record.hospital}`);
      if (record.doctor) sections.push(`   医生: ${record.doctor}`);
      if (record.department) sections.push(`   科室: ${record.department}`);
      if (record.diagnosis) sections.push(`   诊断: ${record.diagnosis}`);
      if (record.symptoms) sections.push(`   症状: ${record.symptoms}`);
      if (record.prescribed_medications && record.prescribed_medications.length > 0) {
        sections.push(`   处方药物: ${record.prescribed_medications.join(', ')}`);
      }
      if (record.notes) sections.push(`   备注: ${record.notes}`);
      if (record.next_appointment) {
        sections.push(`   下次预约: ${formatDate(record.next_appointment)}`);
      }
      sections.push("");
    });
  }

  return sections.join('\n');
};

const getMeasurementTimeText = (time: string): string => {
  const timeMap: Record<string, string> = {
    'before_meal': '餐前',
    'after_meal': '餐后',
    'fasting': '空腹',
    'bedtime': '睡前',
    'other': '其他'
  };
  return timeMap[time] || time;
};

const getRecordTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'visit': '就诊',
    'diagnosis': '诊断',
    'prescription': '处方'
  };
  return typeMap[type] || type;
};
