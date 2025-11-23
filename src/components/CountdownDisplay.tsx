import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, PartyPopper, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getActiveCountdownEvents, CountdownEvent } from '@/services/countdownService';
import { getBeijingTime } from '@/utils/beijingTime';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownDisplay = () => {
  const [countdowns, setCountdowns] = useState<CountdownEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

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
      setProgress(100);
      return;
    }
    
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    setTimeLeft({ days, hours, minutes, seconds, total: totalSeconds });
    
    if (currentCountdown.created_at) {
      const startDate = new Date(currentCountdown.created_at);
      const totalDuration = targetDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgress(progressPercent);
    }
  };

  if (loading) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 h-[140px] overflow-hidden">
        <CardContent className="p-3 flex flex-col items-center justify-center h-full">
          <Clock className="h-6 w-6 text-purple-400 animate-pulse" />
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

  // 根据不同状态选择渐变色
  const getGradientColors = () => {
    if (isPast) return 'from-gray-100 to-slate-200';
    if (isToday) return 'from-rose-100 via-pink-100 to-fuchsia-100';
    if (isComingSoon) return 'from-orange-100 via-amber-100 to-yellow-100';
    return 'from-purple-100 via-violet-100 to-indigo-100';
  };

  const getTextColor = () => {
    if (isPast) return 'text-gray-600';
    if (isToday) return 'text-rose-600';
    if (isComingSoon) return 'text-orange-600';
    return 'text-purple-600';
  };

  const getIcon = () => {
    if (isPast) return <Calendar className="h-6 w-6 text-gray-400" />;
    if (isToday) return <PartyPopper className="h-6 w-6 text-rose-500 animate-bounce" />;
    if (isComingSoon) return <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />;
    return <Calendar className="h-6 w-6 text-purple-500" />;
  };

  return (
    <Card className={`bg-gradient-to-br ${getGradientColors()} border-purple-200 h-[140px] overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300`}>
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
          <h3 className={`text-xs font-bold ${getTextColor()} text-center flex-1 mx-1.5 line-clamp-1`}>
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
              <p className="text-xl font-bold text-gray-500">已结束</p>
              <p className="text-xs text-gray-400">
                已过去 {Math.abs(timeLeft.days)} 天
              </p>
            </div>
          ) : isToday ? (
            <div className="text-center space-y-1 animate-pulse">
              <p className="text-2xl font-bold text-rose-600">就是今天！🎉</p>
              <div className="flex items-center justify-center gap-1.5 text-rose-500">
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
                <p className={`text-3xl font-bold ${getTextColor()} leading-none`}>
                  {timeLeft.days}
                </p>
                <p className={`text-xs ${getTextColor()} mt-0.5`}>天</p>
              </div>
              
              {/* 小时 */}
              <div className="flex items-center justify-center gap-1 text-xs">
                <p className={`text-lg font-semibold ${getTextColor()}`}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </p>
                <p className="text-xs text-gray-500">小时</p>
              </div>
            </div>
          )}
        </div>

        {/* 描述、进度条和指示器 */}
        <div className="mt-2 space-y-1">
          {currentCountdown.description && (
            <p className="text-xs text-center text-gray-600 line-clamp-1 px-1">
              {currentCountdown.description}
            </p>
          )}
          {!isPast && (
            <div className="space-y-0.5">
              <Progress value={progress} className="h-1" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{progress.toFixed(0)}% 完成</span>
                {countdowns.length > 1 && (
                  <span className="text-gray-500">{currentIndex + 1}/{countdowns.length}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* 背景装饰 */}
      {!isPast && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
      )}
    </Card>
  );
};

export default CountdownDisplay;
