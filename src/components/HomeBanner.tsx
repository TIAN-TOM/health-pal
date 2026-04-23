import React, { useEffect, useMemo, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Droplets, PartyPopper, Sparkles, Wind } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { CITIES, City, getWeatherData, WeatherData } from '@/services/weatherService';
import { CountdownEvent, getActiveCountdownEvents } from '@/services/countdownService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getBeijingTime } from '@/utils/beijingTime';

const THEME_TEXT: Record<string, string> = {
  purple: 'text-purple-700',
  blue: 'text-blue-700',
  pink: 'text-pink-700',
  orange: 'text-orange-700',
  green: 'text-green-700',
  red: 'text-red-700',
};

const THEME_BG: Record<string, string> = {
  purple: 'bg-gradient-to-r from-purple-100 via-violet-100 to-indigo-100',
  blue: 'bg-gradient-to-r from-blue-100 via-cyan-100 to-sky-100',
  pink: 'bg-gradient-to-r from-rose-100 via-pink-100 to-fuchsia-100',
  orange: 'bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100',
  green: 'bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100',
  red: 'bg-gradient-to-r from-red-100 via-rose-100 to-pink-100',
};

const computeDaysLeft = (targetDateStr: string): number => {
  const now = getBeijingTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDateStr);
  target.setHours(23, 59, 59, 999);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const HomeBanner: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, loading: preferencesLoading } = useUserPreferences();

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityInitialized, setCityInitialized] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const [countdowns, setCountdowns] = useState<CountdownEvent[]>([]);
  const [countdownLoading, setCountdownLoading] = useState(true);
  const [, setTick] = useState(0); // 每分钟触发重新计算天数

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const autoplay = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
    []
  );

  // 初始化城市
  useEffect(() => {
    if (preferencesLoading || cityInitialized) return;
    if (preferences?.preferred_weather_city) {
      const city = CITIES.find((c) => c.name === preferences.preferred_weather_city);
      if (city) {
        setSelectedCity(city);
        setCityInitialized(true);
        return;
      }
    }
    setSelectedCity(CITIES[0]);
    setCityInitialized(true);
  }, [preferences, preferencesLoading, cityInitialized]);

  // 加载天气
  useEffect(() => {
    if (!selectedCity) return;
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData(selectedCity, false);
        if (!cancelled) setWeather(data);
      } catch (error) {
        console.error('获取天气失败:', error);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedCity]);

  // 加载倒数日
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getActiveCountdownEvents();
        const now = getBeijingTime();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const active = data.filter((c) => {
          const t = new Date(c.target_date);
          t.setHours(23, 59, 59, 999);
          return t.getTime() >= today.getTime();
        });
        if (!cancelled) setCountdowns(active);
      } catch (error) {
        console.error('Failed to load countdowns:', error);
      } finally {
        if (!cancelled) setCountdownLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 每分钟更新一次（让倒数日天数随时间推移自动刷新）
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // 监听轮播 select 事件以更新指示器
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveSlide(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const slides = useMemo(() => {
    const list: Array<
      | { kind: 'weather'; data: WeatherData; city: City }
      | { kind: 'countdown'; data: CountdownEvent }
      | { kind: 'placeholder' }
    > = [];
    if (weather && selectedCity) {
      list.push({ kind: 'weather', data: weather, city: selectedCity });
    }
    countdowns.forEach((c) => list.push({ kind: 'countdown', data: c }));
    if (list.length === 0 && !weatherLoading && !countdownLoading) {
      list.push({ kind: 'placeholder' });
    }
    return list;
  }, [weather, selectedCity, countdowns, weatherLoading, countdownLoading]);

  if ((weatherLoading && !weather) || (countdownLoading && countdowns.length === 0)) {
    return <Skeleton className="h-14 w-full rounded-lg" />;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      <Carousel
        setApi={setApi}
        opts={{ loop: slides.length > 1, align: 'start' }}
        plugins={slides.length > 1 ? [autoplay] : []}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, idx) => (
            <CarouselItem key={idx} className="pl-0 basis-full">
              {slide.kind === 'weather' && (
                <button
                  type="button"
                  onClick={() => navigate('/weather')}
                  className="h-14 w-full rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-between px-4"
                  aria-label={`查看 ${slide.city.name} 天气详情`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl leading-none">{slide.data.icon}</span>
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="text-sm font-medium truncate">{slide.city.name}</span>
                      <span className="text-lg font-light leading-none">
                        {slide.data.temperature}°
                      </span>
                      <span className="text-xs opacity-90 truncate">{slide.data.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs opacity-90 shrink-0">
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      {slide.data.humidity}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      {slide.data.windSpeed.toFixed(1)}m/s
                    </span>
                  </div>
                </button>
              )}

              {slide.kind === 'countdown' && (() => {
                const days = computeDaysLeft(slide.data.target_date);
                const themeColor = (slide.data as any).theme_color || 'purple';
                const bg = THEME_BG[themeColor] || THEME_BG.purple;
                const textColor = THEME_TEXT[themeColor] || THEME_TEXT.purple;
                const isToday = days === 0;
                const isSoon = days > 0 && days <= 3;
                const Icon = isToday ? PartyPopper : isSoon ? Sparkles : Calendar;
                return (
                  <div
                    className={`h-14 w-full rounded-lg ${bg} shadow-md flex items-center justify-between px-4`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`h-5 w-5 shrink-0 ${textColor} ${isToday ? 'animate-bounce' : isSoon ? 'animate-pulse' : ''}`} />
                      <span className={`text-sm font-semibold truncate ${textColor}`}>
                        {slide.data.title}
                      </span>
                    </div>
                    <div className={`flex items-baseline gap-1 shrink-0 ${textColor}`}>
                      {isToday ? (
                        <span className="text-base font-bold">就是今天 🎉</span>
                      ) : (
                        <>
                          <span className="text-xs opacity-80">还有</span>
                          <span className="text-xl font-bold leading-none">{days}</span>
                          <span className="text-xs opacity-80">天</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {slide.kind === 'placeholder' && (
                <div className="h-14 w-full rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">暂无可显示的横幅内容</span>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="上一张"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-background/70 backdrop-blur-sm text-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 hidden md:flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="下一张"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-background/70 backdrop-blur-sm text-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 hidden md:flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === activeSlide ? 'w-3 bg-white/90' : 'w-1 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeBanner;
