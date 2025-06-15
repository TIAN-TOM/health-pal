
import { getBeijingTime } from '@/utils/beijingTime';

const convertDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  if (duration.includes('不到5分钟')) return 3;
  if (duration.includes('5-15分钟')) return 10;
  if (duration.includes('15-30分钟')) return 22;
  if (duration.includes('30分钟-1小时')) return 45;
  if (duration.includes('1-2小时')) return 90;
  if (duration.includes('超过2小时')) return 150;
  return 0;
};

const convertSeverityToNumber = (severity: string): number => {
  if (!severity) return 0;
  if (severity === '轻度') return 3;
  if (severity === '中度') return 6;
  if (severity === '重度') return 9;
  return 0;
};

export const generateJSONFormat = (records: any[], startDate: string, endDate: string) => {
  const events = records.map(record => {
    const originalTime = new Date(record.timestamp || record.created_at);
    const beijingTime = new Date(originalTime.getTime() + (8 * 3600000) - (originalTime.getTimezoneOffset() * 60000));
    const timestamp = beijingTime.toISOString();
    
    if (record.type === 'dizziness') {
      return {
        timestamp,
        eventType: "SymptomLog",
        details: {
          type: "Vertigo",
          durationMinutes: convertDurationToMinutes(record.duration),
          intensity: convertSeverityToNumber(record.severity),
          associatedSymptoms: record.symptoms || [],
          note: record.note || undefined
        }
      };
    } else if (record.type === 'lifestyle') {
      const events = [];
      
      if (record.diet?.length > 0) {
        events.push({
          timestamp,
          eventType: "LifestyleLog",
          details: {
            type: "Diet",
            tags: record.diet,
            note: record.note || undefined
          }
        });
      }
      
      if (record.sleep) {
        events.push({
          timestamp,
          eventType: "LifestyleLog",
          details: {
            type: "Sleep",
            quality: record.sleep,
            note: record.note || undefined
          }
        });
      }
      
      if (record.stress) {
        events.push({
          timestamp,
          eventType: "LifestyleLog",
          details: {
            type: "Stress",
            level: record.stress,
            note: record.note || undefined
          }
        });
      }
      
      return events;
    } else if (record.type === 'medication') {
      return {
        timestamp,
        eventType: "MedicationLog",
        details: {
          medications: record.medications || [],
          dosage: record.dosage,
          note: record.note || undefined
        }
      };
    } else if (record.type === 'voice') {
      return {
        timestamp,
        eventType: "VoiceNote",
        details: {
          note: record.note || record.data?.note
        }
      };
    } else if (record.type === 'checkin') {
      return {
        timestamp,
        eventType: "DailyCheckin",
        details: {
          mood_score: record.data?.mood_score,
          note: record.data?.note,
          photo_url: record.data?.photo_url
        }
      };
    } else if (record.type === 'medical') {
      return {
        timestamp,
        eventType: "MedicalRecord",
        details: {
          record_type: record.data?.record_type,
          hospital: record.data?.hospital,
          doctor: record.data?.doctor,
          department: record.data?.department,
          diagnosis: record.data?.diagnosis,
          symptoms: record.data?.symptoms,
          prescribed_medications: record.data?.prescribed_medications,
          notes: record.data?.notes,
          next_appointment: record.data?.next_appointment
        }
      };
    }
    
    return null;
  }).flat().filter(Boolean);

  const currentBeijingTime = getBeijingTime();
  console.log('导出数据时的北京时间:', currentBeijingTime.toISOString());
  
  return {
    patientId: "MeniereUser01",
    exportDateRange: {
      start: new Date(startDate + 'T00:00:00').toISOString(),
      end: new Date(endDate + 'T23:59:59').toISOString()
    },
    exportedAt: currentBeijingTime.toISOString(),
    events
  };
};

