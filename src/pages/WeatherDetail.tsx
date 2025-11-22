import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cloud, Droplets, Wind, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { getWeatherData, WeatherData, CITIES, City } from '@/services/weatherService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const WeatherDetail = () => {
  const navigate = useNavigate();
  const { preferences } = useUserPreferences();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);

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
  }, [selectedCity]);

  const handleCityChange = (cityName: string) => {
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">加载中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">天气加载失败</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        {/* 当前天气 */}
        <Card className="mb-6 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">天气详情</CardTitle>
              <Select value={selectedCity.name} onValueChange={handleCityChange}>
                <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-6xl font-light">{weather.temperature}°</p>
                <p className="text-xl mt-2">{weather.description}</p>
              </div>
              <div className="text-7xl">{weather.icon}</div>
            </div>

            {/* 详细信息网格 */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <Droplets className="h-5 w-5" />
                  <span className="text-sm">湿度</span>
                </div>
                <p className="text-2xl font-semibold">{weather.humidity}%</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <Wind className="h-5 w-5" />
                  <span className="text-sm">风速</span>
                </div>
                <p className="text-2xl font-semibold">{weather.windSpeed.toFixed(1)} m/s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7天预报 */}
        {weather.forecast && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                7天天气预报
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weather.forecast.slice(0, 7).map((day, index) => (
                  <div
                    key={day.date}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-24">
                        <p className="font-medium">
                          {index === 0
                            ? '今天'
                            : new Date(day.date).toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(day.date).toLocaleDateString('zh-CN', {
                            weekday: 'short',
                          })}
                        </p>
                      </div>

                      <div className="text-3xl">{day.icon}</div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{day.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {day.tempMax}°
                        </p>
                        <p className="text-sm text-gray-500">{day.tempMin}°</p>
                      </div>

                      <div className="flex items-center gap-1 text-blue-600 min-w-[60px]">
                        <Droplets className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {day.precipitationProbability}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherDetail;
