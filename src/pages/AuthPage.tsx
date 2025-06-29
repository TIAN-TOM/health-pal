
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Shield, Activity, Eye, EyeOff, CheckCircle, AlertCircle, Mail, Lock, User } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState('signin');
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailValid(isValid);
    return isValid;
  };

  // 计算密码强度
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
    return strength;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (activeTab === 'signup') {
      calculatePasswordStrength(value);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: '密码强度：弱', color: 'text-red-500' };
      case 2:
      case 3:
        return { text: '密码强度：中等', color: 'text-yellow-500' };
      case 4:
      case 5:
        return { text: '密码强度：强', color: 'text-green-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast({
        title: '邮箱格式错误',
        description: '请输入正确的邮箱地址',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('登录错误:', error);
        toast({
          title: '登录失败',
          description: error.message === 'Invalid login credentials' 
            ? '邮箱或密码错误，请检查后重试' 
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '登录成功',
          description: '欢迎回来！',
        });
      }
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      toast({
        title: '登录失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: '邮箱格式错误',
        description: '请输入正确的邮箱地址',
        variant: 'destructive',
      });
      return;
    }

    if (passwordStrength < 2) {
      toast({
        title: '密码强度不足',
        description: '请设置更强的密码（至少8位，包含大小写字母和数字）',
        variant: 'destructive',
      });
      return;
    }

    if (!fullName.trim()) {
      toast({
        title: '请输入姓名',
        description: '姓名不能为空',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        console.error('注册错误:', error);
        toast({
          title: '注册失败',
          description: error.message === 'User already registered'
            ? '该邮箱已被注册，请直接登录或使用其他邮箱'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '注册成功！',
          description: '请检查您的邮箱并点击验证链接完成注册',
        });
        // 注册成功后显示成功动画
        setTimeout(() => {
          setActiveTab('signin');
        }, 2000);
      }
    } catch (error) {
      console.error('注册过程中发生错误:', error);
      toast({
        title: '注册失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(resetEmail)) {
      toast({
        title: '邮箱格式错误',
        description: '请输入正确的邮箱地址',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) {
        console.error('重置密码错误:', error);
        toast({
          title: '重置失败',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '重置邮件已发送',
          description: '请检查您的邮箱并按照说明重置密码',
        });
        setResetMode(false);
        setResetEmail('');
      }
    } catch (error) {
      console.error('重置密码过程中发生错误:', error);
      toast({
        title: '重置失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (resetMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl animate-scale-in">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">重置密码</CardTitle>
            <CardDescription>
              输入您的邮箱地址，我们将发送重置链接
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">邮箱地址</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="example@email.com"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                  {resetEmail && (
                    <div className="absolute right-3 top-3">
                      {emailValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-200 hover:scale-105" 
                  disabled={loading || !emailValid}
                >
                  {loading ? '发送中...' : '发送重置邮件'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full transition-all duration-200 hover:scale-105"
                  onClick={() => setResetMode(false)}
                  disabled={loading}
                >
                  返回登录
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            健康生活伴侣
          </CardTitle>
          <CardDescription className="text-gray-600">
            您的专业健康管理助手
            <br />
            记录健康数据，陪伴健康生活
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="transition-all duration-200">登录</TabsTrigger>
              <TabsTrigger value="signup" className="transition-all duration-200">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 animate-fade-in">
              <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  已有账户？请直接登录
                </p>
              </div>
              
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className="pl-10 transition-all duration-200 focus:scale-105"
                      required
                      disabled={loading}
                    />
                    {email && (
                      <div className="absolute right-3 top-3">
                        {emailValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {email && !emailValid && (
                    <p className="text-xs text-red-500">请输入正确的邮箱格式</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={password}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10 transition-all duration-200 focus:scale-105"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full transition-all duration-200 hover:scale-105" 
                    disabled={loading || !emailValid}
                  >
                    {loading ? '登录中...' : '登录'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm transition-all duration-200 hover:scale-105"
                    onClick={() => setResetMode(true)}
                    disabled={loading}
                  >
                    忘记密码？
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 animate-fade-in">
              <div className="text-center mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <User className="inline h-4 w-4 mr-1" />
                  新用户注册，开始您的健康管理之旅
                </p>
              </div>
              
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">姓名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="请输入您的姓名"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 transition-all duration-200 focus:scale-105"
                      required
                      disabled={loading}
                    />
                    {fullName.trim() && (
                      <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">邮箱地址</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className="pl-10 transition-all duration-200 focus:scale-105"
                      required
                      disabled={loading}
                    />
                    {email && (
                      <div className="absolute right-3 top-3">
                        {emailValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {email && !emailValid && (
                    <p className="text-xs text-red-500">请输入正确的邮箱格式</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="请设置密码（至少8位）"
                      value={password}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10 transition-all duration-200 focus:scale-105"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className={`text-xs ${getPasswordStrengthText().color}`}>
                        {getPasswordStrengthText().text}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            passwordStrength <= 1 ? 'bg-red-500' :
                            passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        建议包含：大小写字母、数字、特殊符号
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-200 hover:scale-105" 
                  disabled={loading || !emailValid || passwordStrength < 2 || !fullName.trim()}
                >
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                健康记录
              </div>
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                数据安全
              </div>
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                专业陪伴
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
