import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Droplets, Wind } from 'lucide-react';
import { getWeatherData, WeatherData, CITIES, City } from '@/services/weatherService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const WeatherWidget = () => {
  const navigate = useNavigate();
  const { preferences, savePreferences } = useUserPreferences();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);

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
        const data = await getWeatherData(selectedCity, false);
        setWeather(data);
      } catch (error) {
        console.error('获取天气失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
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
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg h-[140px]">
        <div className="p-3 flex items-center justify-center h-full">
          <div className="text-xs opacity-90">加载中...</div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg h-[140px]">
        <div className="p-3 flex items-center justify-center h-full">
          <div className="text-xs opacity-90">天气加载失败</div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden h-[140px] cursor-pointer"
      onClick={() => navigate('/weather')}
    >
      <div className="p-3 h-full flex flex-col">
        {/* 顶部：地点选择器和天气图标 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Select value={selectedCity.name} onValueChange={handleCityChange}>
              <SelectTrigger 
                className="h-6 w-24 text-xs bg-white/20 border-white/30 text-white"
                onClick={(e) => e.stopPropagation()}
              >
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
            <div className="text-xs opacity-90 mt-0.5">{weather.description}</div>
          </div>
          <div className="text-3xl">{weather.icon}</div>
        </div>
        
        {/* 温度显示 */}
        <div className="flex items-baseline mb-1">
          <span className="text-3xl font-light">{weather.temperature}</span>
          <span className="text-xl font-light ml-1">°</span>
        </div>
        
        {/* 详细信息 */}
        <div className="flex items-center justify-between text-xs opacity-90">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5" />
            <span>{weather.windSpeed.toFixed(1)}m/s</span>
          </div>
        </div>

        {/* 点击提示 */}
        <div className="mt-auto">
          <p className="text-xs text-center text-white/60">点击查看详情</p>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
