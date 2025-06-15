
import React from 'react';
import { Smile, Frown, Meh } from 'lucide-react';

const CalendarLegend = () => {
  return (
    <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>已打卡</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>记录数量</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Smile className="h-4 w-4 text-green-500" />
          <span>心情好 (4-5分)</span>
        </div>
        <div className="flex items-center space-x-2">
          <Meh className="h-4 w-4 text-yellow-500" />
          <span>心情一般 (3分)</span>
        </div>
        <div className="flex items-center space-x-2">
          <Frown className="h-4 w-4 text-red-500" />
          <span>心情不好 (1-2分)</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
