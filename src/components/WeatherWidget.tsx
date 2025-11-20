import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, Droplets, Wind, MapPin, Plus, X } from 'lucide-react';
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
  const [weather1, setWeather1] = useState<WeatherData | null>(null);
  const [weather2, setWeather2] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity1, setSelectedCity1] = useState<City>(CITIES[0]); // 默认悉尼
  const [selectedCity2, setSelectedCity2] = useState<City | null>(null);
  const [showForecast, setShowForecast] = useState(false);

  // 从偏好加载城市
  useEffect(() => {
    if (preferences?.preferred_weather_city) {
      const city = CITIES.find(c => c.name === preferences.preferred_weather_city);
      if (city) {
        setSelectedCity1(city);
      }
    }
    if (preferences?.preferred_weather_city2) {
      const city = CITIES.find(c => c.name === preferences.preferred_weather_city2);
      if (city) {
        setSelectedCity2(city);
      }
    }
  }, [preferences]);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data1 = await getWeatherData(selectedCity1, true);
        setWeather1(data1);
        
        if (selectedCity2) {
          const data2 = await getWeatherData(selectedCity2, true);
          setWeather2(data2);
        }
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
  }, [selectedCity1, selectedCity2]);

  const handleCity1Change = async (cityName: string) => {
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity1(city);
      setLoading(true);
      // 保存偏好
      await savePreferences({
        ...preferences,
        preferred_weather_city: cityName
      });
    }
  };

  const handleCity2Change = async (cityName: string) => {
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity2(city);
      // 保存偏好
      await savePreferences({
        ...preferences,
        preferred_weather_city2: cityName
      });
    }
  };

  const handleAddSecondCity = () => {
    setSelectedCity2(CITIES[1]); // 默认选择第二个城市
  };

  const handleRemoveSecondCity = async () => {
    setSelectedCity2(null);
    setWeather2(null);
    // 清除偏好
    await savePreferences({
      ...preferences,
      preferred_weather_city2: undefined
    });
  };

  const renderWeatherCard = (weather: WeatherData | null, cityIndex: 1 | 2) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm opacity-90">加载中...</div>
        </div>
      );
    }

    if (!weather) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm opacity-90">天气加载失败</div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {/* 顶部：地点选择器和天气图标 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Select 
              value={cityIndex === 1 ? selectedCity1.name : selectedCity2?.name} 
              onValueChange={cityIndex === 1 ? handleCity1Change : handleCity2Change}
            >
              <SelectTrigger className="h-6 w-24 text-xs bg-white/20 border-white/30 text-white">
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
          <div className="text-3xl">{weather.icon}</div>
        </div>
        
        {/* 中部：温度 */}
        <div className="flex items-baseline mb-2">
          <span className="text-3xl font-light">{weather.temperature}</span>
          <span className="text-xl font-light ml-1">°</span>
        </div>
        
        {/* 底部：详细信息 */}
        <div className="flex items-center justify-between text-xs opacity-80 mb-3">
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            <span>{weather.windSpeed.toFixed(1)}m/s</span>
          </div>
        </div>

        {/* 7天预报 */}
        {showForecast && weather.forecast && (
          <div className="border-t border-white/20 pt-2 space-y-1">
            {weather.forecast.slice(0, 3).map((day) => (
              <div key={day.date} className="flex items-center justify-between text-xs">
                <span className="opacity-80">{new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                <div className="flex items-center gap-2">
                  <span>{day.icon}</span>
                  <span>{day.tempMin}°-{day.tempMax}°</span>
                  <span className="opacity-70">{day.precipitationProbability}%💧</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading && !weather1) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg min-h-[110px]">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-sm opacity-90">加载中...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
      <div className="p-4">
        {/* 顶部按钮栏 */}
        <div className="flex justify-between items-center mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-white hover:bg-white/20"
            onClick={() => setShowForecast(!showForecast)}
          >
            {showForecast ? '隐藏' : '7天'}预报
          </Button>
          {!selectedCity2 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-white hover:bg-white/20"
              onClick={handleAddSecondCity}
            >
              <Plus className="h-3 w-3 mr-1" />
              对比
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-white hover:bg-white/20"
              onClick={handleRemoveSecondCity}
            >
              <X className="h-3 w-3 mr-1" />
              取消对比
            </Button>
          )}
        </div>

        {/* 天气卡片 */}
        <div className={`grid ${selectedCity2 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          <div className={selectedCity2 ? 'border-r border-white/20 pr-4' : ''}>
            {renderWeatherCard(weather1, 1)}
          </div>
          {selectedCity2 && (
            <div>
              {renderWeatherCard(weather2, 2)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
