import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, Droplets, Wind, MapPin } from 'lucide-react';
import { getWeatherData, WeatherData, CITIES, City } from '@/services/weatherService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]); // 默认悉尼
  const [showCitySelect, setShowCitySelect] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData(selectedCity);
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

  const handleCityChange = (cityName: string) => {
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city);
      setLoading(true);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg min-h-[110px]">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-sm opacity-90">加载中...</div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white border-0 shadow-lg min-h-[110px]">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-sm opacity-90">天气加载失败</div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg min-h-[110px] hover:shadow-xl transition-shadow cursor-pointer relative overflow-hidden"
      onClick={() => setShowCitySelect(!showCitySelect)}
    >
      <div className="p-4 h-full flex flex-col justify-between">
        {/* 顶部：地点选择器和天气图标 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showCitySelect ? (
              <Select value={selectedCity.name} onValueChange={handleCityChange}>
                <SelectTrigger className="h-6 w-20 text-xs bg-white/20 border-white/30 text-white">
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
            ) : (
              <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                <MapPin className="h-3 w-3" />
                <span>{weather.cityName}</span>
              </div>
            )}
            <div className="text-sm opacity-90">{weather.description}</div>
          </div>
          <div className="text-3xl">{weather.icon}</div>
        </div>
        
        {/* 中部：温度 */}
        <div className="flex items-baseline">
          <span className="text-4xl font-light">{weather.temperature}</span>
          <span className="text-2xl font-light ml-1">°</span>
        </div>
        
        {/* 底部：详细信息 */}
        <div className="flex items-center justify-between text-xs opacity-80">
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
