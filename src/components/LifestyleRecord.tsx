
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveLifestyleRecord } from '@/services/meniereRecordService';

interface LifestyleRecordProps {
  onBack: () => void;
}

const LifestyleRecord = ({ onBack }: LifestyleRecordProps) => {
  const [diet, setDiet] = useState<string[]>([]);
  const [sleep, setSleep] = useState<string>('');
  const [stress, setStress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const dietOptions = [
    { value: 'high_salt', label: '吃得比较咸', emoji: '🧂' },
    { value: 'very_salty', label: '吃得很咸', emoji: '🧂🧂' },
    { value: 'coffee', label: '喝了咖啡', emoji: '☕' },
    { value: 'tea', label: '喝了浓茶', emoji: '🍵' },
    { value: 'alcohol', label: '喝了酒', emoji: '🍷' },
    { value: 'chocolate', label: '吃了巧克力', emoji: '🍫' },
    { value: 'cheese', label: '吃了奶酪', emoji: '🧀' },
    { value: 'processed_food', label: '吃了腌制品', emoji: '🥓' },
    { value: 'spicy', label: '吃了辛辣食物', emoji: '🌶️' },
    { value: 'sweet', label: '吃了很多甜食', emoji: '🍰' },
    { value: 'msg', label: '外食（可能含味精）', emoji: '🍜' },
    { value: 'low_salt', label: '饮食清淡', emoji: '🥗' }
  ];

  const sleepOptions = [
    { value: 'excellent', label: '睡得很好', emoji: '😴', desc: '一觉到天亮，精神饱满' },
    { value: 'good', label: '睡得不错', emoji: '😊', desc: '基本睡够了，感觉还行' },
    { value: 'fair', label: '一般般', emoji: '😐', desc: '睡眠质量一般，有点累' },
    { value: 'poor', label: '没睡好', emoji: '😴', desc: '睡眠不足或质量差' },
    { value: 'very_poor', label: '睡得很差', emoji: '😫', desc: '失眠或多梦，很疲劳' },
    { value: 'insomnia', label: '基本没睡', emoji: '😵', desc: '整夜失眠，非常疲惫' }
  ];

  const stressOptions = [
    { value: 'very_low', label: '很放松', emoji: '😌', desc: '心情愉快，没有压力' },
    { value: 'low', label: '比较轻松', emoji: '🙂', desc: '心情不错，压力不大' },
    { value: 'moderate', label: '有点压力', emoji: '😐', desc: '有些担心的事情' },
    { value: 'high', label: '压力较大', emoji: '😟', desc: '比较焦虑，心情不好' },
    { value: 'very_high', label: '压力很大', emoji: '😰', desc: '非常焦虑，情绪紧张' },
    { value: 'overwhelming', label: '压力巨大', emoji: '😫', desc: '感到崩溃，无法承受' }
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
        stress
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
              记录饮食与作息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 饮食记录 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                今天吃了什么？ (可多选)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {dietOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => toggleDiet(option.value)}
                    variant={diet.includes(option.value) ? "default" : "outline"}
                    className={`p-4 h-auto ${
                      diet.includes(option.value) 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'border-2 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">{option.emoji}</span>
                      <span className="text-sm text-center">{option.label}</span>
                      {diet.includes(option.value) && (
                        <Check className="mt-1 h-4 w-4" />
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
              <div className="grid gap-3">
                {sleepOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setSleep(option.value)}
                    variant={sleep === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      sleep === option.value 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border-2 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <span className="text-2xl mr-2">{option.emoji}</span>
                        <span className="font-medium">{option.label}</span>
                        {sleep === option.value && (
                          <Check className="ml-2 h-5 w-5" />
                        )}
                      </div>
                      <span className="text-sm opacity-75">{option.desc}</span>
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
              <div className="grid gap-3">
                {stressOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setStress(option.value)}
                    variant={stress === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      stress === option.value 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'border-2 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <span className="text-2xl mr-2">{option.emoji}</span>
                        <span className="font-medium">{option.label}</span>
                        {stress === option.value && (
                          <Check className="ml-2 h-5 w-5" />
                        )}
                      </div>
                      <span className="text-sm opacity-75">{option.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
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
