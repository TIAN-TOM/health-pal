/**
 * 路由级 chunk 预取：在浏览器空闲时把高频页面对应的 JS 提前下载好，
 * 这样用户点击进入时几乎无等待。预取失败被静默忽略，不影响主流程。
 */

type Importer = () => Promise<unknown>;

// 高频页面 → 动态 import 工厂。顺序代表预取优先级（越靠前越先取）。
const pageImporters: Record<string, Importer> = {
  'checkin': () => import('@/components/DailyCheckin'),
  'record-hub': () => import('@/components/RecordHub'),
  'settings': () => import('@/components/Settings'),
  'daily-data': () => import('@/components/DailyDataHub'),
  'familyDashboard': () => import('@/components/family/FamilyDashboard'),
  'breathing': () => import('@/components/BreathingExercise'),
  'games': () => import('@/components/Games'),
  'english': () => import('@/components/DailyEnglish'),
  'exchange-rate': () => import('@/components/ExchangeRate'),
  'medications': () => import('@/components/MedicationManagement'),
  'emergency': () => import('@/components/EmergencyMode'),
  'voice': () => import('@/components/VoiceRecord'),
  'profile': () => import('@/components/PersonalProfile'),
};

const prefetched = new Set<string>();
let started = false;

const runImporter = (key: string) => {
  if (prefetched.has(key)) return;
  const fn = pageImporters[key];
  if (!fn) return;
  prefetched.add(key);
  // 失败静默处理，避免污染控制台
  fn().catch(() => prefetched.delete(key));
};

const idle = (cb: () => void, timeout = 2000) => {
  const w = window as any;
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(cb, { timeout });
  } else {
    setTimeout(cb, 300);
  }
};

/** 用户即将进入某页面时主动预取（如 hover / pointerdown）。 */
export const prefetchPage = (page: string) => runImporter(page);

/** 在浏览器空闲时按优先级依次预取高频页面，每个间隔一帧避免争抢主线程。 */
export const prefetchHighTrafficPages = () => {
  if (started) return;
  started = true;
  const keys = Object.keys(pageImporters);
  let i = 0;
  const step = () => {
    if (i >= keys.length) return;
    runImporter(keys[i++]);
    idle(step);
  };
  idle(step);
};
