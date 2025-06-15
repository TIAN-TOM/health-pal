
import React from 'react';
import { ArrowLeft, User, Bell, Shield, Database, LogOut, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface SettingsProps {
  onBack: () => void;
  onAdminPanel?: () => void;
}

const Settings = ({ onBack, onAdminPanel }: SettingsProps) => {
  const { userProfile, userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">设置</h1>
        </div>

        {/* 管理员面板 */}
        {userRole === 'admin' && onAdminPanel && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings2 className="h-5 w-5 mr-2" />
                管理员功能
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={onAdminPanel}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                进入管理员面板
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 用户信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              用户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">姓名</label>
              <p className="text-gray-900">{userProfile?.full_name || '未设置'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">邮箱</label>
              <p className="text-gray-900">{userProfile?.email || '未设置'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">用户角色</label>
              <div className="flex items-center">
                {userRole === 'admin' && (
                  <div className="flex items-center text-orange-600 bg-orange-100 px-2 py-1 rounded text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    管理员
                  </div>
                )}
                {userRole === 'user' && (
                  <span className="text-gray-600 text-sm">普通用户</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              通知设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              通知功能正在开发中...
            </p>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              数据管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              数据备份和恢复功能正在开发中...
            </p>
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <Card>
          <CardContent className="p-6">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>

        {/* 应用信息 */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            梅尼埃症生活伴侣 v1.0.0
            <br />
            © 2024 专注于梅尼埃症患者的健康管理
            <br />
            开发者：
            <a 
              href="https://www.linkedin.com/in/tom-tian-317580257/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Tom Tian
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
