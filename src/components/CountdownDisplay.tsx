import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, PartyPopper, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getActiveCountdownEvents, CountdownEvent } from '@/services/countdownService';
import { getBeijingTime } from '@/utils/beijingTime';
import { Button } from '@/components/ui/button';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// 主题颜色配置
const THEME_GRADIENTS: Record<string, { gradient: string; text: string; icon: string }> = {
  purple: { gradient: 'from-purple-100 via-violet-100 to-indigo-100', text: 'text-purple-600', icon: 'text-purple-500' },
  blue: { gradient: 'from-blue-100 via-cyan-100 to-sky-100', text: 'text-blue-600', icon: 'text-blue-500' },
  pink: { gradient: 'from-rose-100 via-pink-100 to-fuchsia-100', text: 'text-pink-600', icon: 'text-pink-500' },
  orange: { gradient: 'from-orange-100 via-amber-100 to-yellow-100', text: 'text-orange-600', icon: 'text-orange-500' },
  green: { gradient: 'from-emerald-100 via-green-100 to-teal-100', text: 'text-green-600', icon: 'text-green-500' },
  red: { gradient: 'from-red-100 via-rose-100 to-pink-100', text: 'text-red-600', icon: 'text-red-500' },
};

const CountdownDisplay = () => {
  const [countdowns, setCountdowns] = useState<CountdownEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const currentCountdown = countdowns && countdowns.length > 0 ? countdowns[currentIndex] : null;

  useEffect(() => {
    loadCountdown();
  }, []);

  useEffect(() => {
    if (currentCountdown) {
      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [currentCountdown]);

  const loadCountdown = async () => {
    try {
      const data = await getActiveCountdownEvents();
      setCountdowns(data);
    } catch (error) {
      console.error('Failed to load countdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : countdowns.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < countdowns.length - 1 ? prev + 1 : 0));
  };

  const calculateTimeLeft = () => {
    if (!currentCountdown) return;
    
    const now = getBeijingTime();
    const targetDate = new Date(currentCountdown.target_date);
    targetDate.setHours(23, 59, 59, 999);
    
    const diffTime = targetDate.getTime() - now.getTime();
    const totalSeconds = Math.floor(diffTime / 1000);
    
    if (totalSeconds <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: totalSeconds });
      return;
    }
    
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    setTimeLeft({ days, hours, minutes, seconds, total: totalSeconds });
  };

  if (loading) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 h-[140px] overflow-hidden">
        <CardContent className="p-3 flex flex-col items-center justify-center h-full">
          <Calendar className="h-6 w-6 text-purple-400 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (countdowns.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100 h-[140px] overflow-hidden border-slate-200">
        <CardContent className="p-3 flex flex-col items-center justify-center h-full">
          <Calendar className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-xs text-slate-600 text-center font-medium">暂无倒数日</p>
          <p className="text-xs text-slate-400 text-center mt-0.5">管理员可在后台设置</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentCountdown) return null;

  const isToday = timeLeft.days === 0 && timeLeft.hours < 24 && timeLeft.total > 0;
  const isPast = timeLeft.total <= 0;
  const isComingSoon = timeLeft.days <= 3 && timeLeft.total > 0;

  // 获取主题配置
  const themeColor = (currentCountdown as any).theme_color || 'purple';
  const backgroundImage = (currentCountdown as any).background_image;
  const theme = THEME_GRADIENTS[themeColor] || THEME_GRADIENTS.purple;

  // 根据不同状态选择渐变色
  const getGradientColors = () => {
    if (isPast) return 'from-gray-100 to-slate-200';
    if (isToday) return 'from-rose-100 via-pink-100 to-fuchsia-100';
    if (isComingSoon) return 'from-orange-100 via-amber-100 to-yellow-100';
    return theme.gradient;
  };

  const getTextColor = () => {
    if (isPast) return 'text-gray-600';
    if (isToday) return 'text-rose-600';
    if (isComingSoon) return 'text-orange-600';
    return theme.text;
  };

  const getIcon = () => {
    if (isPast) return <Calendar className="h-6 w-6 text-gray-400" />;
    if (isToday) return <PartyPopper className="h-6 w-6 text-rose-500 animate-bounce" />;
    if (isComingSoon) return <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />;
    return <Calendar className={`h-6 w-6 ${theme.icon}`} />;
  };

  const cardStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <Card
      className={`${!backgroundImage ? `bg-gradient-to-br ${getGradientColors()}` : ''} border-purple-200 h-[140px] overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300`}
      style={cardStyle}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"></div>
      )}
      <CardContent className="p-3 flex flex-col h-full relative z-10">
        {/* 标题区域和切换按钮 */}
        <div className="flex items-center justify-between mb-2">
          {countdowns.length > 1 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            getIcon()
          )}
          <h3 className={`text-xs font-bold ${getTextColor()} ${backgroundImage ? 'text-white drop-shadow-lg' : ''} text-center flex-1 mx-1.5 line-clamp-1`}>
            {currentCountdown.title}
          </h3>
          {countdowns.length > 1 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="w-5"></div>
          )}
        </div>

        {/* 时间显示区域 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {isPast ? (
            <div className="text-center space-y-0.5">
              <p className={`text-xl font-bold ${backgroundImage ? 'text-white' : 'text-gray-500'}`}>已结束</p>
              <p className={`text-xs ${backgroundImage ? 'text-white/80' : 'text-gray-400'}`}>
                已过去 {Math.abs(timeLeft.days)} 天
              </p>
            </div>
          ) : isToday ? (
            <div className="text-center space-y-1 animate-pulse">
              <p className={`text-2xl font-bold ${backgroundImage ? 'text-white drop-shadow-lg' : 'text-rose-600'}`}>就是今天！🎉</p>
              <div className={`flex items-center justify-center gap-1.5 ${backgroundImage ? 'text-white' : 'text-rose-500'}`}>
                <div className="text-center">
                  <p className="text-base font-bold">{String(timeLeft.hours).padStart(2, '0')}</p>
                  <p className="text-xs">时</p>
                </div>
                <span className="text-base font-bold">:</span>
                <div className="text-center">
                  <p className="text-base font-bold">{String(timeLeft.minutes).padStart(2, '0')}</p>
                  <p className="text-xs">分</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center w-full space-y-1">
              {/* 主要倒计时 - 天数 */}
              <div className="mb-1">
                <p className={`text-3xl font-bold ${getTextColor()} ${backgroundImage ? 'text-white drop-shadow-lg' : ''} leading-none`}>
                  {timeLeft.days}
                </p>
                <p className={`text-xs ${getTextColor()} ${backgroundImage ? 'text-white/90' : ''} mt-0.5`}>天</p>
              </div>
              
              {/* 小时 */}
              <div className="flex items-center justify-center gap-1 text-xs">
                <p className={`text-lg font-semibold ${getTextColor()} ${backgroundImage ? 'text-white drop-shadow-lg' : ''}`}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </p>
                <p className={`text-xs ${backgroundImage ? 'text-white/80' : 'text-gray-500'}`}>小时</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部描述信息 */}
        <div className="mt-auto">
          {currentCountdown.description && (
            <p className={`text-xs text-center ${backgroundImage ? 'text-white/90' : 'text-gray-600'} line-clamp-1 px-1`}>
              {currentCountdown.description}
            </p>
          )}
          {countdowns.length > 1 && (
            <p className={`text-xs text-center ${backgroundImage ? 'text-white/70' : 'text-gray-500'} mt-1`}>
              {currentIndex + 1}/{countdowns.length}
            </p>
          )}
        </div>
      </CardContent>
      
      {/* 背景装饰 */}
      {!isPast && !backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
      )}
    </Card>
  );
};

export default CountdownDisplay;
