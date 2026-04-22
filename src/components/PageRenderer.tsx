import React, { Suspense } from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { lazyWithRetry } from '@/lib/lazyWithRetry';

// 全部页面组件懒加载，仅在路由切换到对应页面时才加载对应代码包
const DailyCheckin = lazyWithRetry(() => import('./DailyCheckin'));
const RecordHub = lazyWithRetry(() => import('./RecordHub'));
const BreathingExercise = lazyWithRetry(() => import('./BreathingExercise'));
const VoiceRecord = lazyWithRetry(() => import('./VoiceRecord'));
const Games = lazyWithRetry(() => import('./Games'));
const RecordDetail = lazyWithRetry(() => import('./RecordDetail'));
const Settings = lazyWithRetry(() => import('./Settings'));
const PersonalProfile = lazyWithRetry(() => import('./PersonalProfile'));
const MedicalRecords = lazyWithRetry(() => import('./MedicalRecords'));
const EmergencyContacts = lazyWithRetry(() => import('./EmergencyContacts'));
const EducationCenter = lazyWithRetry(() => import('./EducationCenter'));
const MedicationManagement = lazyWithRetry(() => import('./MedicationManagement'));
const EmergencyMode = lazyWithRetry(() => import('./EmergencyMode'));
const UserManual = lazyWithRetry(() => import('./UserManual'));
const UpdateLog = lazyWithRetry(() => import('./UpdateLog'));
const AdminPanel = lazyWithRetry(() => import('./AdminPanel'));
const DizzinessRecord = lazyWithRetry(() => import('./DizzinessRecord'));
const DiabetesRecord = lazyWithRetry(() => import('./DiabetesRecord'));
const LifestyleRecord = lazyWithRetry(() => import('./LifestyleRecord'));
const MedicationRecord = lazyWithRetry(() => import('./MedicationRecord'));
const FamilyDashboard = lazyWithRetry(() => import('./family/FamilyDashboard'));
const FamilyExpenses = lazyWithRetry(() => import('./family/FamilyExpenses'));
const FamilyReminders = lazyWithRetry(() => import('./family/FamilyReminders'));
const FamilyCalendar = lazyWithRetry(() => import('./family/FamilyCalendar'));
const EnhancedFamilyCalendar = lazyWithRetry(() => import('./family/EnhancedFamilyCalendar'));
const FamilyMembers = lazyWithRetry(() => import('./family/FamilyMembers'));
const FamilyMessages = lazyWithRetry(() => import('./family/FamilyMessages'));
const FamilyStats = lazyWithRetry(() => import('./family/FamilyStats'));
const ExchangeRate = lazyWithRetry(() => import('./ExchangeRate'));
const DailyEnglish = lazyWithRetry(() => import('./DailyEnglish'));
const DailyDataHub = lazyWithRetry(() => import('./DailyDataHub'));
const DataExport = lazyWithRetry(() => import('./DataExport'));
const UserFeedback = lazyWithRetry(() => import('./UserFeedback'));

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
