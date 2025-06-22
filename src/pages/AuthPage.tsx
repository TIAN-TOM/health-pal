
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Heart, Shield, Users, Activity } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "登录失败",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "登录成功",
            description: "欢迎回来！"
          });
        }
      } else {
        if (password !== confirmPassword) {
          toast({
            title: "密码不匹配",
            description: "请确认两次输入的密码相同",
            variant: "destructive"
          });
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "注册失败",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "注册成功",
            description: "请检查您的邮箱确认注册"
          });
        }
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "登录失败" : "注册失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 动态背景元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-200 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 欢迎标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-scale-in">
              <Heart className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            梅尼埃症生活伴侣
          </h1>
          <p className="text-gray-600">
            专业的症状记录与健康管理平台
          </p>
        </div>

        {/* 特色介绍 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">症状记录</p>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">数据安全</p>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">专业支持</p>
          </div>
        </div>

        {/* 登录/注册表单 */}
        <Card className="animate-scale-in shadow-2xl" style={{ animationDelay: '0.8s' }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? '欢迎回来' : '加入我们'}
            </CardTitle>
            <CardDescription>
              {isLogin ? '登录您的账户继续管理健康' : '创建账户开始健康管理之旅'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="fullName">姓名</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="请输入您的姓名"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? '登录中...' : '注册中...'}
                  </div>
                ) : (
                  isLogin ? '登录' : '注册'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? '还没有账户？' : '已有账户？'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setFullName('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  {isLogin ? '立即注册' : '立即登录'}
                </button>
              </p>
            </div>

            {/* 温馨提示 */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg animate-fade-in" style={{ animationDelay: '1s' }}>
              <p className="text-xs text-blue-600 text-center">
                💡 温馨提示：我们重视您的隐私，所有数据都经过加密保护
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <p>© 2025 梅尼埃症生活伴侣 - 专注于梅尼埃症患者的健康管理</p>
          <p className="mt-1">本应用仅供参考，不能替代专业医疗建议</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
