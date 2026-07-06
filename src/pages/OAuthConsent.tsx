import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/pages/AuthPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Minimal typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const { user, loading } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (!authorizationId) {
      setError("缺少 authorization_id 参数");
      return;
    }
    let active = true;
    (async () => {
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, user, loading]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("授权服务器未返回跳转地址。");
    }
    window.location.href = target;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Not signed in — render AuthPage inline. When session appears, this page re-renders.
  if (!user) return <AuthPage />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
        <Card className="max-w-md w-full">
          <CardHeader><CardTitle>无法加载授权请求</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{error}</p></CardContent>
        </Card>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const clientName = details.client?.name ?? "第三方应用";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>授权 {clientName} 访问您的 Health Pal 数据</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {clientName} 将以您的身份调用 Health Pal 的 MCP 工具，可读取您的打卡记录、症状记录、用药与 AI 周报。
            您可以随时在 Supabase 后台撤销授权。
          </p>
          <div className="flex gap-3">
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
              批准
            </Button>
            <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
              拒绝
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
