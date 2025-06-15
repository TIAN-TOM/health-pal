
import React, { useState, useEffect } from 'react';
import { Smile, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getTodayCheckin, createCheckin } from '@/services/dailyCheckinService';
import { useToast } from '@/hooks/use-toast';

interface DailyCheckinProps {
  onBack: () => void;
}

const DailyCheckin = ({ onBack }: DailyCheckinProps) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [moodScore, setMoodScore] = useState(3);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkTodayCheckin();
  }, []);

  const checkTodayCheckin = async () => {
    try {
      const checkin = await getTodayCheckin();
      setHasCheckedIn(!!checkin);
    } catch (error) {
      console.error('检查今日打卡失败:', error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 创建一个空的图片文件作为占位符
      const emptyBlob = new Blob([''], { type: 'image/jpeg' });
      const emptyFile = new File([emptyBlob], 'placeholder.jpg', { type: 'image/jpeg' });
      
      await createCheckin(emptyFile, moodScore, note);
      
      toast({
        title: "打卡成功！",
        description: "今天的心情已记录 😊"
      });
      
      setHasCheckedIn(true);
    } catch (error) {
      toast({
        title: "打卡失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasCheckedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">每日打卡</h1>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <Smile className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">今日已打卡！</h2>
              <p className="text-gray-600">感谢你记录今天的美好时光</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">每日打卡</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              今天你的心情如何？ 😊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-gray-600">
              记录你今天的精神状态和心情感受
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">心情评分 (1-5):</label>
              <div className="flex space-x-2 justify-center">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    variant={moodScore === score ? "default" : "outline"}
                    size="lg"
                    onClick={() => setMoodScore(score)}
                    className="w-12 h-12 rounded-full"
                  >
                    {score}
                  </Button>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">
                {moodScore === 1 && "很糟糕"}
                {moodScore === 2 && "不太好"}
                {moodScore === 3 && "一般"}
                {moodScore === 4 && "不错"}
                {moodScore === 5 && "很棒"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">今日感想 (可选):</label>
              <Textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录今天的感受、想法或特别的事情..."
                className="w-full"
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 text-lg rounded-lg"
            >
              {isSubmitting ? '提交中...' : '完成打卡'}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 打卡说明</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 每日打卡帮助你跟踪心情变化</li>
                <li>• 心情评分可以反映症状对生活的影响</li>
                <li>• 定期记录有助于发现规律和趋势</li>
                <li>• 这些数据可以在就医时提供给医生参考</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyCheckin;
