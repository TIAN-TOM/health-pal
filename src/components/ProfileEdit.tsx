
import React, { useState } from 'react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfileEditProps {
  onBack: () => void;
}

const ProfileEdit = ({ onBack }: ProfileEditProps) => {
  const { userProfile, user } = useAuth();
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "保存成功",
        description: "您的姓名已更新"
      });

      // 刷新页面以更新用户信息
      window.location.reload();
    } catch (error) {
      console.error('更新姓名失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">编辑个人信息</h1>
          <div className="w-16"></div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">邮箱地址不可修改</p>
            </div>
            
            <div>
              <Label htmlFor="fullName">姓名</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="请输入您的姓名"
                maxLength={50}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading || !fullName.trim()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? '保存中...' : '保存更改'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
