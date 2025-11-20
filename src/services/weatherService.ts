/**
 * 天气服务 - 使用 Open-Meteo 免费API获取天气数据
 */

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

// 天气代码映射到中文描述和图标
const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: '晴朗', icon: '☀️' },
  1: { description: '晴朗', icon: '🌤️' },
  2: { description: '多云', icon: '⛅' },
  3: { description: '阴天', icon: '☁️' },
  45: { description: '有雾', icon: '🌫️' },
  48: { description: '雾凇', icon: '🌫️' },
  51: { description: '小雨', icon: '🌦️' },
  53: { description: '中雨', icon: '🌧️' },
  55: { description: '大雨', icon: '🌧️' },
  61: { description: '小雨', icon: '🌦️' },
  63: { description: '中雨', icon: '🌧️' },
  65: { description: '大雨', icon: '⛈️' },
  71: { description: '小雪', icon: '🌨️' },
  73: { description: '中雪', icon: '❄️' },
  75: { description: '大雪', icon: '❄️' },
  77: { description: '冰粒', icon: '🌨️' },
  80: { description: '阵雨', icon: '🌦️' },
  81: { description: '阵雨', icon: '🌧️' },
  82: { description: '暴雨', icon: '⛈️' },
  95: { description: '雷阵雨', icon: '⛈️' },
  96: { description: '雷暴', icon: '⛈️' },
  99: { description: '强雷暴', icon: '⛈️' }
};

/**
 * 获取天气数据（北京）
 */
export const getWeatherData = async (): Promise<WeatherData> => {
  try {
    // 北京坐标
    const latitude = 39.9042;
    const longitude = 116.4074;
    
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Shanghai`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    const current = data.current;
    
    const weatherCode = current.weather_code;
    const weatherInfo = weatherCodeMap[weatherCode] || { description: '未知', icon: '🌡️' };
    
    return {
      temperature: Math.round(current.temperature_2m),
      weatherCode: weatherCode,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      description: weatherInfo.description,
      icon: weatherInfo.icon
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};
