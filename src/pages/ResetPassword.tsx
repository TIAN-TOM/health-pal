
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // 监听 PASSWORD_RECOVERY 事件
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // 检查 URL hash 中是否有 recovery token
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const getStrengthInfo = () => {
    const s = calculatePasswordStrength(password);
    if (s <= 1) return { text: '弱', color: 'bg-red-500', width: '20%' };
    if (s <= 3) return { text: '中等', color: 'bg-yellow-500', width: '60%' };
    return { text: '强', color: 'bg-green-500', width: '100%' };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: '密码太短', description: '密码至少需要6个字符', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: '密码不匹配', description: '两次输入的密码不一致', variant: 'destructive' });
      return;
    }

    if (calculatePasswordStrength(password) < 2) {
      toast({ title: '密码强度不足', description: '请设置更强的密码', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: '重置失败', description: error.message, variant: 'destructive' });
      } else {
        setSuccess(true);
        toast({ title: '密码已更新', description: '您的密码已成功重置' });
        setTimeout(() => navigate('/'), 2000);
      }
    } catch {
      toast({ title: '重置失败', description: '网络错误，请稍后重试', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="h-12 w-12 text-blue-500 mx-auto" />
            <p className="text-muted-foreground">正在验证重置链接...</p>
            <p className="text-sm text-muted-foreground">如果页面没有自动更新，请检查您的邮箱中的重置链接是否正确。</p>
            <Button variant="outline" onClick={() => navigate('/')}>返回登录</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">密码已重置</h2>
            <p className="text-muted-foreground">正在跳转到首页...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const strengthInfo = getStrengthInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">设置新密码</CardTitle>
          <CardDescription>请输入您的新密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="请输入新密码（至少8位）"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${strengthInfo.color} transition-all`} style={{ width: strengthInfo.width }} />
                  </div>
                  <p className="text-xs text-muted-foreground">密码强度：{strengthInfo.text}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="请再次输入新密码"
                  required
                  disabled={loading}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">两次输入的密码不一致</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || !password || !confirmPassword}>
              {loading ? '更新中...' : '更新密码'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
