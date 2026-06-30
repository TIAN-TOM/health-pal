/**
 * 轻量错误上报封装。
 *
 * 当前实现：捕获 window.onerror / unhandledrejection，输出到 console 并保存最近 50 条
 * 到内存供调试。如需正式接入 Sentry/Bugsnag 等服务，将 `dispatch` 替换为对应 SDK 调用，
 * 并通过 `VITE_SENTRY_DSN` 等环境变量动态加载。
 *
 * 注意：未使用任何外部 SDK，避免引入额外依赖与体积。
 */

interface ReportedError {
  message: string;
  stack?: string;
  at: string;
  source: 'window.onerror' | 'unhandledrejection' | 'manual';
  url?: string;
}

const RECENT_CAP = 50;
const recent: ReportedError[] = [];

const dispatch = (err: ReportedError) => {
  recent.push(err);
  if (recent.length > RECENT_CAP) recent.shift();
  // 生产环境也保留 console 输出，便于早期排查；
  // 接入正式服务后可在此处转发。
  // eslint-disable-next-line no-console
  console.error('[errorReporter]', err);
};

export function captureException(err: unknown, context?: Record<string, unknown>) {
  const e = err instanceof Error ? err : new Error(String(err));
  dispatch({
    message: context ? `${e.message} | ctx=${JSON.stringify(context)}` : e.message,
    stack: e.stack,
    at: new Date().toISOString(),
    source: 'manual',
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  });
}

export function getRecentErrors(): ReportedError[] {
  return [...recent];
}

let installed = false;
export function initErrorReporter() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    dispatch({
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      at: new Date().toISOString(),
      source: 'window.onerror',
      url: window.location.href,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
        ? reason
        : 'Unhandled promise rejection';
    dispatch({
      message,
      stack: reason instanceof Error ? reason.stack : undefined,
      at: new Date().toISOString(),
      source: 'unhandledrejection',
      url: window.location.href,
    });
  });
}
