
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import EmergencyMode from '@/components/EmergencyMode';
import DizzinessRecord from '@/components/DizzinessRecord';
import LifestyleRecord from '@/components/LifestyleRecord';
import MedicationRecord from '@/components/MedicationRecord';
import DataExport from '@/components/DataExport';
import Settings from '@/components/Settings';
import HistoryView from '@/components/HistoryView';
import MedicalRecords from '@/components/MedicalRecords';
import EducationCenter from '@/components/EducationCenter';
import DailyQuote from '@/components/DailyQuote';
import EmergencyBanner from '@/components/EmergencyBanner';
import UserWelcome from '@/components/UserWelcome';
import FunctionCards from '@/components/FunctionCards';
import NavigationActions from '@/components/NavigationActions';

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

  if (currentView === 'medical-records') {
    return <MedicalRecords onBack={navigateHome} />;
  }

  if (currentView === 'education') {
    return <EducationCenter onBack={navigateHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 紧急求助横幅 */}
      <EmergencyBanner onEmergencyClick={() => navigateTo('emergency')} />

      {/* 主页面内容 */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 标题区域和用户信息 */}
        <UserWelcome 
          userDisplayName={getUserDisplayName()}
          userRole={userRole}
          onSettingsClick={() => navigateTo('settings')}
        />

        {/* 每日名言 */}
        <DailyQuote />

        {/* 功能卡片 */}
        <FunctionCards onNavigate={navigateTo} />

        {/* 历史记录 */}
        <HistoryView onRecordClick={(record) => console.log('查看记录详情:', record)} />

        {/* 导航操作 */}
        <NavigationActions 
          onDataExport={() => navigateTo('data-export')}
          onSignOut={handleSignOut}
        />
      </div>
    </div>
  );
};

export default Index;
