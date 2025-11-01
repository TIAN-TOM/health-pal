import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getActiveCountdownEvent, CountdownEvent } from '@/services/countdownService';
import { getBeijingTime } from '@/utils/beijingTime';

const CountdownDisplay = () => {
  const [countdown, setCountdown] = useState<CountdownEvent | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountdown();
  }, []);

  useEffect(() => {
    if (countdown) {
      calculateDaysLeft();
      const timer = setInterval(calculateDaysLeft, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const loadCountdown = async () => {
    try {
      const data = await getActiveCountdownEvent();
      setCountdown(data);
    } catch (error) {
      console.error('Failed to load countdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = () => {
    if (!countdown) return;
    
    const now = getBeijingTime();
    const targetDate = new Date(countdown.target_date);
    
    // Set both dates to midnight for accurate day calculation
    now.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysLeft(diffDays);
  };

  if (loading) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50 min-h-[110px]">
        <CardContent className="p-3 flex flex-col items-center justify-center h-full">
          <Clock className="h-6 w-6 text-purple-400 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!countdown) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50 min-h-[110px]">
        <CardContent className="p-3 flex flex-col items-center justify-center h-full">
          <Calendar className="h-6 w-6 text-purple-400 mb-2" />
          <p className="text-xs text-purple-600 text-center">暂无倒数日</p>
        </CardContent>
      </Card>
    );
  }

  const isToday = daysLeft === 0;
  const isPast = daysLeft < 0;

  return (
    <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 min-h-[110px]">
      <CardContent className="p-3 flex flex-col items-center justify-center h-full">
        <Calendar className="h-5 w-5 text-purple-600 mb-1" />
        <h3 className="text-xs font-semibold text-purple-800 text-center mb-1 line-clamp-1">
          {countdown.title}
        </h3>
        {isToday ? (
          <div className="text-center">
            <p className="text-xl font-bold text-pink-600">就是今天！</p>
            <p className="text-xs text-purple-600">🎉</p>
          </div>
        ) : isPast ? (
          <div className="text-center">
            <p className="text-lg font-bold text-gray-500">已过去</p>
            <p className="text-xs text-gray-400">{Math.abs(daysLeft)} 天</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{daysLeft}</p>
            <p className="text-xs text-purple-600">天</p>
          </div>
        )}
        {countdown.description && (
          <p className="text-xs text-purple-500 text-center mt-1 line-clamp-1">
            {countdown.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CountdownDisplay;
