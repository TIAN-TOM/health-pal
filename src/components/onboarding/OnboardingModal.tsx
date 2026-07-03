import { useEffect, useState } from 'react';
import { Sparkles, Heart, Users, Award, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY_PREFIX = 'onboarding_completed_v1_';

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    icon: Sparkles,
    title: '欢迎使用健康生活伴侣',
    description: '记录血糖、眩晕、饮食作息，用数据帮你和家人守护健康。所有信息均加密存储于你的账户，仅你可见。',
    color: 'text-blue-500',
  },
  {
    icon: Heart,
    title: '每日打卡，养成健康习惯',
    description: '一分钟完成打卡，连续 7 天、30 天可获得额外积分奖励。首页顶部随时能看到你的连续天数。',
    color: 'text-rose-500',
  },
  {
    icon: Users,
    title: '设置紧急联系人，多一份安心',
    description: '在"紧急联系人"中添加家人电话，遇到突发状况时可一键呼叫或发送定位短信。',
    color: 'text-emerald-500',
  },
  {
    icon: Award,
    title: '积分商城 & 教育中心',
    description: '完成打卡、通关小游戏可获得积分，可在商城兑换补签卡等实用道具；教育中心提供权威科普内容。',
    color: 'text-amber-500',
  },
];

/**
 * 新用户首次登录时展示的功能引导，按用户 ID 记录一次性状态。
 */
const OnboardingModal = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    try {
      const done = localStorage.getItem(STORAGE_KEY_PREFIX + user.id);
      if (!done) setOpen(true);
    } catch { /* ignore */ }
  }, [user]);

  const finish = () => {
    if (user) {
      try {
        localStorage.setItem(
          STORAGE_KEY_PREFIX + user.id,
          JSON.stringify({ completedAt: new Date().toISOString() }),
        );
      } catch { /* ignore */ }
    }
    setOpen(false);
  };

  const next = () => {
    if (index < steps.length - 1) setIndex(index + 1);
    else finish();
  };

  const step = steps[index];
  const Icon = step.icon;
  const isLast = index === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && finish()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">新手引导</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Icon className={`h-10 w-10 ${step.color}`} />
          </div>
          <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {step.description}
          </p>
        </div>

        <div className="flex justify-center gap-1.5 my-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={finish}>
            跳过
          </Button>
          <Button onClick={next} size="sm">
            {isLast ? '开始使用' : '下一步'}
            {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
