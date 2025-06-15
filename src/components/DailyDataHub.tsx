
import React from 'react';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarView from './CalendarView';
import HistoryView from './HistoryView';
import CheckinSection from './dailyData/CheckinSection';
import CheckinCalendarSection from './dailyData/CheckinCalendarSection';
import { useDailyCheckinData } from '@/hooks/useDailyCheckinData';

interface DailyDataHubProps {
  onBack: () => void;
}

const DailyDataHub = ({ onBack }: DailyDataHubProps) => {
  const {
    todayCheckin,
    setTodayCheckin,
    checkinDates,
    selectedDate,
    loadCheckinHistory,
    handleDateSelect
  } = useDailyCheckinData();

  const handleRecordClick = (record: any) => {
    console.log('记录被点击:', record);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <h1 className="text-xl font-bold text-gray-800">每日数据中心</h1>
        </div>

        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="checkin">每日打卡</TabsTrigger>
            <TabsTrigger value="calendar">日历视图</TabsTrigger>
            <TabsTrigger value="list">列表视图</TabsTrigger>
            <TabsTrigger value="checkin-calendar">打卡日历</TabsTrigger>
          </TabsList>

          <TabsContent value="checkin">
            <CheckinSection
              todayCheckin={todayCheckin}
              onCheckinSuccess={setTodayCheckin}
              onReloadHistory={loadCheckinHistory}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  历史数据列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryView onRecordClick={handleRecordClick} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin-calendar">
            <CheckinCalendarSection
              checkinDates={checkinDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DailyDataHub;
