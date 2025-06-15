
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface CalendarHeaderProps {
  monthName: string;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onRefresh: () => void;
  onDeleteAll: () => void;
  loading: boolean;
}

const CalendarHeader = ({
  monthName,
  onNavigateMonth,
  onGoToToday,
  onRefresh,
  onDeleteAll,
  loading
}: CalendarHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button onClick={onRefresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={onDeleteAll} variant="destructive" size="sm">
            清空记录
          </Button>
          <Button onClick={onGoToToday} variant="outline" size="sm">
            今天
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Button
          onClick={() => onNavigateMonth('prev')}
          variant="ghost"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-medium">{monthName}</h3>
        
        <Button
          onClick={() => onNavigateMonth('next')}
          variant="ghost"
          size="sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default CalendarHeader;
