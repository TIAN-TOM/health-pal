import React, { lazy, Suspense } from 'react';
import type { Tables } from '@/integrations/supabase/types';

// 懒加载包装：遇到陈旧 chunk 时自动刷新一次，避免 "Failed to fetch dynamically imported module" 白屏
const lazyWithRetry = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    try {
      return await factory();
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed')
      ) {
        const key = '__lovable_chunk_reload__';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw err;
    }
  });

// 全部页面组件懒加载，仅在路由切换到对应页面时才加载对应代码包
const DailyCheckin = lazyWithRetry(() => import('./DailyCheckin'));
const RecordHub = lazy(() => import('./RecordHub'));
const BreathingExercise = lazy(() => import('./BreathingExercise'));
const VoiceRecord = lazy(() => import('./VoiceRecord'));
const Games = lazy(() => import('./Games'));
const RecordDetail = lazy(() => import('./RecordDetail'));
const Settings = lazy(() => import('./Settings'));
const PersonalProfile = lazy(() => import('./PersonalProfile'));
const MedicalRecords = lazy(() => import('./MedicalRecords'));
const EmergencyContacts = lazy(() => import('./EmergencyContacts'));
const EducationCenter = lazy(() => import('./EducationCenter'));
const MedicationManagement = lazy(() => import('./MedicationManagement'));
const EmergencyMode = lazy(() => import('./EmergencyMode'));
const UserManual = lazy(() => import('./UserManual'));
const UpdateLog = lazy(() => import('./UpdateLog'));
const AdminPanel = lazy(() => import('./AdminPanel'));
const DizzinessRecord = lazy(() => import('./DizzinessRecord'));
const DiabetesRecord = lazy(() => import('./DiabetesRecord'));
const LifestyleRecord = lazy(() => import('./LifestyleRecord'));
const MedicationRecord = lazy(() => import('./MedicationRecord'));
const FamilyDashboard = lazy(() => import('./family/FamilyDashboard'));
const FamilyExpenses = lazy(() => import('./family/FamilyExpenses'));
const FamilyReminders = lazy(() => import('./family/FamilyReminders'));
const FamilyCalendar = lazy(() => import('./family/FamilyCalendar'));
const EnhancedFamilyCalendar = lazy(() => import('./family/EnhancedFamilyCalendar'));
const FamilyMembers = lazy(() => import('./family/FamilyMembers'));
const FamilyMessages = lazy(() => import('./family/FamilyMessages'));
const FamilyStats = lazy(() => import('./family/FamilyStats'));
const ExchangeRate = lazy(() => import('./ExchangeRate'));
const DailyEnglish = lazy(() => import('./DailyEnglish'));
const DailyDataHub = lazy(() => import('./DailyDataHub'));
const DataExport = lazy(() => import('./DataExport'));
const UserFeedback = lazy(() => import('./UserFeedback'));

type MeniereRecord = Tables<'meniere_records'>;

interface PageRendererProps {
  currentPage: string;
  selectedRecord?: MeniereRecord | null;
  navigationSource?: string;
  onBack: (targetPage?: string) => void;
  onNavigation: (page: string, source?: string) => void;
  onRecordClick?: (record: MeniereRecord) => void;
}

const PageFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
);

