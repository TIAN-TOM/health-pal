
import React, { useState, useEffect } from 'react';
import { Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getBeijingTime, getCurrentBeijingTime } from '@/utils/beijingTime';
import { getFestivalForDate, getFestivalGreeting } from '@/data/festivals';

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

  const getGreeting = (date: Date) => {
    // 首先检查是否有节日
    const festivals = getFestivalForDate(date);
    if (festivals.length > 0) {
      // 优先返回第一个节日的问候语
      const festivalGreeting = getFestivalGreeting(festivals[0]);
      if (festivalGreeting) {
        return festivalGreeting;
      }
    }
    
    // 如果没有节日，返回常规时间问候
    const hour = date.getHours();
    const greetings = {
      dawn: ["夜深了，注意休息哦", "深夜时光，保重身体", "夜猫子，早点睡觉吧"],
      morning: ["早上好，新的一天开始了", "晨光正好，精神饱满", "早安，美好的一天", "清晨问候，愿你健康"],
      noon: ["中午好，记得吃午饭", "午间时光，稍作休息", "正午阳光，温暖如你", "午安，保持活力"],
      afternoon: ["下午好，继续加油", "午后时光，轻松惬意", "下午茶时间到了", "阳光正好，心情也好"],
      evening: ["晚上好，辛苦了一天", "夜幕降临，温馨时刻", "晚安时光，放松身心", "傍晚时分，享受宁静"],
      night: ["夜深了，该休息了", "晚安，好梦相伴", "深夜时光，注意身体", "夜晚宁静，早点休息"]
    };

    let timeGreetings;
    if (hour >= 0 && hour < 5) {
      timeGreetings = greetings.dawn;
    } else if (hour >= 5 && hour < 11) {
      timeGreetings = greetings.morning;
    } else if (hour >= 11 && hour < 13) {
      timeGreetings = greetings.noon;
    } else if (hour >= 13 && hour < 17) {
      timeGreetings = greetings.afternoon;
    } else if (hour >= 17 && hour < 20) {
      timeGreetings = greetings.evening;
    } else {
      timeGreetings = greetings.night;
    }

    // 根据当前时间生成一个稳定的随机索引
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const randomIndex = (dayOfYear + hour) % timeGreetings.length;
    return timeGreetings[randomIndex];
  };

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

  const getTimeEmoji = (date: Date) => {
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 18) return '☀️';
    if (hour >= 18 && hour < 22) return '🌆';
    return '🌙';
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mr-2">{getTimeEmoji(currentTime)}</span>
              {getGreeting(currentTime)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {userDisplayName} ✨
            </p>
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
