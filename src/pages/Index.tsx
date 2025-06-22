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
import AuthPage from "./AuthPage";

export default function Index() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setSelectedDate(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage("history");
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
        return <HistoryView onBack={() => setCurrentPage("home")} selectedDate={selectedDate} />;
      case "calendar":
        return <CalendarView onBack={() => setCurrentPage("home")} onDateSelect={handleDateSelect} />;
      case "export":
        return <DataExport onBack={() => setCurrentPage("home")} />;
      case "settings":
        return (
          <Settings
            onBack={() => setCurrentPage("home")}
            onAdminPanel={() => setCurrentPage("admin")}
            onEmergencyContacts={() => setCurrentPage("emergency-contacts")}
            onMedicalRecords={() => setCurrentPage("medical-records")}
            onEducation={() => setCurrentPage("education")}
            onMedicationManagement={() => setCurrentPage("medication-management")}
            onProfileEdit={() => setCurrentPage("profile-edit")}
            onUserPreferences={() => setCurrentPage("user-preferences")}
            onUserManual={() => setCurrentPage("user-manual")}
          />
        );
      case "user-preferences":
        return <UserPreferences onBack={() => setCurrentPage("settings")} />;
      case "user-manual":
        return <UserManual onBack={() => setCurrentPage("settings")} />;
      case "profile-edit":
        return <ProfileEdit onBack={() => setCurrentPage("settings")} />;
      case "admin":
        return <AdminPanel onBack={() => setCurrentPage("settings")} />;
      case "emergency-contacts":
        return <EmergencyContacts onBack={() => setCurrentPage("settings")} />;
      case "medical-records":
        return <MedicalRecords onBack={() => setCurrentPage("settings")} />;
      case "education":
        return <EducationCenter onBack={() => setCurrentPage("settings")} />;
      case "medication-management":
        return <MedicationManagement onBack={() => setCurrentPage("settings")} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            <div className="container mx-auto px-4 py-6 max-w-md">
              <UserWelcome />
              <BeijingClock />
              <AnnouncementDisplay />
              <EmergencyBanner />
              <DailyDataHub />
              <FunctionCards onNavigate={handleNavigation} />
              <DailyQuote />
              <NavigationActions onNavigate={handleNavigation} />
            </div>
          </div>
        );
    }
  };

  return renderPage();
}
