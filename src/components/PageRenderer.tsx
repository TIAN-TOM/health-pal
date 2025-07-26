
import React from 'react';
import DailyCheckin from './DailyCheckin';
import RecordHub from './RecordHub';
import BreathingExercise from './BreathingExercise';
import VoiceRecord from './VoiceRecord';
import Games from './Games';
import RecordDetail from './RecordDetail';
import Settings from './Settings';
import PersonalProfile from './PersonalProfile';
import UserPreferences from './UserPreferences';
import MedicalRecords from './MedicalRecords';
import EmergencyContacts from './EmergencyContacts';
import EducationCenter from './EducationCenter';
import MedicationManagement from './MedicationManagement';
import EmergencyMode from './EmergencyMode';
import UserManual from './UserManual';
import UpdateLog from './UpdateLog';
import AdminPanel from './AdminPanel';
import FamilyDashboard from './family/FamilyDashboard';
import FamilyExpenses from './family/FamilyExpenses';
import FamilyReminders from './family/FamilyReminders';
import FamilyCalendar from './family/FamilyCalendar';
import EnhancedFamilyCalendar from './family/EnhancedFamilyCalendar';
import FamilyMembers from './family/FamilyMembers';
import FamilyMessages from './family/FamilyMessages';
import FamilyStats from './family/FamilyStats';
import ExchangeRate from './ExchangeRate';
import DailyEnglish from './DailyEnglish';
import DailyDataHub from './DailyDataHub';
import DataExport from './DataExport';
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

interface PageRendererProps {
  currentPage: string;
  selectedRecord?: MeniereRecord | null;
  navigationSource?: string;
  onBack: (targetPage?: string) => void;
  onNavigation: (page: string, source?: string) => void;
  onRecordClick?: (record: MeniereRecord) => void;
}

const PageRenderer = ({
  currentPage,
  selectedRecord,
  navigationSource,
  onBack,
  onNavigation,
  onRecordClick
}: PageRendererProps) => {
  // 家庭管理模块的返回逻辑处理
  const handleFamilyModuleBack = () => {
    onBack('familyDashboard');
  };

  const commonProps = {
    onBack: () => onBack(),
    onNavigation
  };

  switch (currentPage) {
    case 'checkin':
      return <DailyCheckin {...commonProps} />;
    
    case 'record-hub':
      return <RecordHub 
        onBack={() => onBack()}
        onNavigate={onNavigation}
      />;
    
    case 'breathing':
      return <BreathingExercise {...commonProps} />;
    
    case 'voice':
      return <VoiceRecord {...commonProps} />;
    
    case 'games':
      return <Games {...commonProps} />;
    
    case 'record-detail':
      return selectedRecord ? (
        <RecordDetail
          record={selectedRecord}
          onBack={() => onBack('record-hub')}
        />
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
          onUserPreferences={() => onNavigation('user-preferences')}
        />
      );
    
    case 'profile':
      return <PersonalProfile {...commonProps} />;
    
    case 'user-preferences':
      return <UserPreferences {...commonProps} />;
    
    case 'medical-records':
      return <MedicalRecords {...commonProps} />;
    
    case 'emergency-contacts':
      return <EmergencyContacts {...commonProps} />;
    
    case 'education':
      return <EducationCenter {...commonProps} />;
    
    case 'medications':
      return <MedicationManagement {...commonProps} />;
    
    case 'emergency':
      return <EmergencyMode onBack={() => onBack()} />;
    
    case 'user-manual':
      return <UserManual {...commonProps} />;
    
    case 'update-log':
      return <UpdateLog {...commonProps} />;
    
    case 'admin-panel':
      return <AdminPanel {...commonProps} />;
    
    // 家庭管理中心
    case 'familyDashboard':
      return <FamilyDashboard 
        onBack={() => onBack()}
        onNavigate={onNavigation}
      />;
    
    // 家庭管理相关页面路由 - 修复返回逻辑
    case 'family-expenses':
      return <FamilyExpenses onBack={handleFamilyModuleBack} />;
    
    case 'family-reminders':
      return <FamilyReminders onBack={handleFamilyModuleBack} />;
    
    case 'family-calendar':
      return <FamilyCalendar 
        onBack={handleFamilyModuleBack}
        onNavigate={onNavigation}
      />;
    
    // 增强版家庭日历
    case 'enhanced-family-calendar':
      return <EnhancedFamilyCalendar 
        onBack={handleFamilyModuleBack}
        onNavigate={onNavigation}
      />;
    
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
    
    // 添加缺失的页面路由
    case 'daily-data':
      return <DailyDataHub 
        onBack={() => onBack()}
        onNavigate={onNavigation}
      />;
    
    case 'export':
      return <DataExport onBack={() => onBack()} />;
    
    default:
      return null;
  }
};

export default PageRenderer;
