
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { getBeijingTime } from '@/utils/beijingTime';
import { zhCN } from 'date-fns/locale';

interface CheckinCalendarSectionProps {
  checkinDates: Date[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const CheckinCalendarSection = ({ checkinDates, selectedDate, onDateSelect }: CheckinCalendarSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">打卡日历</CardTitle>
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
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>已打卡</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <span>未打卡</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckinCalendarSection;
