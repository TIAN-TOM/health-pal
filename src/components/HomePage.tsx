
import React from 'react';
import UserWelcomeWithClock from '@/components/UserWelcomeWithClock';
import NavigationActions from '@/components/NavigationActions';
import EmergencyBanner from '@/components/EmergencyBanner';
import FunctionCards from '@/components/FunctionCards';
import DailyQuote from '@/components/DailyQuote';
import AnnouncementDisplay from '@/components/AnnouncementDisplay';

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
