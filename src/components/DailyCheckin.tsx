
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Smile, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTodayCheckin, createCheckin } from '@/services/dailyCheckinService';
import { useToast } from '@/hooks/use-toast';

interface DailyCheckinProps {
  onBack: () => void;
}

const DailyCheckin = ({ onBack }: DailyCheckinProps) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [moodScore, setMoodScore] = useState(3);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "无法启动相机",
        description: "请确保已授权相机权限",
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        try {
          setIsSubmitting(true);
          const file = new File([blob], 'checkin.jpg', { type: 'image/jpeg' });
          await createCheckin(file, moodScore, note);
          
          toast({
            title: "打卡成功！",
            description: "今天的微笑已记录 😊"
          });
          
          setHasCheckedIn(true);
          stopCamera();
        } catch (error) {
          toast({
            title: "打卡失败",
            description: "请稍后重试",
            variant: "destructive"
          });
        } finally {
          setIsSubmitting(false);
        }
      }, 'image/jpeg', 0.8);
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
              今天你微笑了吗？ 😊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              拍一张自拍，记录你今天的精神面貌
            </p>

            {!isCapturing ? (
              <Button onClick={startCamera} className="w-full mb-4">
                <Camera className="h-4 w-4 mr-2" />
                开始拍照
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">心情评分 (1-5):</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Button
                          key={score}
                          variant={moodScore === score ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMoodScore(score)}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">今日感想 (可选):</label>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="记录今天的感受..."
                      className="w-full p-2 border rounded-md"
                      rows={2}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={capturePhoto} 
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? '提交中...' : '拍照打卡'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={stopCamera}
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyCheckin;
