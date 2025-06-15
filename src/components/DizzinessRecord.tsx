import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clock, Save, Zap, ArrowLeft, ExternalLink } from 'lucide-react';
import { saveMeniereRecord } from '@/services/meniereRecordService';
import { useToast } from '@/hooks/use-toast';

interface DizzinessRecordProps {
  onBack: () => void;
}

const DizzinessRecord = ({ onBack }: DizzinessRecordProps) => {
  const [severity, setSeverity] = useState('轻度');
  const [duration, setDuration] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const severityOptions = [
    { value: '轻度', label: '轻度', color: 'bg-green-100 text-green-800' },
    { value: '中度', label: '中度', color: 'bg-yellow-100 text-yellow-800' },
    { value: '重度', label: '重度', color: 'bg-red-100 text-red-800' }
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
    '旋转性眩晕',
    '头晕',
    '恶心',
    '呕吐',
    '耳鸣',
    '听力下降',
    '耳胀感',
    '平衡失调'
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAIAssistant = (aiType: 'doubao' | 'deepseek') => {
    const symptoms_text = symptoms.join('、');
    const record_text = `我有梅尼埃症，刚才出现了${severity}眩晕症状，持续${duration}，伴随症状包括：${symptoms_text}。${note ? `详细说明：${note}` : ''}请给我一些建议和指导。`;
    
    if (aiType === 'doubao') {
      window.open('doubao://chat?text=' + encodeURIComponent(record_text), '_blank');
      setTimeout(() => {
        toast({
          title: "如果没有自动打开豆包APP",
          description: "请手动复制症状信息到豆包中咨询",
        });
      }, 1000);
    } else if (aiType === 'deepseek') {
      window.open('deepseek://chat?text=' + encodeURIComponent(record_text), '_blank');
      setTimeout(() => {
        toast({
          title: "如果没有自动打开DeepSeek APP",
          description: "请手动复制症状信息到DeepSeek中咨询",
        });
      }, 1000);
    }
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
        title: "记录保存成功 ✅",
        description: "眩晕症状记录已保存，继续关注您的健康",
      });

      // 重置表单
      setSeverity('轻度');
      setDuration('');
      setSymptoms([]);
      setNote('');
      
      onBack();
    } catch (error: any) {
      toast({
        title: "保存失败 ❌",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 返回按钮 */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">记录眩晕症状</h1>
        </div>

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
                        <span className={`text-xs px-2 py-1 rounded ${option.color}`}>
                          {option.label}
                        </span>
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
                  伴随症状（可多选）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {symptomOptions.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => handleSymptomToggle(symptom)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        symptoms.includes(symptom)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* 详细说明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细说明（可选）
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录症状细节、诱发因素、相关情况等..."
                  className="w-full"
                  rows={3}
                />
              </div>

              {/* AI助手按钮 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  AI健康助手咨询
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAIAssistant('doubao')}
                    className="flex items-center justify-center border-orange-300 text-orange-600 hover:border-orange-400"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    豆包AI
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAIAssistant('deepseek')}
                    className="flex items-center justify-center border-purple-300 text-purple-600 hover:border-purple-400"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    DeepSeek
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  点击按钮跳转到对应AI应用进行健康咨询
                </p>
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
