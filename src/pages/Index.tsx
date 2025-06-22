
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DailyCheckin from "@/components/DailyCheckin";
import DizzinessRecord from "@/components/DizzinessRecord";
import LifestyleRecord from "@/components/LifestyleRecord";
import MedicationRecord from "@/components/MedicationRecord";
import VoiceRecord from "@/components/VoiceRecord";
import HistoryView from "@/components/HistoryView";
import CalendarView from "@/components/CalendarView";
import DataExport from "@/components/DataExport";
import Settings from "@/components/Settings";
import UserPreferences from "@/components/UserPreferences";
import UserManual from "@/components/UserManual";
import ProfileEdit from "@/components/ProfileEdit";
import AdminPanel from "@/components/AdminPanel";
import EmergencyContacts from "@/components/EmergencyContacts";
import MedicalRecords from "@/components/MedicalRecords";
import EducationCenter from "@/components/EducationCenter";
import MedicationManagement from "@/components/MedicationManagement";
import UserWelcome from "@/components/UserWelcome";
import NavigationActions from "@/components/NavigationActions";
import EmergencyBanner from "@/components/EmergencyBanner";
import FunctionCards from "@/components/FunctionCards";
import DailyDataHub from "@/components/DailyDataHub";
import DailyQuote from "@/components/DailyQuote";
import BeijingClock from "@/components/BeijingClock";
import AnnouncementDisplay from "@/components/AnnouncementDisplay";
import RecordDetail from "@/components/RecordDetail";
import AuthPage from "./AuthPage";
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

export default function Index() {
  const { user, userProfile, userRole, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [selectedRecord, setSelectedRecord] = useState<MeniereRecord | null>(null);
  const [navigationSource, setNavigationSource] = useState<string>("home");

  const handleNavigation = (page: string, source: string = "home") => {
    setCurrentPage(page);
    setNavigationSource(source);
    setSelectedRecord(null);
  };

  const handleRecordClick = (record: MeniereRecord) => {
    setSelectedRecord(record);
    setCurrentPage("record-detail");
  };

  const handleEmergencyClick = () => {
    // TODO: Implement emergency functionality
    console.log("Emergency button clicked");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "checkin":
        return <DailyCheckin onBack={() => setCurrentPage("home")} />;
      case "dizziness":
        return <DizzinessRecord onBack={() => setCurrentPage("home")} />;
      case "lifestyle":
        return <LifestyleRecord onBack={() => setCurrentPage("home")} />;
      case "medication":
        return <MedicationRecord onBack={() => setCurrentPage("home")} />;
      case "voice":
        return <VoiceRecord onBack={() => setCurrentPage("home")} />;
      case "history":
        return <HistoryView onRecordClick={handleRecordClick} showEnhancedFeatures={true} />;
      case "calendar":
        return <CalendarView />;
      case "export":
        return <DataExport onBack={() => setCurrentPage("home")} />;
      case "daily-data":
        return <DailyDataHub onBack={() => setCurrentPage("home")} onRecordClick={handleRecordClick} />;
      case "record-detail":
        return selectedRecord ? (
          <RecordDetail 
            record={selectedRecord} 
            onBack={() => setCurrentPage("history")} 
          />
        ) : null;
      case "settings":
        return (
          <Settings
            onBack={() => setCurrentPage("home")}
            onAdminPanel={() => handleNavigation("admin", "settings")}
            onEmergencyContacts={() => handleNavigation("emergency-contacts", "settings")}
            onMedicalRecords={() => handleNavigation("medical-records", "settings")}
            onEducation={() => handleNavigation("education", "settings")}
            onMedicationManagement={() => handleNavigation("medication-management", "settings")}
            onProfileEdit={() => handleNavigation("profile-edit", "settings")}
            onUserPreferences={() => handleNavigation("user-preferences", "settings")}
            onUserManual={() => handleNavigation("user-manual", "settings")}
          />
        );
      case "user-preferences":
        return <UserPreferences onBack={() => setCurrentPage(navigationSource)} />;
      case "user-manual":
        return <UserManual onBack={() => setCurrentPage(navigationSource)} />;
      case "profile-edit":
        return <ProfileEdit onBack={() => setCurrentPage(navigationSource)} />;
      case "admin":
        return <AdminPanel onBack={() => setCurrentPage(navigationSource)} />;
      case "emergency-contacts":
        return <EmergencyContacts onBack={() => setCurrentPage(navigationSource)} />;
      case "medical-records":
        return <MedicalRecords onBack={() => setCurrentPage(navigationSource)} />;
      case "education":
        return <EducationCenter onBack={() => setCurrentPage(navigationSource)} />;
      case "medication-management":
        return <MedicationManagement onBack={() => setCurrentPage(navigationSource)} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            <div className="container mx-auto px-4 py-6 max-w-md">
              <UserWelcome 
                userDisplayName={userProfile?.full_name || user.email || "用户"}
                userRole={userRole}
                onSettingsClick={() => handleNavigation("settings")}
              />
              <BeijingClock />
              <AnnouncementDisplay />
              <EmergencyBanner onEmergencyClick={handleEmergencyClick} />
              <FunctionCards onNavigate={(page) => handleNavigation(page, "home")} />
              <DailyQuote />
              <NavigationActions 
                onDataExport={() => handleNavigation("export")}
                onDailyData={() => handleNavigation("daily-data")}
              />
            </div>
          </div>
        );
    }
  };

  return renderPage();
}
