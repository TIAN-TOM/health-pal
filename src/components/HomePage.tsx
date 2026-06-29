import React, { Suspense, memo, useEffect } from 'react';
import UserWelcomeWithClock from '@/components/UserWelcomeWithClock';
import FunctionCards from '@/components/FunctionCards';
import { Button } from '@/components/ui/button';
import { BookOpen, Github, History, Loader2 } from 'lucide-react';
import { lazyWithRetry } from '@/lib/lazyWithRetry';
import { prefetchHighTrafficPages } from '@/lib/prefetchPages';

const NavigationActions = lazyWithRetry(() => import('@/components/NavigationActions'));
const HomeBanner = lazyWithRetry(() => import('@/components/HomeBanner'));
const WeatherAlertBanner = lazyWithRetry(() => import('@/components/WeatherAlertBanner'));
const AnnouncementDisplay = lazyWithRetry(() => import('@/components/AnnouncementDisplay'));

const BannerSkeleton = () => (
  <div className="h-14 w-full rounded-lg bg-blue-500 text-white shadow-md flex items-center justify-center gap-2" role="status" aria-label="首页横幅加载中">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="text-xs font-medium">天气加载中...</span>
  </div>
);
interface HomePageProps {
  userDisplayName: string;
  onSettingsClick: () => void;
  onEmergencyClick: () => void;
  onNavigate: (page: string, source?: string) => void;
  homeRef: React.RefObject<HTMLDivElement>;
}
const HomePage = ({
  userDisplayName,
  onSettingsClick,
  onEmergencyClick,
  onNavigate,
  homeRef
}: HomePageProps) => {
  // 使用 target="_top" 跳出预览 iframe，避免 LinkedIn/GitHub 因禁止被嵌入而显示 ERR_BLOCKED_BY_RESPONSE


  // 首页挂载后，浏览器空闲时预取高频子页面的 JS chunk，缩短点击进入时的等待
  useEffect(() => {
    prefetchHighTrafficPages();
  }, []);

  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" ref={homeRef}>
      <div className="container mx-auto px-4 py-3 max-w-md space-y-3">
        <UserWelcomeWithClock userDisplayName={userDisplayName} onSettingsClick={onSettingsClick} onEmergencyClick={onEmergencyClick} />
        
       
        <Suspense fallback={null}>
          <WeatherAlertBanner />
        </Suspense>
        
        <Suspense fallback={null}>
          <AnnouncementDisplay />
        </Suspense>
        
        {/* 天气与倒数日合并的自动滚动横幅 */}
        <Suspense fallback={<BannerSkeleton />}>
          <HomeBanner />
        </Suspense>
        
        <div className="grid grid-cols-2 gap-3">
          <FunctionCards onNavigate={onNavigate} />
        </div>

        
        {/* 使用手册和更新日志快速入口 */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => onNavigate('user-manual', 'home')} variant="outline" className="bg-white/70 hover:bg-white/90 border-blue-200 text-blue-700 font-medium py-3">
            <BookOpen className="h-4 w-4 mr-2" />
            使用手册
          </Button>
          
          <Button onClick={() => onNavigate('update-log', 'home')} variant="outline" className="bg-white/70 hover:bg-white/90 border-green-200 text-green-700 font-medium py-3">
            <History className="h-4 w-4 mr-2" />
            更新日志
          </Button>
        </div>
        
        <Suspense fallback={null}>
          <NavigationActions onDataExport={() => onNavigate("export")} onDailyData={() => onNavigate("daily-data")} />
        </Suspense>
        
        {/* 版权信息 - 缩减上方间距 */}
        <div className="pt-1 pb-4 text-center">
          <div className="h-px bg-gray-200 mb-2"></div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>© 2026 健康生活伴侣 - 专注于日常健康管理</div>
            <div>本应用仅供参考，不能替代专业医疗建议</div>
            <div className="mt-2">
              开发者：
              <a href="https://www.linkedin.com/in/tomtianys/" target="_top" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                田雨顺
              </a>
              <span className="mx-1 text-gray-400">|</span>
              <a href="https://github.com/TIAN-TOM" target="_top" className="text-gray-600 hover:text-gray-800 hover:underline transition-colors inline-flex items-center gap-0.5">
                <Github className="h-3 w-3" />
                GitHub
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>;
};
export default memo(HomePage);