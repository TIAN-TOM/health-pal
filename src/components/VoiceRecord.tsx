import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, Play, Trash2, Download, Pause, Volume2, List, Sparkles, Clock, FileAudio, Save } from 'lucide-react';
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
          console.log('Audio metadata loaded, duration:', audio.duration);
          if (isFinite(audio.duration) && !isNaN(audio.duration)) {
            setDuration(audio.duration);
          } else {
            setDuration(recordingTime);
          }
        });
        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setDuration(recordingTime);
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
        title: "保存成功",
        description: "语音记录已成功保存，将保留30天",
      });

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

      if (playingRecordId === record.id && isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setPlayingRecordId(null);
        }
        return;
      }

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

  const downloadHistoryRecord = async (record: VoiceRecord) => {
    try {
      if (!record.file_path) {
        toast({
          title: "下载失败",
          description: "语音文件路径不存在",
          variant: "destructive"
        });
        return;
      }

      const signedUrl = await getVoiceFileUrl(record.file_path);
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date(record.created_at).toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${record.title}-${timestamp}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "下载完成",
        description: "录音文件已保存到您的设备",
      });
    } catch (error) {
      console.error('下载历史记录失败:', error);
      toast({
        title: "下载失败",
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

  const getEffectiveDuration = () => {
    if (isFinite(duration) && !isNaN(duration) && duration > 0) {
      return duration;
    }
    return recordingTime;
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <audio ref={audioRef} style={{ display: 'none' }} />
        
        <div className="relative z-10 p-6">
          <div className="mb-8">
            <Button
              onClick={() => setShowHistory(false)}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              返回录音
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                  <FileAudio className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  语音记录历史
                </CardTitle>
                <p className="text-gray-600 mt-2">管理您的所有语音记录</p>
              </CardHeader>
            </Card>

            {voiceRecords.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileAudio className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无语音记录</h3>
                  <p className="text-gray-500">开始录制您的第一条语音记录吧</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {voiceRecords.map((record) => (
                  <Card key={record.id} className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/80">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileAudio className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-800 truncate">{record.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTime(record.duration)}</span>
                                </div>
                                <span>{formatDate(record.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          {record.note && (
                            <p className="text-sm text-gray-600 mt-2 pl-13">{record.note}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => playHistoryRecord(record)}
                            variant="outline"
                            size="sm"
                            className="text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300 transition-all duration-200"
                          >
                            {playingRecordId === record.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            onClick={() => downloadHistoryRecord(record)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteSavedRecord(record)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-violet-400/10 rounded-full blur-3xl"></div>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="relative z-10 p-6">
        <div className="mb-8 flex justify-between items-center">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回
          </Button>
          
          <Button
            onClick={() => setShowHistory(true)}
            variant="outline"
            className="text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300 bg-white/70 backdrop-blur-sm transition-all duration-200"
          >
            <List className="mr-2 h-4 w-4" />
            历史记录
          </Button>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <Mic className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                语音记录
              </CardTitle>
              <p className="text-gray-600 mt-2">记录您的重要语音内容</p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="relative">
                  <div className="text-6xl font-mono font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    {isRecording ? formatTime(recordingTime) : (hasRecording ? formatTime(getEffectiveDuration()) : '00:00')}
                  </div>
                  {isRecording && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  {isRecording ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-600 font-medium">正在录音中...</span>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  ) : hasRecording ? (
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-medium">录音完成 - 时长 {formatTime(recordingTime)}</span>
                      <Sparkles className="h-5 w-5" />
                    </div>
                  ) : (
                    <p className="text-gray-600 font-medium">准备开始录音</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                {!isRecording && !hasRecording && (
                  <Button
                    onClick={startRecording}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-2xl transform hover:scale-110 transition-all duration-300"
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                )}

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-2xl transform hover:scale-110 transition-all duration-300"
                  >
                    <Square className="h-8 w-8" />
                  </Button>
                )}
              </div>

              {hasRecording && !isRecording && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={getEffectiveDuration() || 0}
                      value={playbackTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value);
                        setPlaybackTime(time);
                        if (audioRef.current) {
                          audioRef.current.currentTime = time;
                        }
                      }}
                      className="w-full h-3 bg-gradient-to-r from-violet-200 to-blue-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-violet-500 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                    />
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>{formatTime(playbackTime)}</span>
                      <span>{formatTime(getEffectiveDuration())}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={playRecording} 
                      variant="outline" 
                      size="lg"
                      className="bg-white/70 border-violet-200 hover:bg-violet-50 hover:border-violet-300 text-violet-600 transition-all duration-200"
                    >
                      {isPlaying && !isPaused ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button 
                      onClick={stopPlayback} 
                      variant="outline" 
                      size="lg"
                      className="bg-white/70 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-all duration-200"
                    >
                      <Square className="h-5 w-5" />
                    </Button>
                    <Button 
                      onClick={downloadRecording} 
                      variant="outline" 
                      size="lg"
                      className="bg-white/70 border-green-200 hover:bg-green-50 hover:border-green-300 text-green-600 transition-all duration-200"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-5 w-5 text-gray-600" />
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
                        className="flex-1 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-gray-500 [&::-webkit-slider-thumb]:to-gray-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                      />
                      <span className="text-sm text-gray-600 w-8">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">备注（可选）</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="为这条语音记录添加备注..."
                      className="w-full p-4 border border-gray-200 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={saveRecording}
                      className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-lg py-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      disabled={isLoading}
                    >
                      <Save className="mr-2 h-5 w-5" />
                      {isLoading ? '保存中...' : '保存语音记录'}
                    </Button>
                    
                    <Button
                      onClick={deleteRecording}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 py-3 transition-all duration-200"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      重新录制
                    </Button>
                  </div>
                </div>
              )}

              <Card className="bg-gradient-to-r from-blue-50/80 to-violet-50/80 border-blue-200/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">功能说明</h4>
                      <ul className="text-sm text-blue-700 space-y-1.5 leading-relaxed">
                        <li>• 支持高质量录音，自动降噪和回声消除</li>
                        <li>• 完整的播放控制：播放、暂停、进度调节</li>
                        <li>• 支持本地下载和云端保存（30天）</li>
                        <li>• 添加备注标签，便于管理和查找</li>
                        <li>• 完全私密，只有您可以访问自己的录音</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecord;
