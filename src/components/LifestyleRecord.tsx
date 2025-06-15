
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

  const toggleDiet = (item: string) => {
    setDiet(prev => 
      prev.includes(item) 
        ? prev.filter(d => d !== item)
        : [...prev, item]
    );
  };

  const handleSave = async () => {
    if (!sleep || !stress) {
      toast({
        title: "请完善信息",
        description: "请选择睡眠质量和压力状态",
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
            {/* 饮食情况 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                饮食情况 (可多选)
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'salty', label: '吃咸了' },
                  { value: 'caffeine', label: '喝咖啡或茶了' },
                  { value: 'alcohol', label: '喝酒了' },
                  { value: 'spicy', label: '吃辣了' },
                  { value: 'normal', label: '饮食正常' }
                ].map(option => (
                  <Button
                    key={option.value}
                    onClick={() => toggleDiet(option.value)}
                    variant={diet.includes(option.value) ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      diet.includes(option.value)
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'border-2 hover:border-orange-300'
                    }`}
                  >
                    {diet.includes(option.value) && (
                      <Check className="mr-2 h-5 w-5" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 睡眠质量 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                睡眠质量
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'good', label: '睡得好' },
                  { value: 'average', label: '一般' },
                  { value: 'poor', label: '没睡好' }
                ].map(option => (
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
                    {sleep === option.value && (
                      <Check className="mr-2 h-5 w-5" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 压力状态 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                压力状态
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'relaxed', label: '很轻松' },
                  { value: 'tired', label: '有点累' },
                  { value: 'stressed', label: '压力大' }
                ].map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setStress(option.value)}
                    variant={stress === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      stress === option.value 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'border-2 hover:border-green-300'
                    }`}
                  >
                    {stress === option.value && (
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
              disabled={isLoading}
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
