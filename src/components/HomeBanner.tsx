import React, { useEffect, useMemo, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Droplets, Loader2, PartyPopper, Pause, Play, Sparkles, Wind } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { CITIES, City, getWeatherData, WeatherData } from '@/services/weatherService';
import { CountdownEvent, getActiveCountdownEvents } from '@/services/countdownService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getBeijingDateString } from '@/utils/beijingTime';

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

// 纯日历日运算：避免本地时区与 UTC 午夜混用导致东时区恒多算 1 天。
const dayToUtcMs = (day: string): number => {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

const computeDaysLeft = (targetDateStr: string): number => {
  const targetDay = targetDateStr.split('T')[0]; // YYYY-MM-DD
  const todayDay = getBeijingDateString();
  return Math.round((dayToUtcMs(targetDay) - dayToUtcMs(todayDay)) / 86400000);
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
  const [isPlaying, setIsPlaying] = useState(true);

  const autoplay = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
    []
  );

  const toggleAutoplay = () => {
    if (autoplay.isPlaying()) {
      autoplay.stop();
      setIsPlaying(false);
    } else {
      autoplay.play();
      setIsPlaying(true);
    }
  };

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
        // 按北京日界比较 YYYY-MM-DD（字典序即日期序），当天事件保留以显示"就是今天"。
        const todayDay = getBeijingDateString();
        const active = data.filter((c) => c.target_date.split('T')[0] >= todayDay);
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

  // 自动播放被插件停止/恢复时（如拖动、鼠标悬停），同步暂停/播放按钮状态
  useEffect(() => {
    if (!api) return;
    const onStop = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    api.on('autoplay:stop', onStop);
    api.on('autoplay:play', onPlay);
    return () => {
      api.off('autoplay:stop', onStop);
      api.off('autoplay:play', onPlay);
    };
  }, [api]);

  const slides = useMemo(() => {
    const list: Array<
      | { kind: 'weather'; data: WeatherData; city: City }
      | { kind: 'countdown'; data: CountdownEvent }
    > = [];
    if (weather && selectedCity) {
      list.push({ kind: 'weather', data: weather, city: selectedCity });
    }
    countdowns.forEach((c) => list.push({ kind: 'countdown', data: c }));
    return list;
  }, [weather, selectedCity, countdowns]);

  if ((weatherLoading && !weather) || (countdownLoading && countdowns.length === 0)) {
    return (
      <div className="h-14 w-full rounded-lg bg-blue-500 text-white shadow-md flex items-center justify-center gap-2" role="status" aria-label="天气加载中">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs font-medium">天气加载中...</span>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const hasMultipleSlides = slides.length > 1;
  // 多张轮播时给两侧留出空间，避免内容被始终可见的箭头遮挡
  const slidePadding = hasMultipleSlides ? 'px-12' : 'px-4';

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{ loop: hasMultipleSlides, align: 'start' }}
        plugins={hasMultipleSlides ? [autoplay] : []}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, idx) => (
            <CarouselItem key={idx} className="pl-0 basis-full">
              {slide.kind === 'weather' && (
                <button
                  type="button"
                  onClick={() => navigate('/weather')}
                  className={`h-14 w-full rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-between ${slidePadding}`}
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
                    className={`h-14 w-full rounded-lg ${bg} shadow-md flex items-center justify-between ${slidePadding}`}
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

            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {hasMultipleSlides && (
        <>
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="上一张"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-colors hover:bg-background active:bg-background flex items-center justify-center"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="下一张"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-colors hover:bg-background active:bg-background flex items-center justify-center"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {hasMultipleSlides && (
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

      {hasMultipleSlides && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleAutoplay}
            aria-label={isPlaying ? '暂停轮播' : '播放轮播'}
            className="mt-1 flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? '暂停' : '播放'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeBanner;
