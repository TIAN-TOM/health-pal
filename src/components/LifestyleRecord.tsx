
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { saveMeniereRecord } from '@/services/meniereRecordService';
import SleepSection from './lifestyle/SleepSection';
import DietSection from './lifestyle/DietSection';
import ExerciseSection from './lifestyle/ExerciseSection';
import MoodSection from './lifestyle/MoodSection';

interface LifestyleRecordProps {
  onBack: () => void;
  onNavigate?: (page: string, source?: string) => void;
}

const LifestyleRecord = ({ onBack, onNavigate }: LifestyleRecordProps) => {
  // 折叠状态管理
  const [sleepOpen, setSleepOpen] = useState(false);
  const [dietOpen, setDietOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  // 表单状态 - 移除默认时间
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [diet, setDiet] = useState<string[]>([]);
  const [customFood, setCustomFood] = useState('');
  const [saltPreference, setSaltPreference] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasAnyData = () => {
    return sleepHours || sleepQuality || bedTime || wakeTime ||
           waterIntake || exerciseType || exerciseDuration || stressLevel ||
           diet.length > 0 || saltPreference || note.trim();
  };

  const hasNoteData = () => {
    return note.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasAnyData()) {
      toast({
        title: "请填写至少一项信息",
        description: "请填写任意一项生活方式信息后再保存",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const recordData = {
        type: 'lifestyle' as const,
        sleep: sleepHours ? `${sleepHours}小时` : undefined,
        stress: stressLevel || undefined,
        diet: diet.length > 0 ? diet : undefined,
        note: note.trim() || undefined,
        data: {
          sleep_quality: sleepQuality || undefined,
          bed_time: bedTime || undefined,
          wake_time: wakeTime || undefined,
          water_intake: waterIntake ? `${waterIntake}杯` : undefined,
          exercise_type: exerciseType || undefined,
          exercise_duration: exerciseDuration ? `${exerciseDuration}分钟` : undefined,
          salt_preference: saltPreference || undefined
        }
      };

      await saveMeniereRecord(recordData);
      
      toast({
        title: "记录保存成功",
        description: "生活方式记录已保存"
      });
      
      onBack();
    } catch (error) {
      console.error('保存记录失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">记录饮食与作息</h1>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 提示：您可以选择填写任意一项或多项信息，不必全部填写。点击各个模块标题可以展开或收起。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SleepSection
            sleepOpen={sleepOpen}
            setSleepOpen={setSleepOpen}
            sleepHours={sleepHours}
            setSleepHours={setSleepHours}
            sleepQuality={sleepQuality}
            setSleepQuality={setSleepQuality}
            bedTime={bedTime}
            setBedTime={setBedTime}
            wakeTime={wakeTime}
            setWakeTime={setWakeTime}
          />

          <DietSection
            dietOpen={dietOpen}
            setDietOpen={setDietOpen}
            diet={diet}
            setDiet={setDiet}
            customFood={customFood}
            setCustomFood={setCustomFood}
            waterIntake={waterIntake}
            setWaterIntake={setWaterIntake}
            saltPreference={saltPreference}
            setSaltPreference={setSaltPreference}
          />

          <ExerciseSection
            exerciseOpen={exerciseOpen}
            setExerciseOpen={setExerciseOpen}
            exerciseType={exerciseType}
            setExerciseType={setExerciseType}
            exerciseDuration={exerciseDuration}
            setExerciseDuration={setExerciseDuration}
          />

          <MoodSection
            moodOpen={moodOpen}
            setMoodOpen={setMoodOpen}
            stressLevel={stressLevel}
            setStressLevel={setStressLevel}
          />

          {/* 备注 - 可折叠 */}
          <Card>
            <Collapsible open={noteOpen} onOpenChange={setNoteOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      备注（可选）
                      {hasNoteData() && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    {noteOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="记录其他相关信息，如：今天心情如何、有什么特殊情况等..."
                    rows={3}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '保存中...' : '保存记录'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LifestyleRecord;
