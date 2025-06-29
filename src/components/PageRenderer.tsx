
import React from 'react';
import DailyCheckin from '@/components/DailyCheckin';
import DizzinessRecord from '@/components/DizzinessRecord';
import DiabetesRecord from '@/components/DiabetesRecord';
import LifestyleRecord from '@/components/LifestyleRecord';
import MedicationRecord from '@/components/MedicationRecord';
import VoiceRecord from '@/components/VoiceRecord';
import HistoryView from '@/components/HistoryView';
import CalendarView from '@/components/CalendarView';
import DataExport from '@/components/DataExport';
import Settings from '@/components/Settings';
import UserPreferences from '@/components/UserPreferences';
import UserManual from '@/components/UserManual';
import ProfileEdit from '@/components/ProfileEdit';
import AdminPanel from '@/components/AdminPanel';
import EmergencyContacts from '@/components/EmergencyContacts';
import MedicalRecords from '@/components/MedicalRecords';
import EducationCenter from '@/components/EducationCenter';
import MedicationManagement from '@/components/MedicationManagement';
import EmergencyMode from '@/components/EmergencyMode';
import DailyDataHub from '@/components/DailyDataHub';
import RecordDetail from '@/components/RecordDetail';
import Games from '@/components/Games';
import RecordHub from '@/components/RecordHub';
import BreathingExercise from '@/components/BreathingExercise';
import PersonalProfile from '@/components/PersonalProfile';
import UpdateLog from '@/components/UpdateLog';
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

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
  // 监听更新日志导航事件
  React.useEffect(() => {
    const handleUpdateLogNavigation = () => {
      onNavigation('update-log', 'settings');
    };

    window.addEventListener('navigate-to-update-log', handleUpdateLogNavigation);
    return () => {
      window.removeEventListener('navigate-to-update-log', handleUpdateLogNavigation);
    };
  }, [onNavigation]);

  switch (currentPage) {
    case "emergency":
      return (
        <EmergencyMode 
          onBack={() => onBack("home")} 
          onNavigateToContacts={() => onNavigation("emergency-contacts", "emergency")}
        />
      );
    case "checkin":
      return <DailyCheckin onBack={() => onBack("home")} />;
    case "record-hub":
      return <RecordHub onBack={() => onBack("home")} onNavigate={onNavigation} />;
    case "dizziness":
      return <DizzinessRecord onBack={() => onBack("record-hub")} />;
    case "diabetes":
      return <DiabetesRecord onBack={() => onBack("record-hub")} />;
    case "lifestyle":
      return <LifestyleRecord onBack={() => onBack("record-hub")} />;
    case "medication":
      return (
        <MedicationRecord 
          onBack={() => onBack("record-hub")} 
          onNavigateToMedicationManagement={() => onNavigation("medication-management", "medication")}
        />
      );
    case "voice":
      return <VoiceRecord onBack={() => onBack("home")} />;
    case "breathing":
      return <BreathingExercise onBack={() => onBack("home")} />;
    case "games":
      return <Games onBack={() => onBack("home")} />;
    case "history":
      return <HistoryView onRecordClick={onRecordClick} showEnhancedFeatures={true} onBack={() => onBack("daily-data")} />;
    case "calendar":
      return <CalendarView />;
    case "export":
      return <DataExport onBack={() => onBack("home")} />;
    case "daily-data":
      return <DailyDataHub onBack={() => onBack("home")} onRecordClick={onRecordClick} />;
    case "record-detail":
      return selectedRecord ? (
        <RecordDetail 
          record={selectedRecord} 
          onBack={() => onBack("history")} 
        />
      ) : null;
    case "settings":
      return (
        <Settings
          onBack={() => onBack("home")}
          onAdminPanel={() => onNavigation("admin", "settings")}
          onEmergencyContacts={() => onNavigation("emergency-contacts", "settings")}
          onMedicalRecords={() => onNavigation("medical-records", "settings")}
          onEducation={() => onNavigation("education", "settings")}
          onMedicationManagement={() => onNavigation("medication-management", "settings")}
          onPersonalProfile={() => onNavigation("personal-profile", "settings")}
          onUserManual={() => onNavigation("user-manual", "settings")}
        />
      );
    case "update-log":
      return <UpdateLog onBack={() => onBack(navigationSource)} />;
    case "personal-profile":
      return <PersonalProfile onBack={() => onBack(navigationSource)} />;
    case "user-preferences":
      return <UserPreferences onBack={() => onBack(navigationSource)} />;
    case "user-manual":
      return <UserManual onBack={() => onBack(navigationSource)} />;
    case "profile-edit":
      return <ProfileEdit onBack={() => onBack(navigationSource)} />;
    case "admin":
      return <AdminPanel onBack={() => onBack(navigationSource)} />;
    case "emergency-contacts":
      return <EmergencyContacts onBack={() => onBack(navigationSource)} />;
    case "medical-records":
      return <MedicalRecords onBack={() => onBack(navigationSource === "home" ? "home" : navigationSource)} />;
    case "education":
      return <EducationCenter onBack={() => onBack(navigationSource === "home" ? "home" : navigationSource)} />;
    case "medication-management":
      return <MedicationManagement onBack={() => onBack(navigationSource)} />;
    default:
      return null;
  }
};

export default PageRenderer;
