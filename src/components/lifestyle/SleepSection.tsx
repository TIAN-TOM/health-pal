
import React, { useEffect } from 'react';
import { Bed, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SleepSectionProps {
  sleepOpen: boolean;
  setSleepOpen: (open: boolean) => void;
  sleepHours: string;
  setSleepHours: (hours: string) => void;
  sleepQuality: string;
  setSleepQuality: (quality: string) => void;
  bedTime: string;
  setBedTime: (time: string) => void;
  wakeTime: string;
  setWakeTime: (time: string) => void;
}

const SleepSection = ({
  sleepOpen,
  setSleepOpen,
  sleepHours,
  setSleepHours,
  sleepQuality,
  setSleepQuality,
  bedTime,
  setBedTime,
  wakeTime,
  setWakeTime
}: SleepSectionProps) => {
  // 只有在有实际数据时才显示绿点，不包括默认时间
  const hasSleepData = sleepHours || sleepQuality || 
    (bedTime !== '22:00' && bedTime !== '') || 
    (wakeTime !== '07:00' && wakeTime !== '');

  // 根据入睡时间和起床时间自动计算睡眠时长
  useEffect(() => {
    if (bedTime && wakeTime) {
      const [bedHour, bedMinute] = bedTime.split(':').map(Number);
      const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
      
      let bedTimeMinutes = bedHour * 60 + bedMinute;
      let wakeTimeMinutes = wakeHour * 60 + wakeMinute;
      
      // 如果起床时间早于睡觉时间，说明跨了一天
      if (wakeTimeMinutes <= bedTimeMinutes) {
        wakeTimeMinutes += 24 * 60; // 加上24小时
      }
      
      const sleepMinutes = wakeTimeMinutes - bedTimeMinutes;
      const sleepHoursCalc = sleepMinutes / 60;
      
      // 保留一位小数
      const sleepHoursStr = sleepHoursCalc.toFixed(1);
      
      // 只有在计算结果合理时才更新（0.5-24小时之间）
      if (sleepHoursCalc >= 0.5 && sleepHoursCalc <= 24) {
        setSleepHours(sleepHoursStr);
      }
    }
  }, [bedTime, wakeTime, setSleepHours]);

  return (
    <Card>
      <Collapsible open={sleepOpen} onOpenChange={setSleepOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bed className="h-5 w-5 mr-2 text-blue-600" />
                睡眠状况
                {hasSleepData && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </div>
              {sleepOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedTime">入睡时间</Label>
                <Input
                  id="bedTime"
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="wakeTime">起床时间</Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sleepHours">睡眠时长（小时）</Label>
              <Input
                id="sleepHours"
                type="number"
                min="0"
                max="24"
                step="0.1"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="自动计算"
                className="bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">根据入睡和起床时间自动计算</p>
            </div>

            <div>
              <Label htmlFor="sleepQuality">睡眠质量</Label>
              <Select value={sleepQuality} onValueChange={setSleepQuality}>
                <SelectTrigger>
                  <SelectValue placeholder="选择睡眠质量" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">非常好</SelectItem>
                  <SelectItem value="good">良好</SelectItem>
                  <SelectItem value="fair">一般</SelectItem>
                  <SelectItem value="poor">较差</SelectItem>
                  <SelectItem value="very-poor">很差</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SleepSection;
