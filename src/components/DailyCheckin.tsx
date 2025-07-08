
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CheckinSection from './dailyData/CheckinSection';
import CheckinCalendarSection from './dailyData/CheckinCalendarSection';
import { useDailyCheckinData } from '@/hooks/useDailyCheckinData';

interface DailyCheckinProps {
  onBack: () => void;
  onNavigateToRecords?: () => void;
}

const DailyCheckin = ({ onBack, onNavigateToRecords }: DailyCheckinProps) => {
  const {
    todayCheckin,
    setTodayCheckin,
    checkinDates,
    selectedDate,
    loadCheckinHistory,
    handleDateSelect
  } = useDailyCheckinData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 返回按钮 */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">每日打卡</h1>
        </div>

        {/* 打卡状态卡片 */}
        <div className="mb-6">
          <CheckinSection
            todayCheckin={todayCheckin}
            onCheckinSuccess={setTodayCheckin}
            onReloadHistory={loadCheckinHistory}
            onNavigateToRecords={onNavigateToRecords}
          />
        </div>

        {/* 打卡日历 */}
        <CheckinCalendarSection
          checkinDates={checkinDates}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </div>
    </div>
  );
};

export default DailyCheckin;
