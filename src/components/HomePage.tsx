
import React from 'react';
import UserWelcomeWithClock from '@/components/UserWelcomeWithClock';
import NavigationActions from '@/components/NavigationActions';
import CountdownDisplay from '@/components/CountdownDisplay';
import WeatherWidget from '@/components/WeatherWidget';
import FunctionCards from '@/components/FunctionCards';
import AnnouncementDisplay from '@/components/AnnouncementDisplay';
import { Button } from '@/components/ui/button';
import { BookOpen, History } from 'lucide-react';

interface HomePageProps {
  userDisplayName: string;
  onSettingsClick: () => void;
  onEmergencyClick: () => void;
  onNavigate: (page: string, source?: string) => void;
  homeRef: React.RefObject<HTMLDivElement>;
}

const HomePage = ({
  userDisplayName,
  onSettingsClick,
  onEmergencyClick,
  onNavigate,
  homeRef
}: HomePageProps) => {
  const handleDeveloperClick = () => {
    window.open('https://www.linkedin.com/in/tom-tian-317580257/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" ref={homeRef}>
      <div className="container mx-auto px-4 py-3 max-w-md space-y-3">
        <UserWelcomeWithClock 
          userDisplayName={userDisplayName} 
          onSettingsClick={onSettingsClick}
          onEmergencyClick={onEmergencyClick}
        />
        
        <AnnouncementDisplay />
        
        {/* 天气和倒数日 */}
        <div className="grid grid-cols-2 gap-3">
          <WeatherWidget />
          <CountdownDisplay />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <FunctionCards onNavigate={onNavigate} />
        </div>
        
        {/* 使用手册和更新日志快速入口 */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => onNavigate('user-manual', 'home')} 
            variant="outline" 
            className="bg-white/70 hover:bg-white/90 border-blue-200 text-blue-700 font-medium py-3"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            使用手册
          </Button>
          
          <Button 
            onClick={() => onNavigate('update-log', 'home')} 
            variant="outline" 
            className="bg-white/70 hover:bg-white/90 border-green-200 text-green-700 font-medium py-3"
          >
            <History className="h-4 w-4 mr-2" />
            更新日志
          </Button>
        </div>
        
        <NavigationActions 
          onDataExport={() => onNavigate("export")} 
          onDailyData={() => onNavigate("daily-data")} 
        />
        
        {/* 版权信息 - 缩减上方间距 */}
        <div className="pt-1 pb-4 text-center">
          <div className="h-px bg-gray-200 mb-2"></div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>© 2025 健康生活伴侣 - 专注于日常健康管理</div>
            <div>本应用仅供参考，不能替代专业医疗建议</div>
            <div>如有严重症状请及时就医</div>
            <div className="mt-2">
              开发者：
              <button 
                onClick={handleDeveloperClick} 
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                田雨顺
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
