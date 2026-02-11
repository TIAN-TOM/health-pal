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
  const { preferences, loading: preferencesLoading, savePreferences } = useUserPreferences();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cityInitialized, setCityInitialized] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // 当偏好加载完成后设置城市（只执行一次）
  useEffect(() => {
    // 等待偏好加载完成
    if (preferencesLoading) return;
    
    // 如果城市已经初始化，不再更新
    if (cityInitialized) return;
    
    // 根据用户偏好设置城市
    if (preferences?.preferred_weather_city) {
      const city = CITIES.find(c => c.name === preferences.preferred_weather_city);
      if (city) {
        setSelectedCity(city);
        setCityInitialized(true);
        return;
      }
    }
    
    // 没有偏好或找不到城市，使用默认城市
    setSelectedCity(CITIES[0]);
    setCityInitialized(true);
  }, [preferences, preferencesLoading, cityInitialized]);

  useEffect(() => {
    // 等待城市初始化完成
    if (!selectedCity) return;
    
    const fetchWeather = async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      try {
        const data = await getWeatherData(selectedCity, false);
        setWeather(data);
      } catch (error) {
        console.error('获取天气失败:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchWeather();
    
    const interval = setInterval(() => fetchWeather(true), 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedCity]);

  const handleCityChange = async (cityName: string) => {
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city);
      // 保存偏好
      await savePreferences({
        ...preferences,
        preferred_weather_city: cityName
      });
    }
  };

  if ((loading && !weather) || !selectedCity) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg min-h-[110px]">
        <div className="p-3 flex items-center justify-center h-full">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-20 mb-2"></div>
            <div className="h-8 bg-white/20 rounded w-16 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-24"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg min-h-[110px]">
        <div className="p-3 flex items-center justify-center h-full">
          <div className="text-xs opacity-90">天气加载失败</div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden min-h-[110px] cursor-pointer"
      onClick={() => navigate('/weather')}
    >
      {refreshing && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
        </div>
      )}
      <div className="p-3 h-full flex flex-col">
        {/* 顶部：地点选择器和天气图标 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Select value={selectedCity?.name || ''} onValueChange={handleCityChange}>
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
        <div className="flex items-baseline">
          <span className="text-2xl font-light">{weather.temperature}</span>
          <span className="text-lg font-light ml-0.5">°</span>
        </div>

        {/* 温度和详情在同一行 */}
        <div className="flex items-center justify-between text-xs opacity-90 mt-auto">
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            <span>{weather.windSpeed.toFixed(1)}m/s</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
