
import React from 'react';
import { Sun, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MoodSectionProps {
  moodOpen: boolean;
  setMoodOpen: (open: boolean) => void;
  stressLevel: string;
  setStressLevel: (level: string) => void;
}

const MoodSection = ({
  moodOpen,
  setMoodOpen,
  stressLevel,
  setStressLevel
}: MoodSectionProps) => {
  return (
    <Card>
      <Collapsible open={moodOpen} onOpenChange={setMoodOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Sun className="h-5 w-5 mr-2 text-yellow-600" />
                情绪与压力
                {stressLevel && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </div>
              {moodOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div>
              <Label htmlFor="stressLevel">压力程度</Label>
              <Select value={stressLevel} onValueChange={setStressLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="选择压力程度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无压力</SelectItem>
                  <SelectItem value="low">轻微压力</SelectItem>
                  <SelectItem value="moderate">中等压力</SelectItem>
                  <SelectItem value="high">较大压力</SelectItem>
                  <SelectItem value="severe">重度压力</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MoodSection;
