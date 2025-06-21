
import React from 'react';
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
  const hasSleepData = sleepHours || sleepQuality || bedTime !== '22:00' || wakeTime !== '07:00';

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
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="例如：7.5"
              />
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
