
import React, { useState, useEffect } from 'react';
import { Smile, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTodayCheckin } from '@/services/dailyCheckinService';

interface CheckinStatusProps {
  onCheckinClick: () => void;
}

const CheckinStatus = ({ onCheckinClick }: CheckinStatusProps) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    try {
      const checkin = await getTodayCheckin();
      setHasCheckedIn(!!checkin);
    } catch (error) {
      console.error('检查打卡状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {hasCheckedIn ? (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Smile className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-700">今日已打卡</div>
              <div className="text-sm text-green-600">感谢记录今天的美好 😊</div>
            </div>
          </div>
        ) : (
          <Button 
            onClick={onCheckinClick}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-lg"
          >
            <Smile className="h-5 w-5 mr-2" />
            <div className="text-center">
              <div className="font-medium">今天你微笑了吗？</div>
              <div className="text-sm opacity-90">点击每日打卡</div>
            </div>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckinStatus;
