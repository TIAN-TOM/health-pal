
// 格式化工具函数
export const formatSeverity = (severity: string): string => {
  const severityMap: { [key: string]: string } = {
    'mild': '轻微',
    'moderate': '中度',
    'severe': '严重',
    'very-severe': '非常严重'
  };
  return severityMap[severity] || severity;
};

export const formatDuration = (duration: string): string => {
  const durationMap: { [key: string]: string } = {
    'few-minutes': '几分钟',
    'few-hours': '几小时',
    'half-day': '半天',
    'full-day': '一整天',
    'multiple-days': '多天'
  };
  return durationMap[duration] || duration;
};

export const formatStress = (stress: string): string => {
  const stressMap: { [key: string]: string } = {
    'none': '无压力',
    'low': '轻微压力',
    'moderate': '中等压力',
    'high': '较大压力',
    'severe': '重度压力'
  };
  return stressMap[stress] || stress;
};

export const formatSleepQuality = (quality: string): string => {
  const qualityMap: { [key: string]: string } = {
    'excellent': '非常好',
    'good': '良好',
    'fair': '一般',
    'poor': '较差',
    'very-poor': '很差'
  };
  return qualityMap[quality] || quality;
};

export const formatSaltPreference = (preference: string): string => {
  const preferenceMap: { [key: string]: string } = {
    'light': '清淡',
    'normal': '适中',
    'salty': '偏咸',
    'very-salty': '很咸'
  };
  return preferenceMap[preference] || preference;
};

export const formatGender = (gender: string): string => {
  const genderMap: { [key: string]: string } = {
    'male': '男',
    'female': '女',
    'other': '其他'
  };
  return genderMap[gender] || gender;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatMoodScore = (score: number): string => {
  if (score >= 5) return `${score}/5 (非常好)`;
  if (score >= 4) return `${score}/5 (良好)`;
  if (score >= 3) return `${score}/5 (一般)`;
  if (score >= 2) return `${score}/5 (较差)`;
  return `${score}/5 (很差)`;
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRecordTypeText = (type: string): string => {
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
