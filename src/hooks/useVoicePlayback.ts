import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';

/**
 * 封装当前录音 blob 的本地播放控制。
 * audioRef 由调用方提供（因为同一个 <audio> 元素需要在历史播放间共享）。
 */
export const useVoicePlayback = (
  audioRef: RefObject<HTMLAudioElement>,
  audioUrl: string,
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  const playRecording = useCallback(() => {
    if (!audioUrl || !audioRef.current) return;
    if (isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
      clearTimer();
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
        clearTimer();
      };
    }
  }, [audioUrl, audioRef, isPlaying, isPaused, volume, playbackTime, clearTimer]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackTime(0);
    clearTimer();
  }, [audioRef, clearTimer]);

  const seekTo = useCallback((time: number) => {
    setPlaybackTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, [audioRef]);

  const changeVolume = useCallback((vol: number) => {
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, [audioRef]);

  // 卸载时清理 timer
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    isPlaying,
    isPaused,
    playbackTime,
    volume,
    setIsPlaying,
    setPlaybackTime,
    playRecording,
    stopPlayback,
    seekTo,
    changeVolume,
  };
};
