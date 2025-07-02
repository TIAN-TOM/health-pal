
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, Play, Trash2, Download, Pause, Volume2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  createVoiceRecord, 
  uploadVoiceFile, 
  getUserVoiceRecords, 
  deleteVoiceRecord, 
  deleteVoiceFile,
  getVoiceFileUrl 
} from '@/services/voiceRecordService';
import type { Tables } from '@/integrations/supabase/types';

type VoiceRecord = Tables<'voice_records'>;

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
  const [showHistory, setShowHistory] = useState(false);
  const [voiceRecords, setVoiceRecords] = useState<VoiceRecord[]>([]);
  const [note, setNote] = useState('');
  const [playingRecordId, setPlayingRecordId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVoiceRecords();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const loadVoiceRecords = async () => {
    try {
      const records = await getUserVoiceRecords();
      setVoiceRecords(records);
    } catch (error) {
      console.error('加载语音记录失败:', error);
    }
  };

  const getRecordingOptions = (): MediaRecorderOptions => {
    const options: MediaRecorderOptions = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000
    };
    
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
          sampleRate: 48000
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
        
        stream.getTracks().forEach(track => track.stop());
        
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
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
        description: "正在录制语音记录...",
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
    setNote('');
    
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
    if (!hasRecording || !audioBlob) {
      toast({
        title: "没有录音",
        description: "请先录制语音记录",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileName = `voice-${Date.now()}.webm`;
      const filePath = await uploadVoiceFile(audioBlob, fileName);
      
      await createVoiceRecord({
        title: note || `语音记录 - ${formatTime(recordingTime)}`,
        duration: recordingTime,
        file_path: filePath,
        file_size: audioBlob.size,
        note: note || null
      });

      toast({
        title: "记录已保存",
        description: "语音记录已成功保存，将保留30天",
      });

      // 重置状态
      deleteRecording();
      loadVoiceRecords();
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

  const handleDeleteSavedRecord = async (record: VoiceRecord) => {
    try {
      if (record.file_path) {
        await deleteVoiceFile(record.file_path);
      }
      await deleteVoiceRecord(record.id);
      
      toast({
        title: "记录已删除",
        description: "语音记录已永久删除",
      });
      
      loadVoiceRecords();
    } catch (error) {
      console.error('删除记录失败:', error);
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  const playHistoryRecord = async (record: VoiceRecord) => {
    try {
      if (!record.file_path) {
        toast({
          title: "播放失败",
          description: "语音文件路径不存在",
          variant: "destructive"
        });
        return;
      }

      // 如果当前正在播放这个记录，则暂停
      if (playingRecordId === record.id && isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setPlayingRecordId(null);
        }
        return;
      }

      // 停止其他正在播放的音频
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const signedUrl = await getVoiceFileUrl(record.file_path);
      
      if (audioRef.current) {
        audioRef.current.src = signedUrl;
        audioRef.current.volume = volume;
        audioRef.current.currentTime = 0;
        
        audioRef.current.onloadeddata = () => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            setPlayingRecordId(record.id);
          }
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlayingRecordId(null);
        };
        
        audioRef.current.onerror = () => {
          toast({
            title: "播放失败",
            description: "无法加载语音文件",
            variant: "destructive"
          });
          setIsPlaying(false);
          setPlayingRecordId(null);
        };
      }
    } catch (error) {
      console.error('播放历史记录失败:', error);
      toast({
        title: "播放失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <audio ref={audioRef} style={{ display: 'none' }} />
        
        <div className="mb-6">
          <Button
            onClick={() => setShowHistory(false)}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回录音
          </Button>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-800">
                语音记录历史
              </CardTitle>
            </CardHeader>
            <CardContent>
              {voiceRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无语音记录
                </div>
              ) : (
                <div className="space-y-3">
                  {voiceRecords.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{record.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            时长: {formatTime(record.duration)} | 创建时间: {formatDate(record.created_at)}
                          </p>
                          {record.note && (
                            <p className="text-sm text-gray-500 mt-1">{record.note}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => playHistoryRecord(record)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            {playingRecordId === record.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            onClick={() => handleDeleteSavedRecord(record)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="mb-6 flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回
        </Button>
        
        <Button
          onClick={() => setShowHistory(true)}
          variant="outline"
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          <List className="mr-2 h-4 w-4" />
          查看历史记录
        </Button>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              语音记录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-mono text-gray-800 mb-2">
                {isRecording ? formatTime(recordingTime) : (hasRecording ? formatTime(duration) : '00:00')}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {isRecording ? '正在录音...' : (hasRecording ? `录音完成 - 时长 ${formatTime(recordingTime)}` : '准备开始录音')}
              </div>
              {isRecording && (
                <div className="flex items-center justify-center space-x-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">录音中...</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isRecording && !hasRecording && (
                <Button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white text-lg font-medium transform hover:scale-105 transition-all duration-200"
                >
                  <Mic className="h-6 w-6" />
                </Button>
              )}

              {isRecording && (
                <Button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-gray-600 hover:bg-gray-700 text-white text-lg font-medium transform hover:scale-105 transition-all duration-200"
                >
                  <Square className="h-6 w-6" />
                </Button>
              )}
            </div>

            {hasRecording && !isRecording && (
              <div className="space-y-4">
                <div className="w-full">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
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
                
                <div className="flex justify-center gap-3">
                  <Button onClick={playRecording} variant="outline" size="sm">
                    {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button onClick={stopPlayback} variant="outline" size="sm">
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadRecording} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

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

                <div className="space-y-2">
                  <label className="text-sm text-gray-600">备注（可选）</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="为这条语音记录添加备注..."
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                  />
                </div>
                
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  重新录制
                </Button>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 功能说明</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 自动使用最佳录音设置</li>
                <li>• 录音完成后可以播放、暂停、调节音量和进度</li>
                <li>• 支持下载录音文件到本地设备</li>
                <li>• 保存后的语音记录将在数据库中保留30天</li>
                <li>• 只有您本人可以收听自己的语音记录</li>
                <li>• 管理员只能查看记录信息，无法收听内容</li>
              </ul>
            </div>

            <Button
              onClick={saveRecording}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl py-6 rounded-lg"
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
