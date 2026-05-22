/**
 * 天气数据多源 Provider 封装
 * 提供顺序回退能力：Open-Meteo → wttr.in → MET Norway
 * 每个 provider 返回统一的"当前天气"结构（不含 forecast / yesterday）
 */
import type { City, WeatherData } from './weatherService';

type CurrentOnlyWeather = Omit<WeatherData, 'forecast' | 'yesterday'>;

// 与 weatherService 中保持一致的天气代码 → emoji/描述 映射
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
  99: { description: '强雷暴', icon: '⛈️' },
};

const getInfo = (code: number) =>
  weatherCodeMap[code] || { description: '未知', icon: '🌡️' };

const PROVIDER_TIMEOUT_MS = 5000;

const fetchWithTimeout = async (url: string, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

// ---------- 1. Open-Meteo ----------
const openMeteoProvider = async (city: City): Promise<CurrentOnlyWeather> => {
  const res = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
  );
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const data = await res.json();
  const c = data?.current;
  if (!c) throw new Error('Open-Meteo: invalid payload');
  const info = getInfo(c.weather_code);
  return {
    temperature: Math.round(c.temperature_2m),
    weatherCode: c.weather_code,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    description: info.description,
    icon: info.icon,
    cityName: city.name,
  };
};

// ---------- 2. wttr.in ----------
// WWO weatherCode → 近似的 Open-Meteo WMO 代码
const wwoToWmo = (wwo: number): number => {
  if ([113].includes(wwo)) return 0;
  if ([116].includes(wwo)) return 2;
  if ([119, 122].includes(wwo)) return 3;
  if ([143, 248, 260].includes(wwo)) return 45;
  if ([176, 263, 266, 293, 296].includes(wwo)) return 51;
  if ([299, 302].includes(wwo)) return 63;
  if ([305, 308, 356, 359].includes(wwo)) return 65;
  if ([179, 227, 320, 323, 326].includes(wwo)) return 71;
  if ([230, 329, 332, 335, 338, 368, 371].includes(wwo)) return 73;
  if ([182, 185, 281, 284, 311, 314, 317, 350, 362, 365, 374, 377].includes(wwo)) return 77;
  if ([200, 386, 389].includes(wwo)) return 95;
  if ([392, 395].includes(wwo)) return 99;
  return 3;
};

const wttrInProvider = async (city: City): Promise<CurrentOnlyWeather> => {
  const res = await fetchWithTimeout(
    `https://wttr.in/${city.latitude},${city.longitude}?format=j1`
  );
  if (!res.ok) throw new Error(`wttr.in HTTP ${res.status}`);
  const data = await res.json();
  const c = data?.current_condition?.[0];
  if (!c) throw new Error('wttr.in: invalid payload');
  const wwo = Number(c.weatherCode);
  const wmo = wwoToWmo(wwo);
  const info = getInfo(wmo);
  return {
    temperature: Math.round(Number(c.temp_C)),
    weatherCode: wmo,
    humidity: Number(c.humidity),
    // wttr.in windspeedKmph → m/s
    windSpeed: Math.round((Number(c.windspeedKmph) / 3.6) * 10) / 10,
    description: info.description,
    icon: info.icon,
    cityName: city.name,
  };
};

// ---------- 3. MET Norway ----------
const metNoSymbolToWmo = (symbol: string): number => {
  const s = symbol.toLowerCase();
  if (s.startsWith('clearsky')) return 0;
  if (s.startsWith('fair')) return 1;
  if (s.startsWith('partlycloudy')) return 2;
  if (s.startsWith('cloudy')) return 3;
  if (s.startsWith('fog')) return 45;
  if (s.startsWith('lightrain') || s.startsWith('lightsleet')) return 51;
  if (s.startsWith('rain') || s.startsWith('sleet')) return 63;
  if (s.startsWith('heavyrain') || s.startsWith('heavysleet')) return 65;
  if (s.startsWith('lightsnow')) return 71;
  if (s.startsWith('snow')) return 73;
  if (s.startsWith('heavysnow')) return 75;
  if (s.includes('thunder')) return 95;
  return 3;
};

const metNoProvider = async (city: City): Promise<CurrentOnlyWeather> => {
  // 浏览器无法设置 User-Agent，MET Norway 可能拒绝；失败时由调用方继续往下走
  const res = await fetchWithTimeout(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${city.latitude}&lon=${city.longitude}`
  );
  if (!res.ok) throw new Error(`MET Norway HTTP ${res.status}`);
  const data = await res.json();
  const ts = data?.properties?.timeseries?.[0];
  const details = ts?.data?.instant?.details;
  const symbol = ts?.data?.next_1_hours?.summary?.symbol_code
    || ts?.data?.next_6_hours?.summary?.symbol_code
    || 'cloudy';
  if (!details) throw new Error('MET Norway: invalid payload');
  const wmo = metNoSymbolToWmo(symbol);
  const info = getInfo(wmo);
  return {
    temperature: Math.round(Number(details.air_temperature)),
    weatherCode: wmo,
    humidity: Math.round(Number(details.relative_humidity ?? 0)),
    windSpeed: Math.round(Number(details.wind_speed ?? 0) * 10) / 10,
    description: info.description,
    icon: info.icon,
    cityName: city.name,
  };
};

interface Provider {
  name: string;
  fetch: (city: City) => Promise<CurrentOnlyWeather>;
}

const PROVIDERS: Provider[] = [
  { name: 'open-meteo', fetch: openMeteoProvider },
  { name: 'wttr.in', fetch: wttrInProvider },
  { name: 'met.no', fetch: metNoProvider },
];

/**
 * 按顺序尝试多个 provider 获取"当前天气"。
 * 任一成功即返回；全部失败则抛错。
 */
export const getCurrentWeather = async (city: City): Promise<CurrentOnlyWeather> => {
  const errors: string[] = [];
  for (const p of PROVIDERS) {
    try {
      const data = await p.fetch(city);
      if (errors.length > 0) {
        console.warn(`[weather] fallback provider "${p.name}" succeeded after: ${errors.join('; ')}`);
      }
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${p.name}: ${msg}`);
    }
  }
  throw new Error(`All weather providers failed → ${errors.join('; ')}`);
};
