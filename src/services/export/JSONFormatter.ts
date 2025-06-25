
import { ExportData } from './EnhancedDataFetcher';

export const generateJSONFormat = (data: ExportData, userInfo: any): string => {
  // 构建导出的数据结构，只包含医疗相关信息
  const exportData = {
    患者基本信息: {
      年龄: userInfo?.age || '未填写',
      性别: userInfo?.gender || '未填写',
      身高: userInfo?.height ? `${userInfo.height}cm` : '未填写',
      体重: userInfo?.weight ? `${userInfo.weight}kg` : '未填写',
      过敏史: userInfo?.allergies && userInfo.allergies.length > 0 
        ? userInfo.allergies 
        : '无记录',
      既往病史: userInfo?.medical_history && userInfo.medical_history.length > 0 
        ? userInfo.medical_history 
        : '无记录'
    },
    
    糖尿病管理记录: data.diabetesRecords?.map(record => ({
      记录时间: record.timestamp,
      血糖值: `${record.blood_sugar} mmol/L`,
      测量时机: getMeasurementTimeText(record.measurement_time),
      胰岛素剂量: record.insulin_dose || '未使用',
      药物: record.medication || '无',
      饮食记录: record.diet || '无记录',
      运动记录: record.exercise || '无记录',
      备注: record.note || '无'
    })) || [],

    眩晕症状记录: data.meniereRecords?.filter(r => r.type === 'dizziness').map(record => ({
      记录时间: record.timestamp,
      持续时间: record.duration,
      严重程度: record.severity,
      症状表现: record.symptoms || [],
      备注: record.note || '无'
    })) || [],

    饮食作息记录: data.meniereRecords?.filter(r => r.type === 'lifestyle').map(record => ({
      记录时间: record.timestamp,
      饮食情况: record.diet || [],
      睡眠质量: record.sleep,
      压力水平: record.stress,
      备注: record.note || '无'
    })) || [],

    用药记录: data.meniereRecords?.filter(r => r.type === 'medication').map(record => ({
      记录时间: record.timestamp,
      药物名称: record.medications || [],
      用药剂量: record.dosage,
      备注: record.note || '无'
    })) || [],

    每日心情记录: data.dailyCheckins?.map(checkin => ({
      日期: checkin.checkin_date,
      心情评分: `${checkin.mood_score}/5`,
      当日感想: checkin.note || '无记录'
    })) || [],

    医疗就诊记录: data.medicalRecords?.map(record => ({
      就诊日期: record.date,
      记录类型: getRecordTypeText(record.record_type),
      医院: record.hospital || '未记录',
      医生: record.doctor || '未记录',
      科室: record.department || '未记录',
      诊断结果: record.diagnosis || '未记录',
      症状描述: record.symptoms || '未记录',
      处方药物: record.prescribed_medications || [],
      医生建议: record.notes || '无',
      下次复诊: record.next_appointment || '无安排'
    })) || [],

    常用药物清单: data.userMedications?.map(med => ({
      药物名称: med.name,
      服用频率: med.frequency || '未设置'
    })) || []
  };

  return JSON.stringify(exportData, null, 2);
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
