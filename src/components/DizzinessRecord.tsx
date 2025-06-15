
import React, { useState } from 'react';
import { ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveDizzinessRecord } from '@/services/meniereRecordService';
import { useToast } from '@/hooks/use-toast';

interface DizzinessRecordProps {
  onBack: () => void;
}

const DizzinessRecord = ({ onBack }: DizzinessRecordProps) => {
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const durationOptions = [
    { value: '5分钟以内', label: '5分钟以内' },
    { value: '5-30分钟', label: '5-30分钟' },
    { value: '30分钟-2小时', label: '30分钟-2小时' },
    { value: '2小时以上', label: '2小时以上' },
  ];

  const severityOptions = [
    { value: 'mild', label: '轻微 - 生活影响较小' },
    { value: 'moderate', label: '中等 - 需要休息' },
    { value: 'severe', label: '严重 - 无法正常活动' },
  ];

  const symptomOptions = [
    '眩晕/头晕',
    '恶心/呕吐',
    '耳鸣',
    '听力下降',
    '耳胀满感',
    '头痛',
    '平衡失调',
    '冷汗',
  ];

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (!duration || !severity || symptoms.length === 0) {
      toast({
        title: "请完整填写信息",
        description: "持续时间、严重程度和症状都是必填项",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await saveDizzinessRecord({
        duration,
        severity,
        symptoms
      });
      
      toast({
        title: "记录保存成功",
        description: "眩晕症状已记录"
      });
      
      onBack();
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">记录眩晕症状</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              症状详情
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 持续时间 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                持续时间 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {durationOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={duration === option.value ? "default" : "outline"}
                    onClick={() => setDuration(option.value)}
                    className="text-left justify-start h-auto py-3 px-4"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 严重程度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                严重程度 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {severityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={severity === option.value ? "default" : "outline"}
                    onClick={() => setSeverity(option.value)}
                    className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal leading-relaxed"
                  >
                    <span className="block">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 伴随症状 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                伴随症状 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {symptomOptions.map((symptom) => (
                  <Button
                    key={symptom}
                    variant={symptoms.includes(symptom) ? "default" : "outline"}
                    onClick={() => toggleSymptom(symptom)}
                    size="sm"
                    className="h-auto py-2 px-3 text-sm leading-relaxed"
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
              {symptoms.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  已选择: {symptoms.join(', ')}
                </p>
              )}
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full py-6 text-lg"
            >
              {isSubmitting ? '保存中...' : '保存记录'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DizzinessRecord;
