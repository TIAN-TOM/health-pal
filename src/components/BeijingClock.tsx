
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const BeijingClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 获取正确的北京时间 (UTC+8)
  const getBeijingTime = () => {
    const now = new Date();
    // 获取UTC时间戳，然后加上8小时（北京时间是UTC+8）
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const beijingTime = new Date(utcTime + (8 * 60 * 60 * 1000));
    return beijingTime;
  };

  const beijingTime = getBeijingTime();
  
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

  console.log('北京时钟显示时间:', beijingTime.toISOString(), '本地时间:', new Date().toISOString());

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-sm border">
      <div className="flex items-center justify-center space-x-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-gray-800">
            {formatTime(beijingTime)}
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(beijingTime)} (北京时间)
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeijingClock;
