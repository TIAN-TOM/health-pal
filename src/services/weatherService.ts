/**
 * 天气服务 - 使用 Open-Meteo 免费API获取天气数据
 */

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const weatherCache = new Map<string, CacheEntry>();

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  cityName: string;
  forecast?: DailyForecast[];
  yesterday?: DailyForecast;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
  icon: string;
  description: string;
}

export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

// 支持的城市列表
export const CITIES: City[] = [
  { name: '悉尼', latitude: -33.8688, longitude: 151.2093 },
  { name: '北京', latitude: 39.9042, longitude: 116.4074 },
  { name: '上海', latitude: 31.2304, longitude: 121.4737 },
  { name: '广州', latitude: 23.1291, longitude: 113.2644 },
  { name: '深圳', latitude: 22.5431, longitude: 114.0579 },
  { name: '成都', latitude: 30.5728, longitude: 104.0668 },
  { name: '杭州', latitude: 30.2741, longitude: 120.1551 },
  { name: '纽约', latitude: 40.7128, longitude: -74.0060 },
  { name: '伦敦', latitude: 51.5074, longitude: -0.1278 },
  { name: '东京', latitude: 35.6762, longitude: 139.6503 },
];

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
 * 解析日期字符串为本地日期组件，避免时区偏移问题
 */
const parseDateString = (dateStr: string): { year: number; month: number; day: number } => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
};

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取指定城市的天气数据（包含7天预报和昨日天气）
 */
export const getWeatherData = async (city: City, includeForecast = true): Promise<WeatherData> => {
  // 检查缓存
  const cacheKey = `${city.name}-${includeForecast}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // 计算昨天的日期用于获取历史数据
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDateString(yesterday);
    
    const forecastParams = includeForecast 
      ? '&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max'
      : '';
    
    // 添加 past_days=1 来获取昨天的数据
    const pastDaysParam = includeForecast ? '&past_days=1' : '';
    
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m${forecastParams}${pastDaysParam}&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    const current = data.current;
    
    const weatherCode = current.weather_code;
    const weatherInfo = weatherCodeMap[weatherCode] || { description: '未知', icon: '🌡️' };
    
    // 处理预报数据（包括昨天、今天和未来6天）
    let forecast: DailyForecast[] | undefined;
    let yesterdayWeather: DailyForecast | undefined;
    
    if (includeForecast && data.daily) {
      const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = data.daily;
      
      // 验证所有必需的数组都存在且有足够的数据
      if (
        Array.isArray(time) && time.length > 0 &&
        Array.isArray(weather_code) && weather_code.length > 0 &&
        Array.isArray(temperature_2m_max) && temperature_2m_max.length > 0 &&
        Array.isArray(temperature_2m_min) && temperature_2m_min.length > 0
      ) {
        // 使用 past_days=1 后，数据结构为：index 0 = 昨天，index 1 = 今天，index 2+ = 未来
        // 提取昨天的天气数据
        if (time.length > 0) {
          const code = weather_code[0] || 0;
          const info = weatherCodeMap[code] || { description: '未知', icon: '🌡️' };
          yesterdayWeather = {
            date: time[0],
            tempMax: Math.round(temperature_2m_max[0] || 0),
            tempMin: Math.round(temperature_2m_min[0] || 0),
            weatherCode: code,
            precipitationProbability: precipitation_probability_max?.[0] || 0,
            icon: info.icon,
            description: info.description
          };
        }
        
        // 从 index 1 开始（今天）获取7天预报
        forecast = time.slice(1, 8).map((date: string, index: number) => {
          const dataIndex = index + 1; // 对应原始数据的索引
          const code = weather_code[dataIndex] || 0;
          const info = weatherCodeMap[code] || { description: '未知', icon: '🌡️' };
          return {
            date,
            tempMax: Math.round(temperature_2m_max[dataIndex] || 0),
            tempMin: Math.round(temperature_2m_min[dataIndex] || 0),
            weatherCode: code,
            precipitationProbability: precipitation_probability_max?.[dataIndex] || 0,
            icon: info.icon,
            description: info.description
          };
        });
      }
    }
    
    const weatherData: WeatherData = {
      temperature: Math.round(current.temperature_2m),
      weatherCode: weatherCode,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      cityName: city.name,
      forecast,
      yesterday: yesterdayWeather
    };

    // 检查并创建天气预警
    try {
      const { checkWeatherAlert, createWeatherAlert } = await import('./weatherAlertService');
      const alertCheck = checkWeatherAlert(
        city.name,
        weatherCode,
        weatherData.temperature,
        weatherData.windSpeed
      );
      
      if (alertCheck.needsAlert && alertCheck.alertType && alertCheck.message) {
        await createWeatherAlert(
          city.name,
          alertCheck.alertType,
          alertCheck.message,
          weatherCode,
          weatherData.temperature
        );
      }
    } catch (error) {
      console.error('天气预警检查失败:', error);
    }

    // 更新缓存
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};
