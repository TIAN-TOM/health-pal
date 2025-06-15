
import React, { useState } from 'react';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
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
    { value: 'high_salt', label: '吃得比较咸', emoji: '🧂' },
    { value: 'very_salty', label: '吃得很咸', emoji: '🧂' },
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

  const handleAIAssistant = (aiType: 'doubao' | 'deepseek') => {
    const diet_text = diet.map(d => dietOptions.find(opt => opt.value === d)?.label).join('、');
    const sleep_text = sleepOptions.find(opt => opt.value === sleep)?.label || '';
    const stress_text = stressOptions.find(opt => opt.value === stress)?.label || '';
    
    const record_text = `我有梅尼埃症，今天的生活状况：饮食方面${diet_text || '正常'}，睡眠状况${sleep_text}，压力水平${stress_text}。${note ? `详细说明：${note}` : ''}请给我一些生活方式的建议和指导。`;
    
    if (aiType === 'doubao') {
      window.open('doubao://chat?text=' + encodeURIComponent(record_text), '_blank');
      setTimeout(() => {
        toast({
          title: "如果没有自动打开豆包APP",
          description: "请手动复制生活记录到豆包中咨询",
        });
      }, 1000);
    } else if (aiType === 'deepseek') {
      window.open('deepseek://chat?text=' + encodeURIComponent(record_text), '_blank');
      setTimeout(() => {
        toast({
          title: "如果没有自动打开DeepSeek APP",
          description: "请手动复制生活记录到DeepSeek中咨询",
        });
      }, 1000);
    }
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
          <h1 className="text-xl font-bold text-gray-800">记录饮食与作息</h1>
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
              <div className="grid grid-cols-2 gap-2">
                {dietOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => toggleDiet(option.value)}
                    variant={diet.includes(option.value) ? "default" : "outline"}
                    className={`p-3 h-auto min-h-[60px] ${
                      diet.includes(option.value) 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'border-2 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center w-full">
                      <span className="text-base mb-1">{option.emoji}</span>
                      <span className="text-xs text-center leading-tight break-words">{option.label}</span>
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
