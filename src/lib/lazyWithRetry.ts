import { lazy, type ComponentType } from 'react';

/**
 * lazy() 包装：当浏览器请求到陈旧 chunk 导致 "Failed to fetch dynamically imported module"
 * 时，自动刷新一次页面以拉取最新构建。使用 sessionStorage 标记防止刷新循环。
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem('__lovable_chunk_reload__');
      return mod;
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed')
      ) {
        const key = '__lovable_chunk_reload__';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw err;
    }
  });
