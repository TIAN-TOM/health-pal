
import type { MeniereRecord } from '@/services/meniereRecordService';
import { formatGender } from './FormatUtils';

export const extractPersonalInfo = (records: MeniereRecord[]) => {
  const personalInfoRecords = records.filter(r => 
    r.data?.record_type === 'user_profile' || 
    (r.data?.age || r.data?.gender || r.data?.height || r.data?.weight || 
     r.data?.medical_history || r.data?.allergies)
  );

  if (personalInfoRecords.length === 0) return '';

  let personalInfo = '\n\n【患者基本信息】\n';
  
  // 合并所有个人信息记录
  const mergedInfo: any = {};
  personalInfoRecords.forEach(record => {
    if (record.data) {
      Object.assign(mergedInfo, record.data);
    }
  });

  if (mergedInfo.age) personalInfo += `年龄: ${mergedInfo.age}岁\n`;
  if (mergedInfo.gender) personalInfo += `性别: ${formatGender(mergedInfo.gender)}\n`;
  if (mergedInfo.height) personalInfo += `身高: ${mergedInfo.height}cm\n`;
  if (mergedInfo.weight) personalInfo += `体重: ${mergedInfo.weight}kg\n`;
  if (mergedInfo.medical_history && mergedInfo.medical_history.length > 0) {
    personalInfo += `既往病史: ${mergedInfo.medical_history.join(', ')}\n`;
  }
  if (mergedInfo.allergies && mergedInfo.allergies.length > 0) {
    personalInfo += `过敏史: ${mergedInfo.allergies.join(', ')}\n`;
  }

  return personalInfo;
};
