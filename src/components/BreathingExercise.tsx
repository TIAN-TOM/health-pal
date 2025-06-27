
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Wind, Info } from 'lucide-react';
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
  const [breathingPattern, setBreathingPattern] = useState('4-4-4-4');
  const [sessionDuration, setSessionDuration] = useState(3); // 分钟
  const [showPatternInfo, setShowPatternInfo] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const patterns = {
    '4-4-4-4': { 
      inhale: 4, hold1: 4, exhale: 4, hold2: 4, 
      name: '平衡呼吸法',
      description: '四四拍呼吸法，有助于平衡自律神经系统，适合日常减压和放松'
    },
    '4-7-8-0': { 
      inhale: 4, hold1: 7, exhale: 8, hold2: 0, 
      name: '4-7-8 放松法',
      description: '由安德鲁·韦尔博士推广的经典呼吸法，特别有效于快速入睡和深度放松'
    },
    '6-0-6-0': { 
      inhale: 6, hold1: 0, exhale: 6, hold2: 0, 
      name: '深度呼吸法',
      description: '简单的深呼吸练习，增加肺活量，改善血氧含量，适合初学者'
    },
    '5-5-5-5': { 
      inhale: 5, hold1: 5, exhale: 5, hold2: 5, 
      name: '五拍平衡法',
      description: '稍长的平衡呼吸，能够更深层次地激活副交感神经，增强冥想效果'
    },
    '3-3-3-3': { 
      inhale: 3, hold1: 3, exhale: 3, hold2: 3, 
      name: '快节奏呼吸',
      description: '适合时间紧张时的快速放松，短时间内有效缓解紧张情绪'
    }
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

  // 绘制流畅的呼吸动画
  const drawBreathingAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
    const minRadius = 40;
    
    // 计算当前进度，使用更平滑的插值
    let progress = 0;
    const totalTime = currentPattern[phase];
    if (totalTime > 0) {
      progress = (totalTime - countdown) / totalTime;
      // 使用缓动函数让动画更自然
      progress = phase === 'inhale' || phase === 'exhale' 
        ? 0.5 - 0.5 * Math.cos(progress * Math.PI) // 正弦缓动
        : progress; // 屏气阶段保持线性
    }

    let radius;
    let targetRadius;
    
    switch (phase) {
      case 'inhale':
        targetRadius = minRadius + (maxRadius - minRadius) * progress;
        break;
      case 'hold1':
        targetRadius = maxRadius;
        break;
      case 'exhale':
        targetRadius = maxRadius - (maxRadius - minRadius) * progress;
        break;
      case 'hold2':
        targetRadius = minRadius;
        break;
      default:
        targetRadius = minRadius;
    }

    radius = targetRadius;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制外圈指示器
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius + 15, 0, Math.PI * 2);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制进度弧
    if (totalTime > 0) {
      const angle = (progress * 2 * Math.PI) - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius + 15, -Math.PI / 2, angle);
      ctx.strokeStyle = phase === 'inhale' ? '#3b82f6' : 
                        phase === 'hold1' ? '#10b981' : 
                        phase === 'exhale' ? '#8b5cf6' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 创建渐变
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    switch (phase) {
      case 'inhale':
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        break;
      case 'hold1':
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
        break;
      case 'exhale':
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
        gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
        break;
      case 'hold2':
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        gradient.addColorStop(0.7, 'rgba(245, 158, 11, 0.4)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
        break;
    }

    // 绘制主圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 添加边框
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = phase === 'inhale' ? '#3b82f6' : 
                      phase === 'hold1' ? '#10b981' : 
                      phase === 'exhale' ? '#8b5cf6' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isActive) {
      animationRef.current = requestAnimationFrame(drawBreathingAnimation);
    }
  };

  useEffect(() => {
    if (isActive) {
      drawBreathingAnimation();
      
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setPhase(currentPhase => {
              const phases: Array<'inhale' | 'hold1' | 'exhale' | 'hold2'> = ['inhale', 'hold1', 'exhale', 'hold2'];
              const currentIndex = phases.indexOf(currentPhase);
              let nextIndex = (currentIndex + 1) % phases.length;
              
              // 跳过时长为0的阶段
              while (currentPattern[phases[nextIndex]] === 0) {
                nextIndex = (nextIndex + 1) % phases.length;
              }
              
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
                width={300}
                height={300}
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">呼吸模式</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPatternInfo(!showPatternInfo)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
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
                      {pattern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {showPatternInfo && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{currentPattern.description}</p>
                </div>
              )}
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
                  <SelectItem value="1">1 分钟</SelectItem>
                  <SelectItem value="2">2 分钟</SelectItem>
                  <SelectItem value="3">3 分钟</SelectItem>
                  <SelectItem value="4">4 分钟</SelectItem>
                  <SelectItem value="5">5 分钟</SelectItem>
                  <SelectItem value="6">6 分钟</SelectItem>
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
        <Card className="mb-6">
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
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Wind className="h-5 w-5 text-blue-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">呼吸训练指南</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 找一个舒适的姿势，放松身体</li>
                <li>• 跟随圆圈的节奏进行呼吸</li>
                <li>• 吸气时圆圈扩大，呼气时圆圈缩小</li>
                <li>• 专注于呼吸，不要被其他思绪干扰</li>
                <li>• 建议每天练习3-5分钟</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
