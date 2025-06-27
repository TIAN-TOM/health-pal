
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BreathingExerciseProps {
  onBack: () => void;
}

const BreathingExercise = ({ onBack }: BreathingExerciseProps) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [sessionTime, setSessionTime] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState('4-4-4-4'); // 吸气-屏气-呼气-屏气
  const [sessionDuration, setSessionDuration] = useState(5); // 分钟
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const patterns = {
    '4-4-4-4': { inhale: 4, hold1: 4, exhale: 4, hold2: 4, name: '平衡呼吸法' },
    '4-7-8-0': { inhale: 4, hold1: 7, exhale: 8, hold2: 0, name: '4-7-8 放松法' },
    '6-2-6-2': { inhale: 6, hold1: 2, exhale: 6, hold2: 2, name: '深度呼吸法' },
    '4-0-6-0': { inhale: 4, hold1: 0, exhale: 6, hold2: 0, name: '简易呼吸法' }
  };

  const currentPattern = patterns[breathingPattern as keyof typeof patterns];

  const startSession = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(currentPattern.inhale);
    setSessionTime(0);
    setCompletedCycles(0);
  };

  const pauseSession = () => {
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(currentPattern.inhale);
    setSessionTime(0);
    setCompletedCycles(0);
  };

  // 绘制呼吸动画
  const drawBreathingAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.3;
    
    // 根据阶段和倒计时计算半径
    let progress = 0;
    const totalTime = currentPattern[phase];
    if (totalTime > 0) {
      progress = (totalTime - countdown) / totalTime;
    }

    let radius;
    switch (phase) {
      case 'inhale':
        radius = 30 + (maxRadius - 30) * progress;
        break;
      case 'hold1':
        radius = maxRadius;
        break;
      case 'exhale':
        radius = maxRadius - (maxRadius - 30) * progress;
        break;
      case 'hold2':
        radius = 30;
        break;
      default:
        radius = 30;
    }

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制外圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制主圆
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    switch (phase) {
      case 'inhale':
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
        break;
      case 'hold1':
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
        break;
      case 'exhale':
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#7c3aed');
        break;
      case 'hold2':
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
        break;
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制进度弧
    if (totalTime > 0) {
      const angle = (progress * 2 * Math.PI) - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius + 5, -Math.PI / 2, angle);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    animationRef.current = requestAnimationFrame(drawBreathingAnimation);
  };

  useEffect(() => {
    if (isActive) {
      drawBreathingAnimation();
      
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // 切换到下一阶段
            setPhase(currentPhase => {
              const phases: Array<'inhale' | 'hold1' | 'exhale' | 'hold2'> = ['inhale', 'hold1', 'exhale', 'hold2'];
              const currentIndex = phases.indexOf(currentPhase);
              const nextIndex = (currentIndex + 1) % phases.length;
              const nextPhase = phases[nextIndex];
              
              if (nextPhase === 'inhale') {
                setCompletedCycles(cycles => cycles + 1);
              }
              
              return nextPhase;
            });
            
            return currentPattern[phase] || 4;
          }
          return prev - 1;
        });
        
        setSessionTime(time => time + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, phase, currentPattern]);

  // 自动结束会话
  useEffect(() => {
    if (sessionTime >= sessionDuration * 60 && isActive) {
      setIsActive(false);
    }
  }, [sessionTime, sessionDuration]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return '吸气';
      case 'hold1': return '屏气';
      case 'exhale': return '呼气';
      case 'hold2': return '暂停';
      default: return '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">呼吸训练</h1>
          <div className="w-16"></div>
        </div>

        {/* 呼吸动画区域 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="mx-auto rounded-full"
              />
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gray-800">
                {getPhaseText()}
              </div>
              <div className="text-6xl font-mono font-bold text-blue-600">
                {countdown}
              </div>
              <div className="text-sm text-gray-600">
                {currentPattern.name}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 控制面板 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wind className="h-5 w-5 mr-2" />
              训练设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">呼吸模式</label>
              <Select 
                value={breathingPattern} 
                onValueChange={setBreathingPattern}
                disabled={isActive}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(patterns).map(([key, pattern]) => (
                    <SelectItem key={key} value={key}>
                      {pattern.name} ({key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">训练时长</label>
              <Select 
                value={sessionDuration.toString()} 
                onValueChange={(value) => setSessionDuration(parseInt(value))}
                disabled={isActive}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 分钟</SelectItem>
                  <SelectItem value="5">5 分钟</SelectItem>
                  <SelectItem value="10">10 分钟</SelectItem>
                  <SelectItem value="15">15 分钟</SelectItem>
                  <SelectItem value="20">20 分钟</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {!isActive ? (
                <Button onClick={startSession} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  开始训练
                </Button>
              ) : (
                <Button onClick={pauseSession} variant="outline" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  {isActive ? '暂停' : '继续'}
                </Button>
              )}
              
              <Button onClick={resetSession} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 训练统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              训练统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{formatTime(sessionTime)}</div>
                <div className="text-sm text-gray-600">训练时间</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedCycles}</div>
                <div className="text-sm text-gray-600">完成周期</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Wind className="h-5 w-5 text-blue-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">呼吸训练指南</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 找一个舒适的姿势，放松身体</li>
                <li>• 跟随圆圈的节奏进行呼吸</li>
                <li>• 吸气时圆圈扩大，呼气时圆圈缩小</li>
                <li>• 专注于呼吸，不要被其他思绪干扰</li>
                <li>• 建议每天练习5-10分钟</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