export const generateTextFormat = (records: any[], startDate: string, endDate: string) => {
  const currentBeijingTime = getBeijingTime();
  let text = `梅尼埃症数据记录 (${startDate} - ${endDate})\n`;
  text += `导出时间: ${currentBeijingTime.toLocaleString('zh-CN')} (北京时间)\n\n`;
  
  // 按日期分组 - 使用北京时间
  const recordsByDate = records.reduce((acc, record) => {
    const originalTime = new Date(record.timestamp || record.created_at);
    const beijingTime = new Date(originalTime.getTime() + (8 * 3600000) - (originalTime.getTimezoneOffset() * 60000));
    const date = beijingTime.toLocaleDateString('zh-CN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});

  Object.entries(recordsByDate).forEach(([date, dayRecords]: [string, any[]]) => {
    text += `**${date}**\n\n`;
    
    dayRecords.forEach(record => {
      const originalTime = new Date(record.timestamp || record.created_at);
      const beijingTime = new Date(originalTime.getTime() + (8 * 3600000) - (originalTime.getTimezoneOffset() * 60000));
      const time = beijingTime.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      if (record.type === 'dizziness') {
        text += `- [${time}] 眩晕发作\n`;
        text += `  持续时间: ${record.duration || '未记录'}\n`;
        text += `  严重程度: ${record.severity || '未记录'}\n`;
        if (record.symptoms?.length > 0) {
          text += `  伴随症状: ${record.symptoms.join(', ')}\n`;
        }
        if (record.note) {
          text += `  备注: ${record.note}\n`;
        }
      } else if (record.type === 'lifestyle') {
        if (record.diet?.length > 0) {
          text += `- [${time}] 饮食记录: ${record.diet.join(', ')}\n`;
        }
        if (record.sleep) {
          text += `- [${time}] 睡眠质量: ${record.sleep}\n`;
        }
        if (record.stress) {
          text += `- [${time}] 压力水平: ${record.stress}\n`;
        }
        if (record.note) {
          text += `  备注: ${record.note}\n`;
        }
      } else if (record.type === 'medication') {
        text += `- [${time}] 用药记录\n`;
        if (record.medications?.length > 0) {
          text += `  药物: ${record.medications.join(', ')}\n`;
        }
        if (record.dosage) {
          text += `  剂量: ${record.dosage}\n`;
        }
        if (record.note) {
          text += `  备注: ${record.note}\n`;
        }
      } else if (record.type === 'voice') {
        text += `- [${time}] 语音记事\n`;
        text += `  内容: ${record.note || ''}\n`;
      } else if (record.type === 'checkin') {
        text += `- [${time}] 每日打卡\n`;
        if (record.data?.mood_score) {
          text += `  心情评分: ${record.data.mood_score}/5\n`;
        }
        if (record.data?.note) {
          text += `  备注: ${record.data.note}\n`;
        }
        if (record.data?.photo_url) {
          text += `  照片: ${record.data.photo_url}\n`;
        }
      } else if (record.type === 'medical') {
        text += `- [${time}] 医疗记录 (${record.data?.record_type || '未知类型'})\n`;
        if (record.data?.hospital) {
          text += `  医院: ${record.data.hospital}\n`;
        }
        if (record.data?.doctor) {
          text += `  医生: ${record.data.doctor}\n`;
        }
        if (record.data?.department) {
          text += `  科室: ${record.data.department}\n`;
        }
        if (record.data?.diagnosis) {
          text += `  诊断: ${record.data.diagnosis}\n`;
        }
        if (record.data?.symptoms) {
          text += `  症状: ${record.data.symptoms}\n`;
        }
        if (record.data?.prescribed_medications?.length > 0) {
          text += `  处方药物: ${record.data.prescribed_medications.join(', ')}\n`;
        }
        if (record.data?.notes) {
          text += `  备注: ${record.data.notes}\n`;
        }
        if (record.data?.next_appointment) {
          text += `  下次预约: ${record.data.next_appointment}\n`;
        }
      }
      
      text += '\n';
    });
    
    text += '\n';
  });

  return text;
};
