
import React, { useState } from 'react';
import { ArrowLeft, Mic, Square, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveVoiceRecord } from '@/services/meniereRecordService';

interface VoiceRecordProps {
  onBack: () => void;
}

const VoiceRecord = ({ onBack }: VoiceRecordProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // 模拟录音计时
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // 存储timer ID用于后续清理
    (window as any).recordingTimer = timer;
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
    }
  };

  const deleteRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
  };

  const saveRecording = async () => {
    if (!hasRecording) {
      toast({
        title: "没有录音",
        description: "请先录制语音记录",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveVoiceRecord({
        note: `语音记录 - ${recordingTime}秒`,
        duration: recordingTime
      });

      toast({
        title: "记录已保存",
        description: "语音记录已成功保存到数据库",
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
              语音记事
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 录音状态显示 */}
            <div className="text-center">
              <div className="text-4xl font-mono text-gray-800 mb-4">
                {formatTime(recordingTime)}
              </div>
              {isRecording && (
                <div className="flex items-center justify-center space-x-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg">正在录音...</span>
                </div>
              )}
            </div>

            {/* 录音控制 */}
            <div className="flex justify-center">
              {!isRecording && !hasRecording && (
                <Button
                  onClick={startRecording}
                  className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white text-lg font-medium transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex flex-col items-center">
                    <Mic className="h-8 w-8 mb-2" />
                    <span>按住说话</span>
                  </div>
                </Button>
              )}

              {isRecording && (
                <Button
                  onClick={stopRecording}
                  className="w-32 h-32 rounded-full bg-gray-600 hover:bg-gray-700 text-white text-lg font-medium transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex flex-col items-center">
                    <Square className="h-8 w-8 mb-2" />
                    <span>停止录音</span>
                  </div>
                </Button>
              )}
            </div>

            {/* 录音完成后的操作 */}
            {hasRecording && !isRecording && (
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  录音完成，时长 {formatTime(recordingTime)}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => {/* 播放录音 */}}
                    variant="outline"
                    className="px-6 py-3"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    播放
                  </Button>
                  
                  <Button
                    onClick={deleteRecording}
                    variant="outline"
                    className="px-6 py-3 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    重录
                  </Button>
                </div>
              </div>
            )}

            {/* 使用说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 使用说明</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 点击红色按钮开始录音</li>
                <li>• 说出您想记录的其他症状或感受</li>
                <li>• 录音会自动保存到您的记录中</li>
                <li>• 可以说出无法用选项表达的细节</li>
              </ul>
            </div>

            {/* 保存按钮 */}
            <Button
              onClick={saveRecording}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl py-6 rounded-lg mt-8"
              disabled={!hasRecording || isLoading}
            >
              {isLoading ? '保存中...' : '保存语音记录'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceRecord;
