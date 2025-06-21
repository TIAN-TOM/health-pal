
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { getBeijingTime } from '@/utils/beijingTime';
import { zhCN } from 'date-fns/locale';
import { Flame } from 'lucide-react';
import { useCheckinStreak } from '@/hooks/useCheckinStreak';

interface CheckinCalendarSectionProps {
  checkinDates: Date[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const CheckinCalendarSection = ({ checkinDates, selectedDate, onDateSelect }: CheckinCalendarSectionProps) => {
  const { streakDays, loading } = useCheckinStreak();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>打卡日历</span>
          {!loading && (
            <div className="flex items-center space-x-2 text-orange-600">
              <Flame className="h-5 w-5" />
              <span className="text-sm font-medium">
                连续打卡 {streakDays} 天
              </span>
            </div>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">绿色日期表示已打卡的日子</p>
      </CardHeader>
      <CardContent>
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="rounded-md border w-full"
          modifiers={{
            checkin: checkinDates,
          }}
          modifiersStyles={{
            checkin: {
              backgroundColor: '#22c55e',
              color: 'white',
              fontWeight: 'bold',
            },
          }}
          disabled={(date) => date > getBeijingTime()}
          locale={zhCN}
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>已打卡</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <span>未打卡</span>
            </div>
          </div>
          {streakDays > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center text-orange-800">
                <Flame className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {streakDays >= 7 ? '太棒了！' : '继续加油！'}已连续打卡 {streakDays} 天
                  {streakDays >= 7 && '，坚持就是胜利！'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckinCalendarSection;