const PageRenderer = ({
  currentPage,
  selectedRecord,
  navigationSource,
  onBack,
  onNavigation,
  onRecordClick
}: PageRendererProps) => {
  const handleFamilyModuleBack = () => {
    onBack('familyDashboard');
  };

  const commonProps = {
    onBack: () => onBack(),
    onNavigation
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'checkin':
        return <DailyCheckin {...commonProps} onNavigateToRecords={() => onNavigation('record-hub')} />;
      case 'record-hub':
        return <RecordHub onBack={() => onBack()} onNavigate={onNavigation} />;
      case 'breathing':
        return <BreathingExercise {...commonProps} />;
      case 'voice':
        return <VoiceRecord {...commonProps} />;
      case 'games':
        return <Games {...commonProps} />;
      case 'record-detail':
        return selectedRecord ? (
          <RecordDetail record={selectedRecord} onBack={() => onBack('record-hub')} />
        ) : null;
      case 'settings':
        return (
          <Settings
            onBack={() => onBack()}
            onPersonalProfile={() => onNavigation('profile')}
            onEmergencyContacts={() => onNavigation('emergency-contacts')}
            onMedicalRecords={() => onNavigation('medical-records')}
            onEducation={() => onNavigation('education')}
            onMedicationManagement={() => onNavigation('medications')}
            onUserManual={() => onNavigation('user-manual')}
            onUpdateLog={() => onNavigation('update-log')}
            onAdminPanel={() => onNavigation('admin-panel')}
            onUserFeedback={() => onNavigation('user-feedback')}
          />
        );
      case 'profile':
        return <PersonalProfile onBack={() => onBack('settings')} />;
      case 'medical-records':
        return <MedicalRecords onBack={() => onBack('settings')} />;
      case 'emergency-contacts':
        return <EmergencyContacts onBack={() => onBack('settings')} />;
      case 'education':
        return <EducationCenter onBack={() => onBack('settings')} />;
      case 'medications':
        return <MedicationManagement onBack={() => onBack('settings')} />;
      case 'emergency':
        return <EmergencyMode onBack={() => onBack()} />;
      case 'user-manual':
        return (
          <UserManual
            onBack={() => onBack(navigationSource === 'home' ? 'home' : 'settings')}
            source={navigationSource}
          />
        );
      case 'update-log':
        return (
          <UpdateLog
            onBack={() => onBack(navigationSource === 'home' ? 'home' : 'settings')}
            source={navigationSource}
          />
        );
      case 'admin-panel':
        return <AdminPanel onBack={() => onBack('settings')} />;
      case 'familyDashboard':
        return <FamilyDashboard onBack={() => onBack()} onNavigate={onNavigation} />;
      case 'family-expenses':
        return <FamilyExpenses onBack={handleFamilyModuleBack} />;
      case 'family-reminders':
        return <FamilyReminders onBack={handleFamilyModuleBack} />;
      case 'family-calendar':
        return <FamilyCalendar onBack={handleFamilyModuleBack} onNavigate={onNavigation} />;
      case 'enhanced-family-calendar':
        return <EnhancedFamilyCalendar onBack={handleFamilyModuleBack} onNavigate={onNavigation} />;
      case 'family-members':
        return <FamilyMembers onBack={handleFamilyModuleBack} />;
      case 'family-messages':
        return <FamilyMessages onBack={handleFamilyModuleBack} />;
      case 'family-stats':
        return <FamilyStats onBack={handleFamilyModuleBack} />;
      case 'exchange-rate':
        return <ExchangeRate {...commonProps} />;
      case 'english':
        return <DailyEnglish {...commonProps} />;
      case 'daily-data':
        return <DailyDataHub onBack={() => onBack()} onRecordClick={onRecordClick} />;
      case 'export':
        return <DataExport onBack={() => onBack()} />;
      case 'dizziness-record':
        return <DizzinessRecord onBack={() => onNavigation('record-hub')} onNavigate={onNavigation} />;
      case 'diabetes-record':
        return <DiabetesRecord onBack={() => onNavigation('record-hub')} onNavigate={onNavigation} />;
      case 'lifestyle-record':
        return <LifestyleRecord onBack={() => onNavigation('record-hub')} onNavigate={onNavigation} />;
      case 'medication-record':
        return (
          <MedicationRecord
            onBack={() => onNavigation('record-hub')}
            onNavigate={onNavigation}
            onNavigateToMedicationManagement={() => onNavigation('medications')}
          />
        );
      case 'user-feedback':
        return <UserFeedback onBack={() => onBack('settings')} />;
      default:
        return null;
    }
  };

  return <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>;
};

export default PageRenderer;
