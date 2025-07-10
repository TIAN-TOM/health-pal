import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Wind, Info, CheckCircle, Timer, Settings, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  const [sessionDuration, setSessionDuration] = useState(3);
  const [showPatternInfo, setShowPatternInfo] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const { toast } = useToast();

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
    }
  };

  const currentPattern = patterns[breathingPattern as keyof typeof patterns];

  const startSession = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(currentPattern.inhale);
    setSessionTime(0);
    setCompletedCycles(0);
    setSessionCompleted(false);
    progressRef.current = 0;
    
    toast({
      title: "开始呼吸训练",
      description: `${currentPattern.name} - ${sessionDuration}分钟训练开始`,
    });
  };

  const pauseSession = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "训练已暂停" : "训练已继续",
      description: isActive ? "点击继续按钮恢复训练" : "继续您的呼吸练习",
    });
  };

  const resetSession = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(currentPattern.inhale);
    setSessionTime(0);
    setCompletedCycles(0);
    setSessionCompleted(false);
    progressRef.current = 0;
    
    toast({
      title: "训练已重置",
      description: "准备开始新的训练",
    });
  };

  // 绘制更流畅的呼吸动画
  const drawBreathingAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
    const minRadius = 40;
    
    // 计算当前进度，使用更精细的时间步进
    const totalTime = currentPattern[phase];
    let targetProgress = 0;
    if (totalTime > 0) {
      targetProgress = (totalTime - countdown) / totalTime;
    }
    
    // 使用缓动函数让动画更自然
    const easedProgress = phase === 'inhale' || phase === 'exhale' 
      ? 0.5 - 0.5 * Math.cos(targetProgress * Math.PI) // 正弦缓动
      : targetProgress; // 屏气阶段保持线性

    // 平滑过渡到目标进度
    const transitionSpeed = 0.1;
    progressRef.current += (easedProgress - progressRef.current) * transitionSpeed;

    let radius;
    
    switch (phase) {
      case 'inhale':
        radius = minRadius + (maxRadius - minRadius) * progressRef.current;
        break;
      case 'hold1':
        radius = maxRadius;
        break;
      case 'exhale':
        radius = maxRadius - (maxRadius - minRadius) * progressRef.current;
        break;
      case 'hold2':
        radius = minRadius;
        break;
      default:
        radius = minRadius;
    }

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制外圈指示器
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius + 20, 0, Math.PI * 2);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制进度弧
    if (totalTime > 0) {
      const angle = (targetProgress * 2 * Math.PI) - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius + 20, -Math.PI / 2, angle);
      ctx.strokeStyle = phase === 'inhale' ? '#3b82f6' : 
                        phase === 'hold1' ? '#10b981' : 
                        phase === 'exhale' ? '#8b5cf6' : '#f59e0b';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 创建更丰富的渐变
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    switch (phase) {
      case 'inhale':
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
        gradient.addColorStop(0.8, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        break;
      case 'hold1':
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.6)');
        gradient.addColorStop(0.8, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
        break;
      case 'exhale':
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.6)');
        gradient.addColorStop(0.8, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
        break;
      case 'hold2':
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.9)');
        gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
        gradient.addColorStop(0.8, 'rgba(245, 158, 11, 0.3)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
        break;
    }

    // 绘制主圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 添加光晕效果
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = phase === 'inhale' ? 'rgba(59, 130, 246, 0.3)' : 
                      phase === 'hold1' ? 'rgba(16, 185, 129, 0.3)' : 
                      phase === 'exhale' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // 添加内部边框
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = phase === 'inhale' ? '#3b82f6' : 
                      phase === 'hold1' ? '#10b981' : 
                      phase === 'exhale' ? '#8b5cf6' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    animationRef.current = requestAnimationFrame(drawBreathingAnimation);
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

  // 自动结束会话并显示完成提示
  useEffect(() => {
    if (sessionTime >= sessionDuration * 60 && isActive) {
      setIsActive(false);
      setSessionCompleted(true);
      
      toast({
        title: "🎉 训练完成！",
        description: `恭喜您完成了${sessionDuration}分钟的呼吸训练，共完成${completedCycles}个呼吸周期`,
      });
    }
  }, [sessionTime, sessionDuration, completedCycles]);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-md">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              呼吸冥想
            </h1>
            <p className="text-xs text-gray-600 mt-1">让心灵回归宁静</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* 训练完成庆祝 */}
        {sessionCompleted && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 backdrop-blur-sm shadow-lg animate-fade-in">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-scale-in" />
                <div className="absolute -top-2 -right-2">
                  <Star className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">训练完成！</h3>
              <p className="text-green-700 mb-4 leading-relaxed">
                恭喜您完成了 {sessionDuration} 分钟的呼吸训练<br />
                共完成 <span className="font-semibold">{completedCycles}</span> 个完整周期
              </p>
              <Button 
                onClick={resetSession}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                开始新的旅程
              </Button>
            </div>
          </div>
        )}

        {/* 主要呼吸动画区域 */}
        <div className="mb-8">
          <Card className="backdrop-blur-sm bg-white/30 border-white/40 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              {/* 状态指示器 */}
              <div className="flex justify-center mb-6">
                <Badge 
                  variant="secondary" 
                  className={`
                    px-4 py-2 text-sm font-medium backdrop-blur-sm border-0 shadow-lg
                    ${phase === 'inhale' ? 'bg-blue-500/20 text-blue-700' : 
                      phase === 'hold1' ? 'bg-green-500/20 text-green-700' : 
                      phase === 'exhale' ? 'bg-purple-500/20 text-purple-700' : 
                      'bg-orange-500/20 text-orange-700'}
                  `}
                >
                  {currentPattern.name}
                </Badge>
              </div>

              {/* 呼吸动画圆圈 */}
              <div className="relative flex justify-center mb-8">
                <div className="relative w-80 h-80 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="absolute"
                  />
                  {/* 中心文字 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`
                      text-4xl font-light mb-2 transition-colors duration-500
                      ${phase === 'inhale' ? 'text-blue-600' : 
                        phase === 'hold1' ? 'text-green-600' : 
                        phase === 'exhale' ? 'text-purple-600' : 
                        'text-orange-600'}
                    `}>
                      {getPhaseText()}
                    </div>
                    <div className="text-7xl font-mono font-bold text-gray-800 mb-2">
                      {countdown}
                    </div>
                    {!isActive && !sessionCompleted && (
                      <div className="text-sm text-gray-600 flex items-center animate-pulse">
                        <Timer className="h-4 w-4 mr-1" />
                        {sessionDuration} 分钟训练
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex justify-center space-x-4">
                {!isActive ? (
                  <Button 
                    onClick={startSession} 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl px-8 py-4 rounded-2xl transform transition-all duration-200 hover:scale-105"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    开始呼吸
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={pauseSession} 
                      variant="outline" 
                      size="lg"
                      className="backdrop-blur-sm bg-white/50 border-white/60 hover:bg-white/70 px-6 py-4 rounded-2xl shadow-lg"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      暂停
                    </Button>
                    <Button 
                      onClick={resetSession} 
                      variant="outline"
                      size="lg"
                      className="backdrop-blur-sm bg-white/50 border-white/60 hover:bg-white/70 px-6 py-4 rounded-2xl shadow-lg"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 实时统计卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="backdrop-blur-sm bg-white/30 border-white/40 shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="h-5 w-5 text-blue-600 mr-1" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{formatTime(sessionTime)}</div>
              <div className="text-xs text-gray-600">训练时间</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/30 border-white/40 shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-green-600 mr-1" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{completedCycles}</div>
              <div className="text-xs text-gray-600">完成周期</div>
            </CardContent>
          </Card>
        </div>

        {/* 设置面板 - 可折叠 */}
        {showSettings && (
          <Card className="mb-8 backdrop-blur-sm bg-white/30 border-white/40 shadow-lg rounded-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Settings className="h-5 w-5 mr-2" />
                训练设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 呼吸模式选择 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">呼吸模式</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPatternInfo(!showPatternInfo)}
                    className="h-8 w-8 p-0"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <Select 
                  value={breathingPattern} 
                  onValueChange={setBreathingPattern}
                  disabled={isActive}
                >
                  <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/60">
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
                  <div className="mt-3 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 animate-fade-in">
                    <p className="text-sm text-blue-800 leading-relaxed">{currentPattern.description}</p>
                  </div>
                )}
              </div>

              {/* 训练时长 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">训练时长</label>
                <Select 
                  value={sessionDuration.toString()} 
                  onValueChange={(value) => setSessionDuration(parseInt(value))}
                  disabled={isActive}
                >
                  <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 分钟 · 快速体验</SelectItem>
                    <SelectItem value="3">3 分钟 · 日常练习</SelectItem>
                    <SelectItem value="5">5 分钟 · 深度放松</SelectItem>
                    <SelectItem value="10">10 分钟 · 冥想入定</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 精美的指导卡片 */}
        <Card className="backdrop-blur-sm bg-gradient-to-r from-white/20 to-white/30 border-white/40 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Wind className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">冥想指南</h3>
                <ul className="text-sm text-gray-700 space-y-2 leading-relaxed">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    找一个舒适的坐姿，让身体自然放松
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    跟随圆圈的扩张收缩节奏进行呼吸
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    专注于当下的呼吸，让思绪自然流淌
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    每日坚持练习，感受内心的平静力量
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BreathingExercise;
