import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  getHealthDataConsentStatus,
  healthDataConsentQueryKey,
  HEALTH_DATA_CONSENT_VERSION,
  recordHealthDataConsent,
} from '@/services/consentService';

// 同意前用户必须仍能阅读法律文本和走完密码重置，这些路由不拦
const EXEMPT_PATH_PREFIXES = ['/privacy', '/terms', '/disclaimer', '/reset-password', '/.lovable'];

/**
 * 登录后的健康数据收集同意门（DisclaimerGate 只写 localStorage，不算合规意义上的
 * 同意记录）。首次登录或同意版本升级时弹出，结果作为一条不可篡改的记录写入
 * user_consents；迁移未应用时服务层返回 unavailable，此处直接放行。
 */
const HealthDataConsentGate = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [agreed, setAgreed] = useState(false);

  const exempt = EXEMPT_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  const { data: consent } = useQuery({
    queryKey: healthDataConsentQueryKey(user?.id),
    queryFn: getHealthDataConsentStatus,
    enabled: Boolean(user) && !exempt,
  });

  const acceptMutation = useMutation({
    mutationFn: () => recordHealthDataConsent(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthDataConsentQueryKey(user?.id) });
    },
    onError: () => {
      toast({
        title: '同意记录保存失败',
        description: '请检查网络后重试；问题持续请联系开发者。',
        variant: 'destructive',
      });
    },
  });

  if (!user || exempt || consent?.status !== 'required') return null;

  return (
    <Dialog open onOpenChange={() => { /* 必须选择同意或退出，不允许直接关闭 */ }}>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-700">
            <ShieldCheck className="h-5 w-5 mr-2" />
            健康数据使用同意
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-gray-700 max-h-[55vh] overflow-y-auto">
          <p>为了提供记录、统计与提醒功能，本应用会收集并存储您主动录入的：</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>健康记录：</strong>眩晕、血糖、用药、医疗记录、语音记录</li>
            <li><strong>打卡与生活数据：</strong>每日打卡、心情、饮食与运动</li>
            <li><strong>紧急功能数据：</strong>紧急联系人，以及使用紧急短信时的位置信息</li>
            <li><strong>家庭协作数据：</strong>您添加的家庭成员、提醒与留言</li>
          </ul>
          <p>
            这些数据仅用于向您展示、统计和导出，不用于广告，也不会出售。
            数据存储在 Supabase 云数据库（新加坡区域）。
          </p>
          <p>
            您可以随时在「设置 → 隐私与数据」中查看、更正、导出或删除自己的数据，也可以撤回本同意。
            完整说明见{' '}
            <a href="/privacy" className="text-blue-600 underline">隐私政策</a>。
          </p>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <Checkbox
            id="health-data-consent-agree"
            checked={agreed}
            onCheckedChange={(c) => setAgreed(c === true)}
          />
          <label
            htmlFor="health-data-consent-agree"
            className="text-sm text-gray-800 leading-tight cursor-pointer"
          >
            我已阅读并同意按上述说明收集和使用我的健康数据（版本 {HEALTH_DATA_CONSENT_VERSION}）。
          </label>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => acceptMutation.mutate()}
            disabled={!agreed || acceptMutation.isPending}
            className="w-full"
          >
            {acceptMutation.isPending ? '保存中…' : '同意并继续'}
          </Button>
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full"
            disabled={acceptMutation.isPending}
          >
            暂不同意，退出登录
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthDataConsentGate;
