
import React, { useState, useEffect } from 'react';
import { Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getBeijingTime, getCurrentBeijingTime } from '@/utils/beijingTime';

interface UserWelcomeWithClockProps {
  userDisplayName: string;
  onSettingsClick: () => void;
}

const UserWelcomeWithClock = ({ userDisplayName, onSettingsClick }: UserWelcomeWithClockProps) => {
  const [currentTime, setCurrentTime] = useState(getBeijingTime());

  useEffect(() => {
    getCurrentBeijingTime();
    
    const timer = setInterval(() => {
      const newTime = getBeijingTime();
      setCurrentTime(newTime);
      
      if (newTime.getSeconds() === 0) {
        console.log('北京时间更新:', newTime.toISOString());
      }
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
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              欢迎, {userDisplayName}
            </h2>
          </div>
          
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div className="text-center">
              <div className="text-base font-mono font-bold text-gray-800">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-gray-600">
                {formatDate(currentTime)} (北京时间)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserWelcomeWithClock;
