import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const formatTime = (seconds: number) => {
  if (!isFinite(seconds) || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getRecordingOptions = (): MediaRecorderOptions => {
  const options: MediaRecorderOptions = {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000,
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

/**
 * 封装录音逻辑：MediaRecorder 控制、计时、blob/url、duration 探测。
 * 行为与原内联实现完全等价。
 */
export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // toast 在调用方完成（保留原行为：startRecording 内的 setInterval 也调用 stopRecording）
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      const options = getRecordingOptions();
      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];
      let currentRecordingTime = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setHasRecording(true);

        stream.getTracks().forEach((track) => track.stop());

        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          if (isFinite(audio.duration) && !isNaN(audio.duration)) {
            setDuration(audio.duration);
          } else {
            setDuration(currentRecordingTime);
          }
        });
        audio.addEventListener('error', () => {
          setDuration(currentRecordingTime);
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          currentRecordingTime = newTime;
          if (newTime >= 600) {
            // 自动停止
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }
            toast({
              title: '录音时间已达上限',
              description: '最长录音时间为10分钟',
              variant: 'destructive',
            });
          }
          return newTime;
        });
      }, 1000);

      toast({
        title: '开始录音',
        description: '正在录制语音记录...',
      });
    } catch (error) {
      console.error('录音失败:', error);
      let errorMessage = '无法访问麦克风';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') errorMessage = '请允许访问麦克风权限';
        else if (error.name === 'NotFoundError') errorMessage = '未找到可用的麦克风设备';
      }
      toast({
        title: '录音失败',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopRecordingWithToast = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      const time = recordingTime;
      stopRecording();
      toast({
        title: '录音完成',
        description: `录音时长: ${formatTime(time)}`,
      });
    }
  }, [isRecording, recordingTime, stopRecording, toast]);

  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl('');
    setHasRecording(false);
    setRecordingTime(0);
    setDuration(0);
  }, [audioUrl]);

  // 卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    hasRecording,
    audioBlob,
    audioUrl,
    duration,
    startRecording,
    stopRecording: stopRecordingWithToast,
    resetRecording,
  };
};
