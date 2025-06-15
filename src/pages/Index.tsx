
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, Menu, Download, AlertCircle, Home, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import EmergencyMode from '@/components/EmergencyMode';
import DizzinessRecord from '@/components/DizzinessRecord';
import LifestyleRecord from '@/components/LifestyleRecord';
import MedicationRecord from '@/components/MedicationRecord';
import DataExport from '@/components/DataExport';
import Settings from '@/components/Settings';
import HistoryView from '@/components/HistoryView';

const Index = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const { user, userProfile, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录提示
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Heart className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-normal">
            梅尼埃症生活伴侣
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            记录症状，守护健康
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg min-h-[56px]"
          >
            登录 / 注册
          </Button>
        </div>
      </div>
    );
  }

  const navigateTo = (view: string) => {
    setCurrentView(view);
  };

  const navigateHome = () => {
    setCurrentView('home');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    // 如果没有姓名，从邮箱中提取用户名部分
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix;
    }
    return '用户';
  };

  if (currentView === 'emergency') {
    return <EmergencyMode onBack={navigateHome} />;
  }

  if (currentView === 'dizziness-record') {
    return <DizzinessRecord onBack={navigateHome} />;
  }

  if (currentView === 'lifestyle-record') {
    return <LifestyleRecord onBack={navigateHome} />;
  }

  if (currentView === 'medication-record') {
    return <MedicationRecord onBack={navigateHome} />;
  }

  if (currentView === 'data-export') {
    return <DataExport onBack={navigateHome} />;
  }

  if (currentView === 'settings') {
    return <Settings onBack={navigateHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 紧急求助横幅 */}
      <div className="bg-orange-500 text-white p-4 shadow-lg">
        <Button
          onClick={() => navigateTo('emergency')}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl font-bold py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <AlertCircle className="mr-3 h-6 w-6" />
          头晕不舒服，点这里
        </Button>
      </div>

      {/* 主页面内容 */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 标题区域和用户信息 */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4 min-h-[48px]">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center leading-tight">
              <Heart className="mr-2 h-6 w-6 text-blue-600 flex-shrink-0" />
              <span className="leading-normal">梅尼埃症生活伴侣</span>
            </h1>
            <div className="flex items-center space-x-2">
              {userRole === 'admin' && (
                <div className="flex items-center text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  <Shield className="h-3 w-3 mr-1" />
                  管理员
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo('settings')}
                className="text-gray-500 hover:text-gray-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-2 leading-relaxed">
            欢迎回来，{getUserDisplayName()}
          </div>
          
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              <LogOut className="h-4 w-4 mr-1" />
              退出登录
            </Button>
          </div>
          
          <p className="text-gray-600 text-lg leading-relaxed">
            记录症状，守护健康
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <Button
                onClick={() => navigateTo('dizziness-record')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-8 rounded-lg min-h-[120px]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="leading-relaxed">记录眩晕症状</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <Button
                onClick={() => navigateTo('lifestyle-record')}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-medium py-8 rounded-lg min-h-[120px]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="leading-relaxed">记录饮食与作息</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <Button
                onClick={() => navigateTo('medication-record')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white text-lg font-medium py-8 rounded-lg min-h-[120px]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="leading-relaxed">记录用药情况</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 历史记录 */}
        <HistoryView />

        {/* 数据导出 */}
        <div className="mt-8">
          <Button
            onClick={() => navigateTo('data-export')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-medium py-6 rounded-lg min-h-[64px]"
          >
            <Download className="mr-3 h-5 w-5" />
            <span className="leading-relaxed">整理记录给医生/AI</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
