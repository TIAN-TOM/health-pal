
import React from 'react';
import UserWelcomeWithClock from '@/components/UserWelcomeWithClock';
import NavigationActions from '@/components/NavigationActions';
import EmergencyBanner from '@/components/EmergencyBanner';
import FunctionCards from '@/components/FunctionCards';
import AnnouncementDisplay from '@/components/AnnouncementDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Globe } from 'lucide-react';

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
        <UserWelcomeWithClock userDisplayName={userDisplayName} onSettingsClick={onSettingsClick} />
        
        <AnnouncementDisplay />
        
        <EmergencyBanner onEmergencyClick={onEmergencyClick} />
        
        <div className="grid grid-cols-2 gap-3">
          <FunctionCards onNavigate={onNavigate} />
          
          {/* 每日英语模块 */}
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
            onClick={() => onNavigate('daily-english', 'home')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-purple-600 mb-1">每日英语</h3>
              <p className="text-xs text-gray-600">名言·单词·听力</p>
            </CardContent>
          </Card>
        </div>
        
        {/* 使用手册快速入口 */}
        <Button 
          onClick={() => onNavigate('user-manual', 'home')} 
          variant="outline" 
          className="w-full bg-white/70 hover:bg-white/90 border-blue-200 text-blue-700 font-medium py-3"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          查看使用手册
        </Button>
        
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
