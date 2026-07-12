
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBirthdayWish } from "@/hooks/useBirthdayWish";
import HomePage from "@/components/HomePage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { isPageId, getPageTitle, type PageId } from "@/lib/pageRegistry";
import type { Tables } from '@/integrations/supabase/types';

const PageRenderer = lazyWithRetry(() => import("@/components/PageRenderer"));
const AuthPage = lazyWithRetry(() => import("./AuthPage"));

const RouteFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

type MeniereRecord = Tables<'meniere_records'>;

export default function Index() {
  const { user, userProfile, loading } = useAuth();
  const { showBirthdayWish, birthdayAge, handleBirthdayWishClose } = useBirthdayWish();

  // currentPage 由 URL 驱动（?page=xxx）：系统返回键、刷新恢复、深链、收藏都随之可用。
  // 非法/缺失的 page 参数一律落回首页。
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = searchParams.get("page") ?? "home";
  const currentPage: PageId = isPageId(rawPage) ? rawPage : "home";

  const [selectedRecord, setSelectedRecord] = useState<MeniereRecord | null>(null);
  const [navigationSource, setNavigationSource] = useState<string>("home");

  // 页面滚动位置记忆（Index 常驻，ref 在页面切换间存活）
  const scrollPositions = useRef<Record<string, number>>({});
  const homeRef = useRef<HTMLDivElement>(null);

  const saveScrollPosition = (page: string) => {
    if (page === "home" && homeRef.current) {
      scrollPositions.current[page] = homeRef.current.scrollTop;
    } else {
      scrollPositions.current[page] = window.scrollY;
    }
  };

  // 懒加载页面挂载后再恢复滚动位置，需等一帧内容撑开
  const restoreScrollPosition = (page: string) => {
    setTimeout(() => {
      const savedPosition = scrollPositions.current[page] ?? 0;
      if (page === "home" && homeRef.current) {
        homeRef.current.scrollTo({ top: savedPosition, behavior: "smooth" });
      } else {
        window.scrollTo({ top: savedPosition, behavior: "smooth" });
      }
    }, 100);
  };

  const goTo = (page: PageId, { replace = false } = {}) => {
    if (page === "home") {
      setSearchParams({}, { replace });
    } else {
      setSearchParams({ page }, { replace });
    }
  };

  // 前进导航：压入历史记录，系统返回键可逐级回退
  const handleNavigation = (page: string, source: string = "home") => {
    if (!isPageId(page)) {
      console.warn(`未注册的页面 ID: ${page}`);
      return;
    }
    saveScrollPosition(currentPage);
    setNavigationSource(source);
    setSelectedRecord(null);
    goTo(page);
    if (page !== "home") {
      window.scrollTo(0, 0);
    }
  };

  // 应用内返回按钮：replace 而非 push，避免历史栈越按越深
  const handleBack = (targetPage: string = "home") => {
    if (!isPageId(targetPage)) return;
    saveScrollPosition(currentPage);
    goTo(targetPage, { replace: true });
    restoreScrollPosition(targetPage);
  };

  const handleRecordClick = (record: MeniereRecord) => {
    saveScrollPosition(currentPage);
    setSelectedRecord(record);
    goTo("record-detail");
  };

  const handleEmergencyClick = () => {
    saveScrollPosition(currentPage);
    goTo("emergency");
  };

  // 刷新/深链进入 record-detail 时没有选中的记录，落回数据页
  useEffect(() => {
    if (currentPage === "record-detail" && !selectedRecord) {
      goTo("daily-data", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedRecord]);

  useEffect(() => {
    document.title = getPageTitle(currentPage);
  }, [currentPage]);

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
    return (
      <Suspense fallback={<RouteFallback />}>
        <AuthPage />
      </Suspense>
    );
  }

  if (currentPage === "home") {
    return (
      <>
        <HomePage
          userDisplayName={userProfile?.full_name || user.email || "用户"}
          onSettingsClick={() => handleNavigation("settings")}
          onEmergencyClick={handleEmergencyClick}
          onNavigate={handleNavigation}
          homeRef={homeRef}
        />

        {/* 生日祝福弹窗 */}
        <Dialog open={showBirthdayWish} onOpenChange={() => handleBirthdayWishClose()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center">
                <Gift className="h-6 w-6 mr-2 text-yellow-500" />
                生日快乐！🎉
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🎂</div>
              <p className="text-lg font-medium mb-2">
                {userProfile?.full_name}，生日快乐！
              </p>
              <p className="text-gray-600 mb-4">
                祝您身体健康，心想事成！
                {birthdayAge && `今年您${birthdayAge}岁了！`}
              </p>
              <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                <p className="text-yellow-700 font-semibold">🎁 生日礼物</p>
                <p className="text-yellow-600 text-sm">为您送上666积分作为生日祝福！</p>
              </div>
            </div>
            <Button
              onClick={handleBirthdayWishClose}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              收下礼物，谢谢！✨
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <PageRenderer
        currentPage={currentPage}
        selectedRecord={selectedRecord}
        navigationSource={navigationSource}
        onBack={handleBack}
        onNavigation={handleNavigation}
        onRecordClick={handleRecordClick}
      />
    </Suspense>
  );
}
