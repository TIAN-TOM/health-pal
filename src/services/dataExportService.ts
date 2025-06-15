import { supabase } from '@/integrations/supabase/client';
import { getBeijingTime, getBeijingDateString, getCurrentBeijingTime } from '@/utils/beijingTime';

export const getRecordsByDateRange = async (startDate: Date, endDate: Date) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    // 打印当前北京时间用于调试
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

    // 合并记录，将打卡记录转换为统一格式
    const allRecords = [...(records || [])];
    
    if (checkins && checkins.length > 0) {
      checkins.forEach(checkin => {
        allRecords.push({
          id: `checkin-${checkin.id}`,
          type: 'checkin',
          timestamp: checkin.created_at,
          created_at: checkin.created_at,
          updated_at: checkin.updated_at,
          user_id: checkin.user_id,
          note: checkin.note,
          data: {
            mood_score: checkin.mood_score,
            checkin_date: checkin.checkin_date,
            note: checkin.note
          },
          severity: null,
          duration: null,
          symptoms: null,
          diet: null,
          sleep: null,
          stress: null,
          medications: null,
          dosage: null
        } as any);
      });
    }

    return allRecords;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
};

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
    // 确保使用正确的北京时间
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
          associatedSymptoms: record.symptoms || []
        }
      };
    } else if (record.type === 'lifestyle') {
      const events = [];
      
      // 饮食记录
      if (record.diet?.length > 0) {
        events.push({
          timestamp,
          eventType: "LifestyleLog",
          details: {
            type: "Diet",
            tags: record.diet
          }
        });
      }
      
      // 睡眠记录
      if (record.sleep) {
        events.push({
          timestamp,
          eventType: "LifestyleLog",
          details: {
            type: "Sleep",
            quality: record.sleep
          }
        });
      }
      
      // 压力记录
      if (record.stress) {
        events.push({
          timestamp,
          eventType: "LifestyleLog",
          details: {
            type: "Stress",
            level: record.stress
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
          dosage: record.dosage
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
          note: record.data?.note
        }
      };
    }
    
    return null;
  }).flat().filter(Boolean);

  // 使用动态计算的北京时间日期范围
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
      } else if (record.type === 'medication') {
        text += `- [${time}] 用药记录\n`;
        if (record.medications?.length > 0) {
          text += `  药物: ${record.medications.join(', ')}\n`;
        }
        if (record.dosage) {
          text += `  剂量: ${record.dosage}\n`;
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
      }
      
      if (record.note && record.type !== 'voice' && record.type !== 'checkin') {
        text += `  备注: ${record.note}\n`;
      }
      
      text += '\n';
    });
    
    text += '\n';
  });

  return text;
};
