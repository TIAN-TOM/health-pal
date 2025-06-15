
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCheckinHistory } from '@/services/dailyCheckinService';
import { format } from 'date-fns';

interface CheckinCalendarProps {
  onDateSelect?: (date: Date) => void;
  onBack?: () => void;
}

const CheckinCalendar = ({ onDateSelect, onBack }: CheckinCalendarProps) => {
  const [checkinDates, setCheckinDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    loadCheckinHistory();
  }, []);

  const loadCheckinHistory = async () => {
    try {
      // 获取更多天数的历史记录以显示在日历上
      const records = await getCheckinHistory(90); // 获取90天的记录
      const dates = records.map(record => new Date(record.checkin_date));
      setCheckinDates(dates);
    } catch (error) {
      console.error('加载打卡历史失败:', error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  // 检查某个日期是否有打卡记录
  const isCheckinDate = (date: Date) => {
    return checkinDates.some(checkinDate => 
      format(checkinDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">打卡日历</CardTitle>
        <p className="text-sm text-gray-600">绿色日期表示已打卡的日子</p>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
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
          disabled={(date) => date > new Date()}
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

export default CheckinCalendar;
