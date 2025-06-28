
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, Play, Trash2, Download, Pause, Volume2 } from 'lucide-react';
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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [recordingQuality, setRecordingQuality] = useState<'high' | 'medium'>('high');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const getRecordingOptions = () => {
    const options: MediaRecorderOptions = {
      mimeType: 'audio/webm;codecs=opus'
    };
    
    if (recordingQuality === 'high') {
      options.audioBitsPerSecond = 128000;
    } else {
      options.audioBitsPerSecond = 64000;
    }
    
    // 回退到其他格式
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      } else {
        delete options.mimeType;
      }
    }
    
    return options;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: recordingQuality === 'high' ? 48000 : 44100
        } 
      });
      
      const options = getRecordingOptions();
      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setHasRecording(true);
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop());
        
        // 创建音频元素获取时长
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // 每秒记录一次数据
      setIsRecording(true);
      setRecordingTime(0);

      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // 限制最大录音时长为10分钟
          if (newTime >= 600) {
            stopRecording();
            toast({
              title: "录音时间已达上限",
              description: "最长录音时间为10分钟",
              variant: "destructive"
            });
          }
          return newTime;
        });
      }, 1000);

      toast({
        title: "开始录音",
        description: "正在录制您的语音记录...",
      });
    } catch (error) {
      console.error('录音失败:', error);
      let errorMessage = "无法访问麦克风";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "请允许访问麦克风权限";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "未找到可用的麦克风设备";
        }
      }
      
      toast({
        title: "录音失败",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "录音完成",
        description: `录音时长: ${formatTime(recordingTime)}`,
      });
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying && !isPaused) {
        audioRef.current.pause();
        setIsPaused(true);
        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
        }
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.currentTime = playbackTime;
        audioRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);
        
        // 播放进度更新
        playbackTimerRef.current = setInterval(() => {
          if (audioRef.current) {
            setPlaybackTime(audioRef.current.currentTime);
          }
        }, 100);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setPlaybackTime(0);
          if (playbackTimerRef.current) {
            clearInterval(playbackTimerRef.current);
          }
        };
      }
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setPlaybackTime(0);
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    stopPlayback();
    setAudioBlob(null);
    setAudioUrl('');
    setHasRecording(false);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
    
    toast({
      title: "录音已删除",
      description: "可以重新开始录音",
    });
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `voice-record-${timestamp}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "下载完成",
        description: "录音文件已保存到您的设备",
      });
    }
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
        note: `语音记录 - 时长${formatTime(recordingTime)} - 质量${recordingQuality === 'high' ? '高' : '标准'}`,
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
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = () => {
    if (isRecording) {
      return `正在录音... ${formatTime(recordingTime)}`;
    }
    if (hasRecording) {
      return `录音完成 - 时长 ${formatTime(recordingTime)}`;
    }
    return "准备开始录音";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
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
            {/* 录音质量选择 */}
            {!hasRecording && !isRecording && (
              <div className="text-center">
                <label className="text-sm text-gray-600 mb-2 block">录音质量</label>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={recordingQuality === 'high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecordingQuality('high')}
                  >
                    高质量
                  </Button>
                  <Button
                    variant={recordingQuality === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecordingQuality('medium')}
                  >
                    标准
                  </Button>
                </div>
              </div>
            )}

            {/* 录音状态显示 */}
            <div className="text-center">
              <div className="text-4xl font-mono text-gray-800 mb-2">
                {isRecording ? formatTime(recordingTime) : (hasRecording ? formatTime(duration) : '00:00')}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {getRecordingStatus()}
              </div>
              {isRecording && (
                <div className="flex items-center justify-center space-x-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">录音中...</span>
                </div>
              )}
            </div>

            {/* 录音控制 */}
            <div className="flex justify-center gap-4">
              {!isRecording && !hasRecording && (
                <Button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white text-lg font-medium transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex flex-col items-center">
                    <Mic className="h-6 w-6" />
                  </div>
                </Button>
              )}

              {isRecording && (
                <Button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-gray-600 hover:bg-gray-700 text-white text-lg font-medium transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex flex-col items-center">
                    <Square className="h-6 w-6" />
                  </div>
                </Button>
              )}
            </div>

            {/* 播放控制和进度条 */}
            {hasRecording && !isRecording && (
              <div className="space-y-4">
                {/* 播放进度条 */}
                <div className="w-full">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={playbackTime}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value);
                      setPlaybackTime(time);
                      if (audioRef.current) {
                        audioRef.current.currentTime = time;
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(playbackTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* 播放控制按钮 */}
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={playRecording}
                    variant="outline"
                    size="sm"
                    className="px-4 py-2"
                  >
                    {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    onClick={stopPlayback}
                    variant="outline"
                    size="sm"
                    className="px-4 py-2"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={downloadRecording}
                    variant="outline"
                    size="sm"
                    className="px-4 py-2"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* 音量控制 */}
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      setVolume(vol);
                      if (audioRef.current) {
                        audioRef.current.volume = vol;
                      }
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  className="w-full px-6 py-3 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  重新录制
                </Button>
              </div>
            )}

            {/* 使用说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 使用说明</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 选择录音质量：高质量适合重要记录，标准质量节省存储空间</li>
                <li>• 点击红色按钮开始录音，最长可录制10分钟</li>
                <li>• 录音完成后可以播放、暂停、调节音量和进度</li>
                <li>• 支持下载录音文件到本地设备</li>
                <li>• 保存后的语音记录将存储在您的健康档案中</li>
                <li>• 未来将支持AI语音识别和智能分析</li>
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
