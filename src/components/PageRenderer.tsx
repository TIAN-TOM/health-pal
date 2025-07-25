
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
import ExchangeRate from './ExchangeRate';
import DailyEnglish from './DailyEnglish';
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
    
    case 'familyDashboard':
      return <FamilyDashboard 
        onBack={() => onBack()}
        onNavigate={onNavigation}
      />;
    
    case 'exchange-rate':
      return <ExchangeRate {...commonProps} />;
    
    case 'english':
      return <DailyEnglish {...commonProps} />;
    
    default:
      return null;
  }
};

export default PageRenderer;
