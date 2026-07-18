import { ArrowLeft, Download, FileText, ShieldCheck, Trash2, UserX } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  getHealthDataConsentStatus,
  healthDataConsentQueryKey,
  recordHealthDataConsent,
} from '@/services/consentService';
import {
  deleteAllEmergencySmsLogs,
  downloadFullExport,
  getEmergencySmsLogCount,
} from '@/services/privacyDataService';

interface PrivacyCenterProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

/**
 * 隐私与数据中心：同意记录的查看与撤回、全量 JSON 导出、紧急短信记录清理、
 * 注销入口与政策链接。访问/更正依旧走各记录页面，这里是权利行使的汇总入口。
 */
const PrivacyCenter = ({ onBack, onNavigate }: PrivacyCenterProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: consent } = useQuery({
    queryKey: healthDataConsentQueryKey(user?.id),
    queryFn: getHealthDataConsentStatus,
    enabled: Boolean(user),
  });

  const { data: smsLogCount } = useQuery({
    queryKey: ['emergency-sms-log-count', user?.id],
    queryFn: getEmergencySmsLogCount,
    enabled: Boolean(user),
  });

  const exportMutation = useMutation({
    mutationFn: downloadFullExport,
    onSuccess: ({ tableCount, errorCount }) => {
      toast({
        title: '导出完成',
        description:
          errorCount > 0
            ? `已导出 ${tableCount} 类数据，${errorCount} 类拉取失败（详见导出文件内的 export_errors）`
            : `已导出 ${tableCount} 类数据，文件已开始下载`,
      });
    },
    onError: () => {
      toast({ title: '导出失败', description: '请检查网络后重试', variant: 'destructive' });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => recordHealthDataConsent(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthDataConsentQueryKey(user?.id) });
      toast({
        title: '已撤回同意',
        description: '应用将暂停收集健康数据；您可以重新同意，或注销账号删除全部数据。',
      });
    },
    onError: () => {
      toast({ title: '撤回失败', description: '请稍后重试', variant: 'destructive' });
    },
  });

  const smsDeleteMutation = useMutation({
    mutationFn: deleteAllEmergencySmsLogs,
    onSuccess: ({ remaining }) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-sms-log-count', user?.id] });
      if (remaining > 0) {
        toast({
          title: '删除未生效',
          description: '仍有记录残留，可能是数据库权限迁移尚未应用，请联系开发者。',
          variant: 'destructive',
        });
      } else {
        toast({ title: '已删除', description: '全部紧急短信记录（含位置信息）已删除' });
      }
    },
    onError: () => {
      toast({ title: '删除失败', description: '请稍后重试', variant: 'destructive' });
    },
  });

  const consentSection = (() => {
    if (!consent) return <p className="text-sm text-gray-600">加载中…</p>;
    if (consent.status === 'granted') {
      return (
        <>
          <p className="text-sm text-gray-700">
            已同意健康数据收集（
            {new Date(consent.consentedAt).toLocaleString('zh-CN', { hour12: false })}）。
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-red-600">
                撤回同意
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>撤回健康数据收集同意？</AlertDialogTitle>
                <AlertDialogDescription>
                  撤回后应用会暂停收集健康数据，需要重新同意才能继续使用记录功能。
                  已有数据不会被删除，如需删除请使用「注销账号」。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => withdrawMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  确认撤回
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    }
    if (consent.status === 'required') {
      return <p className="text-sm text-gray-700">尚未同意当前版本，下次进入应用时会弹出确认。</p>;
    }
    return (
      <p className="text-sm text-gray-600">
        同意记录功能尚未启用（等待数据库迁移应用），当前不影响使用。
      </p>
    );
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">隐私与数据</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2" />
                同意记录
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">{consentSection}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Download className="h-5 w-5 mr-2" />
                数据导出
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">
                下载您账号下的全部数据（健康记录、打卡、家庭协作、积分、同意记录等），JSON 格式。
              </p>
              <Button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportMutation.isPending ? '导出中…' : '下载全部数据（JSON）'}
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('export')}
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                整理记录给医生 / AI（文本导出）
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                数据清理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">
                紧急短信发送记录（含发送时的位置信息）：当前 {smsLogCount ?? '…'} 条。
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600"
                    disabled={!smsLogCount || smsDeleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除全部紧急短信记录
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除全部紧急短信记录？</AlertDialogTitle>
                    <AlertDialogDescription>
                      将删除 {smsLogCount ?? 0} 条发送记录及其中的位置信息，此操作无法撤销。
                      不影响您的紧急联系人。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => smsDeleteMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserX className="h-5 w-5 mr-2" />
                账号与政策
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">
                注销账号会永久删除您的账号、全部健康数据与上传的文件（保留一条注销审计记录）。
              </p>
              <Button
                variant="outline"
                onClick={() => onNavigate('settings')}
                className="w-full justify-start"
              >
                前往「设置 → 账号管理」注销账号
              </Button>
              <p className="text-sm text-gray-600">
                <a href="/privacy" className="text-blue-600 underline">隐私政策</a>
                {' · '}
                <a href="/terms" className="text-blue-600 underline">服务协议</a>
                {' · '}
                <a href="/disclaimer" className="text-blue-600 underline">医疗免责声明</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCenter;
