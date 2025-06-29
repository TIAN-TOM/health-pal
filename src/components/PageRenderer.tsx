import React from 'react';
import Settings from '@/components/Settings';
import EmergencyMode from '@/components/EmergencyMode';
import EmergencyContacts from '@/components/EmergencyContacts';
import MedicalRecords from '@/components/MedicalRecords';
import RecordDetail from '@/components/RecordDetail';
import DailyCheckin from '@/components/DailyCheckin';
import HistoryView from '@/components/HistoryView';
import RecordHub from '@/components/RecordHub';
import VoiceRecord from '@/components/VoiceRecord';
import DizzinessRecord from '@/components/DizzinessRecord';
import LifestyleRecord from '@/components/LifestyleRecord';
import DiabetesRecord from '@/components/DiabetesRecord';
import MedicationRecord from '@/components/MedicationRecord';
import CalendarView from '@/components/CalendarView';
import DataExport from '@/components/DataExport';
import DailyDataHub from '@/components/DailyDataHub';
import Games from '@/components/Games';
import EducationCenter from '@/components/EducationCenter';
import MedicationManagement from '@/components/MedicationManagement';
import PersonalProfile from '@/components/PersonalProfile';
import UserManual from '@/components/UserManual';
import UpdateLogs from '@/components/UpdateLogs';
import AdminPanel from '@/components/AdminPanel';
import BreathingExercise from '@/components/BreathingExercise';
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
    case "settings":
      return (
        <Settings
          onBack={() => onBack("home")}
          onAdminPanel={() => onNavigation("admin-panel", "settings")}
          onEmergencyContacts={() => onNavigation("emergency-contacts", "settings")}
          onMedicalRecords={() => onNavigation("medical-records", "settings")}
          onEducation={() => onNavigation("education", "settings")}
          onMedicationManagement={() => onNavigation("medication-management", "settings")}
          onPersonalProfile={() => onNavigation("personal-profile", "settings")}
          onUserManual={() => onNavigation("user-manual", "settings")}
        />
      );

    case "emergency":
      return (
        <EmergencyMode
          onBack={() => onBack("home")}
        />
      );

    case "emergency-contacts":
      return (
        <EmergencyContacts
          onBack={() => onBack(navigationSource)}
        />
      );

    case "medical-records":
      return (
        <MedicalRecords
          onBack={() => onBack(navigationSource)}
          onRecordClick={onRecordClick}
        />
      );

    case "record-detail":
      return (
        <RecordDetail
          record={selectedRecord}
          onBack={() => onBack("medical-records")}
        />
      );

    case "daily-checkin":
      return (
        <DailyCheckin
          onBack={() => onBack("home")}
        />
      );

    case "history":
      return (
        <HistoryView
          onBack={() => onBack("home")}
          onRecordClick={onRecordClick}
        />
      );

    case "record-hub":
      return (
        <RecordHub
          onBack={() => onBack("home")}
          onNavigate={onNavigation}
        />
      );

    case "voice-record":
      return (
        <VoiceRecord
          onBack={() => onBack("record-hub")}
        />
      );

    case "dizziness-record":
      return (
        <DizzinessRecord
          onBack={() => onBack("record-hub")}
        />
      );

    case "lifestyle-record":
      return (
        <LifestyleRecord
          onBack={() => onBack("record-hub")}
        />
      );

    case "diabetes-record":
      return (
        <DiabetesRecord
          onBack={() => onBack("record-hub")}
        />
      );

    case "medication-record":
      return (
        <MedicationRecord
          onBack={() => onBack("record-hub")}
        />
      );

    case "calendar":
      return (
        <CalendarView
          onBack={() => onBack("home")}
          onRecordClick={onRecordClick}
        />
      );

    case "export":
      return (
        <DataExport
          onBack={() => onBack("home")}
        />
      );

    case "daily-data":
      return (
        <DailyDataHub
          onBack={() => onBack("home")}
        />
      );

    case "games":
      return (
        <Games
          onBack={() => onBack("home")}
        />
      );

    case "education":
      return (
        <EducationCenter
          onBack={() => onBack(navigationSource)}
        />
      );

    case "medication-management":
      return (
        <MedicationManagement
          onBack={() => onBack(navigationSource)}
        />
      );

    case "personal-profile":
      return (
        <PersonalProfile
          onBack={() => onBack(navigationSource)}
        />
      );

    case "user-manual":
      return (
        <UserManual
          onBack={() => onBack(navigationSource)}
        />
      );

    case "update-logs":
      return (
        <UpdateLogs
          onBack={() => onBack(navigationSource)}
        />
      );

    case "admin-panel":
      return (
        <AdminPanel
          onBack={() => onBack("settings")}
        />
      );

    case "breathing-exercise":
      return (
        <BreathingExercise
          onBack={() => onBack("home")}
        />
      );

    default:
      return null;
  }
};

export default PageRenderer;
