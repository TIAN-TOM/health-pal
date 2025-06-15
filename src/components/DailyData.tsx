
import React, { useState } from 'react';
import { ArrowLeft, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HistoryView from './HistoryView';
import CalendarView from './CalendarView';

interface DailyDataProps {
  onBack: () => void;
}

const DailyData = ({ onBack }: DailyDataProps) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回
        </Button>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => setViewMode('calendar')}
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            日历视图
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
          >
            <List className="h-4 w-4 mr-2" />
            列表视图
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {viewMode === 'calendar' ? (
          <CalendarView />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                历史数据列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryView />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DailyData;
