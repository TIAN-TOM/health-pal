
import React from 'react';
import { lazy } from 'react';
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

// 延迟加载组件
const DailyDataHub = lazy(() => import('./DailyDataHub'));
const RecordHub = lazy(() => import('./RecordHub'));
const Games = lazy(() => import('./Games'));
const EducationCenter = lazy(() => import('./EducationCenter'));
const DailyEnglish = lazy(() => import('./DailyEnglish'));
const DataExport = lazy(() => import('./DataExport'));
const Settings = lazy(() => import('./Settings'));
const EmergencyMode = lazy(() => import('./EmergencyMode'));
const RecordDetail = lazy(() => import('./RecordDetail'));

// 家庭管理相关组件
const FamilyDashboard = lazy(() => import('./family/FamilyDashboard'));
const FamilyExpenses = lazy(() => import('./family/FamilyExpenses'));
const FamilyReminders = lazy(() => import('./family/FamilyReminders'));
const FamilyCalendar = lazy(() => import('./family/FamilyCalendar'));
const FamilyMembers = lazy(() => import('./family/FamilyMembers'));
const FamilyMessages = lazy(() => import('./family/FamilyMessages'));
const FamilyStats = lazy(() => import('./family/FamilyStats'));

// 新增汇率组件
const ExchangeRate = lazy(() => import('./ExchangeRate'));

interface PageRendererProps {
  currentPage: string;
  selectedRecord: MeniereRecord | null;
  navigationSource: string;
  onBack: (targetPage?: string) => void;
  onNavigation: (page: string, source?: string) => void;
  onRecordClick: (record: MeniereRecord) => void;
}

const PageRenderer = ({
  currentPage,
  selectedRecord,
  navigationSource,
  onBack,
  onNavigation,
  onRecordClick
}: PageRendererProps) => {
  const getBackTarget = () => {
    if (navigationSource === 'dailyDataHub') return 'dailyDataHub';
    if (navigationSource === 'recordHub') return 'recordHub';
    if (navigationSource === 'settings') return 'settings';
    return 'home';
  };

  const handleFamilyNavigation = (page: string) => {
    onNavigation(page, 'familyDashboard');
  };

  const handleFamilyBack = (targetPage?: string) => {
    onBack(targetPage || 'familyDashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dailyDataHub':
        return <DailyDataHub onBack={() => onBack()} onRecordClick={onRecordClick} />;
      
      case 'recordHub':
        return <RecordHub onBack={() => onBack()} onRecordClick={onRecordClick} />;
      
      case 'games':
        return <Games onBack={() => onBack()} />;
      
      case 'educationCenter':
        return <EducationCenter onBack={() => onBack()} />;
      
      case 'dailyEnglish':
        return <DailyEnglish onBack={() => onBack()} />;
      
      case 'dataExport':
        return <DataExport onBack={() => onBack()} />;
      
      case 'settings':
        return <Settings onBack={() => onBack()} />;
      
      case 'emergency':
        return <EmergencyMode onBack={() => onBack()} />;
      
      case 'record-detail':
        return selectedRecord ? (
          <RecordDetail 
            record={selectedRecord} 
            onBack={() => onBack(getBackTarget())} 
          />
        ) : null;

      // 家庭管理相关页面
      case 'familyDashboard':
      case 'family-dashboard':
        return <FamilyDashboard onBack={() => onBack()} onNavigate={handleFamilyNavigation} />;
      
      case 'familyExpenses':
      case 'family-expenses':
        return <FamilyExpenses onBack={() => handleFamilyBack()} />;
      
      case 'familyReminders':
      case 'family-reminders':
        return <FamilyReminders onBack={() => handleFamilyBack()} />;
      
      case 'familyCalendar':
      case 'family-calendar':
        return <FamilyCalendar onBack={() => handleFamilyBack()} />;
      
      case 'familyMembers':
      case 'family-members':
        return <FamilyMembers onBack={() => handleFamilyBack()} />;
      
      case 'familyMessages':
      case 'family-messages':
        return <FamilyMessages onBack={() => handleFamilyBack()} />;
      
      case 'familyStats':
      case 'family-stats':
        return <FamilyStats onBack={() => handleFamilyBack()} />;

      // 汇率系统
      case 'exchangeRate':
      case 'exchange-rate':
        return <ExchangeRate onBack={() => onBack()} />;
      
      default:
        return <div>页面不存在</div>;
    }
  };

  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      {renderPage()}
    </React.Suspense>
  );
};

export default PageRenderer;
