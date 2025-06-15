
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clock, Save, Zap } from 'lucide-react';
import { saveMeniereRecord } from '@/services/meniereRecordService';
import { useToast } from '@/hooks/use-toast';

interface DizzinessRecordProps {
  onSave: () => void;
}

const DizzinessRecord = ({ onSave }: DizzinessRecordProps) => {
  const [severity, setSeverity] = useState('轻度');
  const [duration, setDuration] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const severityOptions = [
    { value: '轻度', label: '轻度', emoji: '😌', color: 'bg-green-100 text-green-800' },
    { value: '中度', label: '中度', emoji: '😐', color: 'bg-yellow-100 text-yellow-800' },
    { value: '重度', label: '重度', emoji: '😵', color: 'bg-red-100 text-red-800' }
  ];

  const durationOptions = [
    '不到5分钟',
    '5-15分钟',
    '15-30分钟',
    '30分钟-1小时',
    '1-2小时',
    '超过2小时'
  ];

  const symptomOptions = [
    { value: '旋转性眩晕', emoji: '🌪️' },
    { value: '头晕', emoji: '😵‍💫' },
    { value: '恶心', emoji: '🤢' },
    { value: '呕吐', emoji: '🤮' },
    { value: '耳鸣', emoji: '👂' },
    { value: '听力下降', emoji: '🔇' },
    { value: '耳胀感', emoji: '💨' },
    { value: '平衡失调', emoji: '⚖️' }
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const recordData = {
        type: 'dizziness' as const,
        severity,
        duration,
        symptoms,
        note: note.trim() || undefined,
        data: {
          severity,
          duration,
          symptoms,
          note: note.trim() || undefined
        }
      };

      await saveMeniereRecord(recordData);
      
      toast({
        title: "✅ 记录保存成功",
        description: "眩晕症状记录已保存，继续关注您的健康",
      });

      // 重置表单
      setSeverity('轻度');
      setDuration('');
      setSymptoms([]);
      setNote('');
      
      onSave();
    } catch (error: any) {
      toast({
        title: "❌ 保存失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              记录眩晕症状
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 严重程度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Zap className="h-4 w-4 inline mr-1" />
                  症状严重程度
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {severityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSeverity(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        severity === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{option.emoji}</span>
                          <span className={`text-xs px-2 py-1 rounded ${option.color}`}>
                            {option.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 持续时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="h-4 w-4 inline mr-1" />
                  持续时间
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDuration(option)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        duration === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* 伴随症状 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  💫 伴随症状（可多选）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {symptomOptions.map((symptom) => (
                    <button
                      key={symptom.value}
                      type="button"
                      onClick={() => handleSymptomToggle(symptom.value)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        symptoms.includes(symptom.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{symptom.emoji}</span>
                        <span>{symptom.value}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 备注说明（可选）
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录症状细节、诱发因素等..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading || !duration}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? '保存中...' : '保存记录'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DizzinessRecord;
