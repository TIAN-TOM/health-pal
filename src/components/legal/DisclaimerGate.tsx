import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const STORAGE_KEY = 'health_pal_disclaimer_accepted_v1';

/**
 * 首次进入应用时强制弹出医疗免责确认。
 * 用户必须勾选并点击同意才能继续使用，确认结果记录在 localStorage（每个浏览器一次）。
 */
const DisclaimerGate = () => {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // 隐私模式下 localStorage 不可用时不阻塞
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ acceptedAt: new Date().toISOString(), version: 1 })
      );
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* 不允许从外部关闭 */ }}>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            使用前请确认
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-gray-700 max-h-[55vh] overflow-y-auto">
          <p>
            <strong>"健康生活伴侣"是日常健康记录工具，不是医疗器械软件</strong>，无法替代医生诊断与专业治疗建议。
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>所有目标值、参考区间、教育内容仅供科普参考。</li>
            <li>请勿仅依据本应用自行调整、停用任何处方药物。</li>
            <li>出现胸痛、呼吸困难、严重眩晕、低血糖晕厥等急症请立即拨打急救电话或前往急诊。</li>
          </ul>
          <p className="text-xs text-gray-500">
            完整内容请阅读{' '}
            <a href="/disclaimer" className="text-blue-600 underline">医疗免责声明</a>、{' '}
            <a href="/privacy" className="text-blue-600 underline">隐私政策</a>、{' '}
            <a href="/terms" className="text-blue-600 underline">服务协议</a>。
          </p>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <Checkbox
            id="disclaimer-agree"
            checked={agreed}
            onCheckedChange={(c) => setAgreed(c === true)}
          />
          <label htmlFor="disclaimer-agree" className="text-sm text-gray-800 leading-tight cursor-pointer">
            我已阅读并理解上述声明，同意继续使用。
          </label>
        </div>

        <Button
          onClick={handleAccept}
          disabled={!agreed}
          className="w-full"
        >
          同意并继续
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DisclaimerGate;
