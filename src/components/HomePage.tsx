
import React from 'react';
import UserWelcomeWithClock from '@/components/UserWelcomeWithClock';
import NavigationActions from '@/components/NavigationActions';
import EmergencyBanner from '@/components/EmergencyBanner';
import FunctionCards from '@/components/FunctionCards';
import DailyQuote from '@/components/DailyQuote';
import AnnouncementDisplay from '@/components/AnnouncementDisplay';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" ref={homeRef}>
      <div className="container mx-auto px-4 py-6 max-w-md">
        <UserWelcomeWithClock 
          userDisplayName={userDisplayName}
          onSettingsClick={onSettingsClick}
        />
        <AnnouncementDisplay />
        <EmergencyBanner onEmergencyClick={onEmergencyClick} />
        <FunctionCards onNavigate={onNavigate} />
        
        {/* 使用手册快速入口 */}
        <div className="mb-6">
          <Button
            onClick={() => onNavigate('user-manual', 'home')}
            variant="outline"
            className="w-full bg-white/70 hover:bg-white/90 border-blue-200 text-blue-700 font-medium py-3"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            查看使用手册
          </Button>
        </div>
        
        <DailyQuote />
        <NavigationActions 
          onDataExport={() => onNavigate("export")}
          onDailyData={() => onNavigate("daily-data")}
        />
      </div>
    </div>
  );
};

export default HomePage;
