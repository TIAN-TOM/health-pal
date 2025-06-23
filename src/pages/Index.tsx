
import { useState, useRef, useEffect } from "react";
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
import EmergencyMode from "@/components/EmergencyMode";
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
  
  // 用于记忆页面滚动位置
  const scrollPositions = useRef<Record<string, number>>({});
  const homeRef = useRef<HTMLDivElement>(null);

  // 保存当前页面的滚动位置
  const saveScrollPosition = (page: string) => {
    if (page === "home" && homeRef.current) {
      scrollPositions.current[page] = homeRef.current.scrollTop;
    } else {
      scrollPositions.current[page] = window.scrollY;
    }
  };

  // 恢复页面的滚动位置
  const restoreScrollPosition = (page: string) => {
    setTimeout(() => {
      const savedPosition = scrollPositions.current[page] || 0;
      if (page === "home" && homeRef.current) {
        homeRef.current.scrollTo(0, savedPosition);
      } else {
        window.scrollTo(0, savedPosition);
      }
    }, 50);
  };

  const handleNavigation = (page: string, source: string = "home") => {
    saveScrollPosition(currentPage);
    setCurrentPage(page);
    setNavigationSource(source);
    setSelectedRecord(null);
    
    if (page !== "home") {
      window.scrollTo(0, 0);
    }
  };

  const handleBack = (targetPage: string = "home") => {
    saveScrollPosition(currentPage);
    setCurrentPage(targetPage);
    restoreScrollPosition(targetPage);
  };

  const handleRecordClick = (record: MeniereRecord) => {
    saveScrollPosition(currentPage);
    setSelectedRecord(record);
    setCurrentPage("record-detail");
  };

  const handleEmergencyClick = () => {
    saveScrollPosition(currentPage);
    setCurrentPage("emergency");
  };

  useEffect(() => {
    if (currentPage === "home") {
      restoreScrollPosition("home");
    }
  }, [currentPage]);

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
      case "emergency":
        return <EmergencyMode onBack={() => handleBack("home")} />;
      case "checkin":
        return <DailyCheckin onBack={() => handleBack("home")} />;
      case "dizziness":
        return <DizzinessRecord onBack={() => handleBack("home")} />;
      case "lifestyle":
        return <LifestyleRecord onBack={() => handleBack("home")} />;
      case "medication":
        return (
          <MedicationRecord 
            onBack={() => handleBack("home")} 
            onNavigateToMedicationManagement={() => handleNavigation("medication-management", "medication")}
          />
        );
      case "voice":
        return <VoiceRecord onBack={() => handleBack("home")} />;
      case "history":
        return <HistoryView onRecordClick={handleRecordClick} showEnhancedFeatures={true} />;
      case "calendar":
        return <CalendarView />;
      case "export":
        return <DataExport onBack={() => handleBack("home")} />;
      case "daily-data":
        return <DailyDataHub onBack={() => handleBack("home")} onRecordClick={handleRecordClick} />;
      case "record-detail":
        return selectedRecord ? (
          <RecordDetail 
            record={selectedRecord} 
            onBack={() => handleBack("history")} 
          />
        ) : null;
      case "settings":
        return (
          <Settings
            onBack={() => handleBack("home")}
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
        return <UserPreferences onBack={() => handleBack(navigationSource)} />;
      case "user-manual":
        return <UserManual onBack={() => handleBack(navigationSource)} />;
      case "profile-edit":
        return <ProfileEdit onBack={() => handleBack(navigationSource)} />;
      case "admin":
        return <AdminPanel onBack={() => handleBack(navigationSource)} />;
      case "emergency-contacts":
        return <EmergencyContacts onBack={() => handleBack(navigationSource)} />;
      case "medical-records":
        return <MedicalRecords onBack={() => handleBack(navigationSource === "home" ? "home" : navigationSource)} />;
      case "education":
        return <EducationCenter onBack={() => handleBack(navigationSource === "home" ? "home" : navigationSource)} />;
      case "medication-management":
        return <MedicationManagement onBack={() => handleBack(navigationSource)} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" ref={homeRef}>
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
