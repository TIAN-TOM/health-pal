
import React from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ExerciseSectionProps {
  exerciseOpen: boolean;
  setExerciseOpen: (open: boolean) => void;
  exerciseType: string;
  setExerciseType: (type: string) => void;
  exerciseDuration: string;
  setExerciseDuration: (duration: string) => void;
}

const ExerciseSection = ({
  exerciseOpen,
  setExerciseOpen,
  exerciseType,
  setExerciseType,
  exerciseDuration,
  setExerciseDuration
}: ExerciseSectionProps) => {
  const exerciseOptions = [
    '散步', '慢跑', '快走', '游泳', '骑车',
    '瑜伽', '太极', '健身房', '跳舞', '球类运动',
    '爬山', '家务劳动', '其他'
  ];

  const hasExerciseData = exerciseType || exerciseDuration;

  return (
    <Card>
      <Collapsible open={exerciseOpen} onOpenChange={setExerciseOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                运动情况
                {hasExerciseData && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </div>
              {exerciseOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="exerciseType">运动类型</Label>
              <Select value={exerciseType} onValueChange={setExerciseType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择运动类型" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseOptions.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exerciseDuration">运动时长（分钟）</Label>
              <Input
                id="exerciseDuration"
                type="number"
                min="0"
                max="480"
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(e.target.value)}
                placeholder="例如：30"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ExerciseSection;
