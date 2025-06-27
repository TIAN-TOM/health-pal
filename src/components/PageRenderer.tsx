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
  switch (currentPage) {
    case "emergency":
      return <EmergencyMode onBack={() => onBack("home")} />;
    case "checkin":
      return <DailyCheckin onBack={() => onBack("home")} />;
    case "dizziness":
      return <DizzinessRecord onBack={() => onBack("home")} />;
    case "diabetes":
      return <DiabetesRecord onBack={() => onBack("home")} />;
    case "lifestyle":
      return <LifestyleRecord onBack={() => onBack("home")} />;
    case "medication":
      return (
        <MedicationRecord 
          onBack={() => onBack("home")} 
          onNavigateToMedicationManagement={() => onNavigation("medication-management", "medication")}
        />
      );
    case "voice":
      return <VoiceRecord onBack={() => onBack("home")} />;
    case "games":
      return <Games onBack={() => onBack("home")} />;
    case "history":
      return <HistoryView onRecordClick={onRecordClick} showEnhancedFeatures={true} />;
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
          onProfileEdit={() => onNavigation("profile-edit", "settings")}
          onUserPreferences={() => onNavigation("user-preferences", "settings")}
          onUserManual={() => onNavigation("user-manual", "settings")}
        />
      );
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
