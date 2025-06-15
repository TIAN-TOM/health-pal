
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveLifestyleRecord } from '@/services/meniereRecordService';

interface LifestyleRecordProps {
  onBack: () => void;
}

const LifestyleRecord = ({ onBack }: LifestyleRecordProps) => {
  const [diet, setDiet] = useState<string[]>([]);
  const [sleep, setSleep] = useState<string>('');
  const [stress, setStress] = useState<string>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const dietOptions = [
    { value: 'high_salt', label: '比较咸', emoji: '🧂' },
    { value: 'very_salty', label: '很咸', emoji: '🧂' },
    { value: 'coffee', label: '咖啡', emoji: '☕' },
    { value: 'tea', label: '浓茶', emoji: '🍵' },
    { value: 'alcohol', label: '酒类', emoji: '🍷' },
    { value: 'chocolate', label: '巧克力', emoji: '🍫' },
    { value: 'cheese', label: '奶酪', emoji: '🧀' },
    { value: 'processed_food', label: '腌制品', emoji: '🥓' },
    { value: 'spicy', label: '辛辣食物', emoji: '🌶️' },
    { value: 'sweet', label: '甜食', emoji: '🍰' },
    { value: 'msg', label: '外食', emoji: '🍜' },
    { value: 'low_salt', label: '清淡', emoji: '🥗' }
  ];

  const sleepOptions = [
    { value: 'excellent', label: '很好', emoji: '😴', desc: '一觉到天亮' },
    { value: 'good', label: '不错', emoji: '😊', desc: '基本睡够' },
    { value: 'fair', label: '一般', emoji: '😐', desc: '有点累' },
    { value: 'poor', label: '没睡好', emoji: '😴', desc: '睡眠不足' },
    { value: 'very_poor', label: '很差', emoji: '😫', desc: '失眠多梦' },
    { value: 'insomnia', label: '基本没睡', emoji: '😵', desc: '整夜失眠' }
  ];

  const stressOptions = [
    { value: 'very_low', label: '很放松', emoji: '😌', desc: '心情愉快' },
    { value: 'low', label: '轻松', emoji: '🙂', desc: '压力不大' },
    { value: 'moderate', label: '有点压力', emoji: '😐', desc: '有些担心' },
    { value: 'high', label: '压力较大', emoji: '😟', desc: '比较焦虑' },
    { value: 'very_high', label: '压力很大', emoji: '😰', desc: '非常焦虑' },
    { value: 'overwhelming', label: '压力巨大', emoji: '😫', desc: '感到崩溃' }
  ];

  const toggleDiet = (dietItem: string) => {
    setDiet(prev => 
      prev.includes(dietItem) 
        ? prev.filter(d => d !== dietItem)
        : [...prev, dietItem]
    );
  };

  const handleSave = async () => {
    if (!sleep || !stress) {
      toast({
        title: "请完成必填信息",
        description: "请选择睡眠质量和压力水平",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveLifestyleRecord({
        diet,
        sleep,
        stress,
        manualInput: note.trim() || undefined
      });

      toast({
        title: "记录已保存",
        description: "生活记录已成功保存到数据库",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 统一返回按钮位置 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">记录饮食与作息</h1>
          <div className="w-16"></div> {/* 占位符保持居中 */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              记录饮食与作息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 饮食记录 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                今天吃了什么？ (可多选)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {dietOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => toggleDiet(option.value)}
                    variant={diet.includes(option.value) ? "default" : "outline"}
                    className={`p-2 h-16 text-xs ${
                      diet.includes(option.value) 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'border-2 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center w-full">
                      <span className="text-lg mb-1">{option.emoji}</span>
                      <span className="text-xs text-center leading-tight">{option.label}</span>
                      {diet.includes(option.value) && (
                        <Check className="mt-1 h-3 w-3" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 睡眠质量 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                昨晚睡得怎么样？ <span className="text-red-500">*</span>
              </h3>
              <div className="grid gap-2">
                {sleepOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setSleep(option.value)}
                    variant={sleep === option.value ? "default" : "outline"}
                    className={`w-full py-3 ${
                      sleep === option.value 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border-2 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{option.emoji}</span>
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs opacity-75 mr-2">{option.desc}</span>
                        {sleep === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 压力水平 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                今天压力大吗？ <span className="text-red-500">*</span>
              </h3>
              <div className="grid gap-2">
                {stressOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setStress(option.value)}
                    variant={stress === option.value ? "default" : "outline"}
                    className={`w-full py-3 ${
                      stress === option.value 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'border-2 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{option.emoji}</span>
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs opacity-75 mr-2">{option.desc}</span>
                        {stress === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </Button>
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
                placeholder="可以记录其他相关信息，如具体的饮食内容、睡眠时间、压力来源等..."
                className="w-full"
                rows={3}
              />
            </div>

            {/* 温馨提示 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                💡 温馨提示：良好的饮食和作息习惯有助于减少眩晕发作，建议清淡饮食、规律作息
              </p>
            </div>

            {/* 保存按钮 */}
            <Button
              onClick={handleSave}
              disabled={isLoading || !sleep || !stress}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xl py-6 rounded-lg mt-8"
            >
              {isLoading ? '保存中...' : '保存记录'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LifestyleRecord;
