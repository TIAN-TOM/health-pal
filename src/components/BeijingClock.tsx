
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getBeijingTime } from '@/utils/beijingTime';

const BeijingClock = () => {
  const [currentTime, setCurrentTime] = useState(getBeijingTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getBeijingTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' ' + weekday;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-sm border">
      <div className="flex items-center justify-center space-x-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-gray-800">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(currentTime)} (北京时间)
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeijingClock;
