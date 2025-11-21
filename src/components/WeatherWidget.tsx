import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, Droplets, Wind, MapPin } from 'lucide-react';
import { getWeatherData, WeatherData, CITIES, City } from '@/services/weatherService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const WeatherWidget = () => {
  const { preferences, savePreferences } = useUserPreferences();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]); // 默认悉尼
  const [showForecast, setShowForecast] = useState(false);

  // 从偏好加载城市
  useEffect(() => {
    if (preferences?.preferred_weather_city) {
      const city = CITIES.find(c => c.name === preferences.preferred_weather_city);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [preferences]);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await getWeatherData(selectedCity, true);
        setWeather(data);
      } catch (error) {
        console.error('获取天气失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // 每30分钟更新一次天气
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedCity]);

  const handleCityChange = async (cityName: string) => {
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city);
      setLoading(true);
      // 保存偏好
      await savePreferences({
        ...preferences,
        preferred_weather_city: cityName
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg min-h-[180px]">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-sm opacity-90">加载中...</div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg min-h-[180px]">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-sm opacity-90">天气加载失败</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
      <div className="p-4">
        {/* 顶部：地点选择器和天气图标 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Select value={selectedCity.name} onValueChange={handleCityChange}>
              <SelectTrigger className="h-7 w-28 text-xs bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm opacity-90 mt-1">{weather.description}</div>
          </div>
          <div className="text-4xl">{weather.icon}</div>
        </div>
        
        {/* 温度显示 */}
        <div className="flex items-baseline mb-3">
          <span className="text-4xl font-light">{weather.temperature}</span>
          <span className="text-2xl font-light ml-1">°</span>
        </div>
        
        {/* 详细信息 */}
        <div className="flex items-center justify-between text-sm opacity-90 mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            <span>{weather.windSpeed.toFixed(1)}m/s</span>
          </div>
        </div>

        {/* 7天预报按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-white hover:bg-white/20 w-full"
          onClick={() => setShowForecast(!showForecast)}
        >
          {showForecast ? '隐藏' : '查看'}7天预报
        </Button>

        {/* 7天预报 */}
        {showForecast && weather.forecast && (
          <div className="border-t border-white/20 pt-3 mt-3 space-y-2">
            {weather.forecast.slice(0, 7).map((day) => (
              <div key={day.date} className="flex items-center justify-between text-xs">
                <span className="opacity-90 w-16">
                  {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-base">{day.icon}</span>
                  <span className="w-20 text-right">{day.tempMin}°-{day.tempMax}°</span>
                  <span className="opacity-80 w-12 text-right">{day.precipitationProbability}%💧</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeatherWidget;
