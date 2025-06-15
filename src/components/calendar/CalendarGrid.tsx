
import React from 'react';
import { Smile, Frown, Meh } from 'lucide-react';

interface DayData {
  date: string;
  hasCheckin: boolean;
  moodScore?: number;
  hasSymptoms: boolean;
  symptomCount: number;
}

interface CalendarGridProps {
  calendarDays: (DayData | null)[];
  today: string;
}

const CalendarGrid = ({ calendarDays, today }: CalendarGridProps) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getMoodIcon = (moodScore?: number) => {
    if (moodScore === undefined) return null;
    if (moodScore >= 4) return <Smile className="h-4 w-4 text-green-500" />;
    if (moodScore >= 3) return <Meh className="h-4 w-4 text-yellow-500" />;
    return <Frown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-4">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayData, index) => {
          if (!dayData) {
            return <div key={index} className="p-2 h-16"></div>;
          }
          
          const isToday = dayData.date === today;
          const dayNumber = new Date(dayData.date + 'T00:00:00').getDate();
          
          return (
            <div
              key={dayData.date}
              className={`
                p-2 h-16 border rounded-lg flex flex-col items-center justify-between
                ${isToday ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200'}
                ${dayData.hasCheckin ? 'bg-green-50' : ''}
                ${dayData.hasSymptoms ? 'bg-red-50' : ''}
              `}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                {dayNumber}
                {isToday && <div className="text-xs text-blue-600">今天</div>}
              </div>
              
              <div className="flex items-center space-x-1">
                {/* 心情图标 */}
                {getMoodIcon(dayData.moodScore)}
                
                {/* 打卡状态 */}
                {dayData.hasCheckin && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                
                {/* 症状计数 */}
                {dayData.symptomCount > 0 && (
                  <div className="text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {dayData.symptomCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
