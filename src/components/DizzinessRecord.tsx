
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DizzinessRecordProps {
  onBack: () => void;
}

const DizzinessRecord = ({ onBack }: DizzinessRecordProps) => {
  const [duration, setDuration] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    if (!duration || !severity) {
      toast({
        title: "请完善信息",
        description: "请选择持续时间和严重程度",
        variant: "destructive"
      });
      return;
    }

    // 保存记录到本地存储（后续可连接Supabase）
    const record = {
      type: 'dizziness',
      timestamp: new Date().toISOString(),
      duration,
      severity,
      symptoms
    };

    const existingRecords = JSON.parse(localStorage.getItem('meniereRecords') || '[]');
    existingRecords.push(record);
    localStorage.setItem('meniereRecords', JSON.stringify(existingRecords));

    toast({
      title: "记录已保存",
      description: "眩晕症状已成功记录",
    });

    onBack();
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
                持续时间
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'short', label: '半小时内' },
                  { value: 'medium', label: '一小时左右' },
                  { value: 'long', label: '很久' }
                ].map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setDuration(option.value)}
                    variant={duration === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      duration === option.value 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border-2 hover:border-blue-300'
                    }`}
                  >
                    {duration === option.value && (
                      <Check className="mr-2 h-5 w-5" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 严重程度 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                严重程度
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'mild', label: '有点晕' },
                  { value: 'moderate', label: '比较难受' },
                  { value: 'severe', label: '天旋地转' }
                ].map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setSeverity(option.value)}
                    variant={severity === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      severity === option.value 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'border-2 hover:border-green-300'
                    }`}
                  >
                    {severity === option.value && (
                      <Check className="mr-2 h-5 w-5" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 伴随症状 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                伴随症状 (可多选)
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'nausea', label: '恶心' },
                  { value: 'tinnitus', label: '耳鸣加重' },
                  { value: 'headache', label: '头痛' },
                  { value: 'hearing', label: '听力下降' }
                ].map(option => (
                  <Button
                    key={option.value}
                    onClick={() => toggleSymptom(option.value)}
                    variant={symptoms.includes(option.value) ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      symptoms.includes(option.value)
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'border-2 hover:border-purple-300'
                    }`}
                  >
                    {symptoms.includes(option.value) && (
                      <Check className="mr-2 h-5 w-5" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 保存按钮 */}
            <Button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl py-6 rounded-lg mt-8"
            >
              保存记录
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DizzinessRecord;
