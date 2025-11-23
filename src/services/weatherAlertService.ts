import { supabase } from '@/integrations/supabase/client';

export interface WeatherAlert {
  id: string;
  user_id: string;
  city_name: string;
  alert_type: 'heavy_rain' | 'typhoon' | 'high_temp' | 'low_temp' | 'thunderstorm';
  alert_message: string;
  weather_code: number;
  temperature: number;
  created_at: string;
  is_read: boolean;
}

// 天气代码映射到预警类型
const ALERT_WEATHER_CODES = {
  thunderstorm: [95, 96, 99], // 雷暴
  heavy_rain: [55, 63, 65, 81, 82], // 大雨、暴雨
  typhoon: [], // 台风需要根据风速判断
  high_temp: [], // 高温需要根据温度判断
  low_temp: [], // 低温需要根据温度判断
};

/**
 * 检查天气数据是否需要预警
 */
export const checkWeatherAlert = (
  cityName: string,
  weatherCode: number,
  temperature: number,
  windSpeed: number
): { needsAlert: boolean; alertType?: string; message?: string } => {
  // 雷暴预警
  if (ALERT_WEATHER_CODES.thunderstorm.includes(weatherCode)) {
    return {
      needsAlert: true,
      alertType: 'thunderstorm',
      message: `${cityName}有雷暴天气，请注意安全，避免外出`,
    };
  }

  // 大雨/暴雨预警
  if (ALERT_WEATHER_CODES.heavy_rain.includes(weatherCode)) {
    return {
      needsAlert: true,
      alertType: 'heavy_rain',
      message: `${cityName}有强降雨，请注意防范洪涝灾害`,
    };
  }

  // 台风预警（风速>32.7m/s）
  if (windSpeed > 32.7) {
    return {
      needsAlert: true,
      alertType: 'typhoon',
      message: `${cityName}有台风影响，请尽快采取防护措施`,
    };
  }

  // 高温预警（>35°C）
  if (temperature > 35) {
    return {
      needsAlert: true,
      alertType: 'high_temp',
      message: `${cityName}高温预警，注意防暑降温，避免长时间户外活动`,
    };
  }

  // 低温预警（<-10°C）
  if (temperature < -10) {
    return {
      needsAlert: true,
      alertType: 'low_temp',
      message: `${cityName}低温预警，请注意保暖防寒`,
    };
  }

  return { needsAlert: false };
};

/**
 * 创建天气预警
 */
export const createWeatherAlert = async (
  cityName: string,
  alertType: string,
  alertMessage: string,
  weatherCode: number,
  temperature: number
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 检查是否已存在相同的预警（24小时内）
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: existingAlerts } = await supabase
    .from('weather_alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('city_name', cityName)
    .eq('alert_type', alertType)
    .gte('created_at', oneDayAgo.toISOString())
    .limit(1);

  // 如果24小时内已经有相同预警，不再创建新的
  if (existingAlerts && existingAlerts.length > 0) {
    return;
  }

  const { error } = await supabase.from('weather_alerts').insert({
    user_id: user.id,
    city_name: cityName,
    alert_type: alertType,
    alert_message: alertMessage,
    weather_code: weatherCode,
    temperature: temperature,
  });

  if (error) {
    console.error('创建天气预警失败:', error);
  }
};

/**
 * 获取用户的天气预警
 */
export const getUserWeatherAlerts = async (): Promise<WeatherAlert[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('weather_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('获取天气预警失败:', error);
    return [];
  }

  return (data || []) as WeatherAlert[];
};

/**
 * 标记预警为已读
 */
export const markAlertAsRead = async (alertId: string): Promise<void> => {
  const { error } = await supabase
    .from('weather_alerts')
    .update({ is_read: true })
    .eq('id', alertId);

  if (error) {
    console.error('标记预警失败:', error);
  }
};

/**
 * 删除预警
 */
export const deleteWeatherAlert = async (alertId: string): Promise<void> => {
  const { error } = await supabase
    .from('weather_alerts')
    .delete()
    .eq('id', alertId);

  if (error) {
    console.error('删除预警失败:', error);
  }
};