
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveDizzinessRecord } from '@/services/meniereRecordService';

interface DizzinessRecordProps {
  onBack: () => void;
}

const DizzinessRecord = ({ onBack }: DizzinessRecordProps) => {
  const [duration, setDuration] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const durationOptions = [
    { value: 'very_short', label: '几分钟', emoji: '⏱️' },
    { value: 'short', label: '10-20分钟', emoji: '⏰' },
    { value: 'medium', label: '半小时左右', emoji: '🕐' },
    { value: 'long', label: '1-2小时', emoji: '🕑' },
    { value: 'very_long', label: '2小时以上', emoji: '🕕' },
    { value: 'all_day', label: '整天都不舒服', emoji: '📅' }
  ];

  const severityOptions = [
    { value: 'mild', label: '轻微', emoji: '😌', desc: '有点不适，能正常活动' },
    { value: 'moderate', label: '中等', emoji: '😐', desc: '比较难受，需要休息' },
    { value: 'severe', label: '严重', emoji: '😣', desc: '很难受，无法站立' },
    { value: 'very_severe', label: '极严重', emoji: '🤢', desc: '非常痛苦，呕吐不止' }
  ];

  const symptomOptions = [
    { value: 'spinning', label: '天旋地转', emoji: '🌪️' },
    { value: 'nausea', label: '恶心想吐', emoji: '🤢' },
    { value: 'vomiting', label: '呕吐了', emoji: '🤮' },
    { value: 'hearing_loss', label: '听力下降', emoji: '👂' },
    { value: 'tinnitus', label: '耳鸣', emoji: '🔊' },
    { value: 'ear_fullness', label: '耳朵闷胀', emoji: '😖' },
    { value: 'headache', label: '头痛', emoji: '🤕' },
    { value: 'sweating', label: '出冷汗', emoji: '💦' },
    { value: 'pale', label: '脸色发白', emoji: '😰' },
    { value: 'palpitation', label: '心跳加快', emoji: '💓' }
  ];

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!duration || !severity) {
      toast({
        title: "请完成必填信息",
        description: "请选择眩晕持续时间和严重程度",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveDizzinessRecord({
        duration,
        severity,
        symptoms
      });

      toast({
        title: "记录已保存",
        description: "眩晕记录已成功保存到数据库",
      });

      onBack();
    } catch (error) {
      console.error('保存记录失败:', error);
      toast({
        title: "保存失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回
        </Button>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              记录眩晕症状
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 持续时间 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                大概晕了多久？ <span className="text-red-500">*</span>
              </h3>
              <div className="grid gap-3">
                {durationOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setDuration(option.value)}
                    variant={duration === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg justify-start ${
                      duration === option.value 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border-2 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-2xl mr-3">{option.emoji}</span>
                    {option.label}
                    {duration === option.value && (
                      <Check className="ml-auto h-5 w-5" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* 严重程度 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                有多难受？ <span className="text-red-500">*</span>
              </h3>
              <div className="grid gap-3">
                {severityOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setSeverity(option.value)}
                    variant={severity === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      severity === option.value 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'border-2 hover:border-red-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <span className="text-2xl mr-2">{option.emoji}</span>
                        <span className="font-medium">{option.label}</span>
                        {severity === option.value && (
                          <Check className="ml-2 h-5 w-5" />
                        )}
                      </div>
                      <span className="text-sm opacity-75">{option.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 具体症状 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                还有哪些症状？ (可多选)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {symptomOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => toggleSymptom(option.value)}
                    variant={symptoms.includes(option.value) ? "default" : "outline"}
                    className={`p-4 h-auto ${
                      symptoms.includes(option.value) 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'border-2 hover:border-green-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">{option.emoji}</span>
                      <span className="text-sm text-center">{option.label}</span>
                      {symptoms.includes(option.value) && (
                        <Check className="mt-1 h-4 w-4" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 温馨提示 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 温馨提示：记录症状有助于医生了解病情变化，如症状严重请及时就医
              </p>
            </div>

            {/* 保存按钮 */}
            <Button
              onClick={handleSave}
              disabled={isLoading || !duration || !severity}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl py-6 rounded-lg mt-8"
            >
              {isLoading ? '保存中...' : '保存记录'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DizzinessRecord;
