import React, { useState, useEffect, useMemo, memo } from 'react';
import { Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getBeijingTime } from '@/utils/beijingTime';
import { getFestivalForDate, getFestivalGreeting } from '@/data/festivals';

interface UserWelcomeWithClockProps {
  userDisplayName: string;
  onSettingsClick: () => void;
  onEmergencyClick: () => void;
}

const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const formatTime = (date: Date) =>
  date.toLocaleTimeString('zh-CN', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

const formatDate = (date: Date) =>
  date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' ' + weekdays[date.getDay()];

// 独立的时钟组件，每秒只更新自己，不重渲染父组件
const LiveClock = memo(() => {
  const [now, setNow] = useState(() => getBeijingTime());

  useEffect(() => {
    const tick = () => setNow(getBeijingTime());
    // 对齐到下一秒，减少抖动
    const delay = 1000 - (Date.now() % 1000);
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 1000);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
      <div className="flex items-center justify-center space-x-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <div className="text-center">
          <div className="text-base font-mono font-bold text-gray-800">
            {formatTime(now)}
          </div>
          <div className="text-xs text-gray-600">
            {formatDate(now)} (北京时间)
          </div>
        </div>
      </div>
    </div>
  );
});
LiveClock.displayName = 'LiveClock';

const UserWelcomeWithClock = ({ userDisplayName, onSettingsClick, onEmergencyClick }: UserWelcomeWithClockProps) => {
  // 问候语和 emoji 在挂载时计算一次（按当前小时），不需要每秒重算
  const { greeting, emoji } = useMemo(() => {
    const date = getBeijingTime();
    const hour = date.getHours();

    // 节日优先
    const festivals = getFestivalForDate(date);
    if (festivals.length > 0) {
      const festivalGreeting = getFestivalGreeting(festivals[0]);
      if (festivalGreeting) {
        const e = hour >= 6 && hour < 12 ? '🌅' : hour >= 12 && hour < 18 ? '☀️' : hour >= 18 && hour < 22 ? '🌆' : '🌙';
        return { greeting: festivalGreeting, emoji: e };
      }
    }

    const greetings = {
      dawn: ["夜深了，注意休息哦", "深夜时光，保重身体", "夜猫子，早点睡觉吧"],
      morning: ["早上好，新的一天开始了", "晨光正好，精神饱满", "早安，美好的一天", "清晨问候，愿你健康"],
      noon: ["中午好，记得吃午饭", "午间时光，稍作休息", "正午阳光，温暖如你", "午安，保持活力"],
      afternoon: ["下午好，继续加油", "午后时光，轻松惬意", "下午茶时间到了", "阳光正好，心情也好"],
      evening: ["晚上好，辛苦了一天", "夜幕降临，温馨时刻", "晚安时光，放松身心", "傍晚时分，享受宁静"],
      night: ["夜深了，该休息了", "晚安，好梦相伴", "深夜时光，注意身体", "夜晚宁静，早点休息"]
    };

    let timeGreetings;
    if (hour >= 0 && hour < 5) timeGreetings = greetings.dawn;
    else if (hour >= 5 && hour < 11) timeGreetings = greetings.morning;
    else if (hour >= 11 && hour < 13) timeGreetings = greetings.noon;
    else if (hour >= 13 && hour < 17) timeGreetings = greetings.afternoon;
    else if (hour >= 17 && hour < 20) timeGreetings = greetings.evening;
    else timeGreetings = greetings.night;

    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const text = timeGreetings[(dayOfYear + hour) % timeGreetings.length];
    const e = hour >= 6 && hour < 12 ? '🌅' : hour >= 12 && hour < 18 ? '☀️' : hour >= 18 && hour < 22 ? '🌆' : '🌙';
    return { greeting: text, emoji: e };
  }, []);

  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{emoji}</div>
            <div>
              <div className="text-base font-semibold leading-tight">
                {greeting}
              </div>
              <div className="text-sm text-muted-foreground">
                {userDisplayName} ✨
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEmergencyClick}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 h-8 text-xs font-medium"
              aria-label="我需要帮助"
            >
              🆘 帮助
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="hover:bg-primary/10"
              aria-label="设置"
            >
              <Settings className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>

        <LiveClock />
      </CardContent>
    </Card>
  );
};

export default memo(UserWelcomeWithClock);
