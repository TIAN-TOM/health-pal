
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import PageRenderer from "@/components/PageRenderer";
import HomePage from "@/components/HomePage";
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
        // 如果没有保存的位置，滚动到功能卡片区域（大约300px）
        const targetPosition = savedPosition > 0 ? savedPosition : 300;
        homeRef.current.scrollTo(0, targetPosition);
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
    if (targetPage === "home") {
      restoreScrollPosition(targetPage);
    } else {
      restoreScrollPosition(targetPage);
    }
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

  if (currentPage === "home") {
    return (
      <HomePage
        userDisplayName={userProfile?.full_name || user.email || "用户"}
        onSettingsClick={() => handleNavigation("settings")}
        onEmergencyClick={handleEmergencyClick}
        onNavigate={handleNavigation}
        homeRef={homeRef}
      />
    );
  }

  const pageContent = (
    <PageRenderer
      currentPage={currentPage}
      selectedRecord={selectedRecord}
      navigationSource={navigationSource}
      onBack={handleBack}
      onNavigation={handleNavigation}
      onRecordClick={handleRecordClick}
    />
  );

  return pageContent;
}
