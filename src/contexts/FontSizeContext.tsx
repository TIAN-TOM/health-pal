import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const FONT_SIZES = ['standard', 'large', 'xlarge', 'xxlarge'] as const;

export type FontSize = (typeof FONT_SIZES)[number];

const isFontSize = (v: string | null): v is FontSize =>
  v !== null && (FONT_SIZES as readonly string[]).includes(v);

interface FontSizeContextValue {
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextValue | undefined>(undefined);
const STORAGE_KEY = 'font_size';

const apply = (s: FontSize) => {
  const root = document.documentElement;
  root.dataset.fontSize = s;
  // 调整根字号，Tailwind 的 rem 单位会自动放大
  const pxMap: Record<FontSize, string> = {
    standard: '16px',
    large: '18px',
    xlarge: '20px',
    xxlarge: '24px',
  };
  root.style.fontSize = pxMap[s];
};

export const FontSizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window === 'undefined') return 'standard';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // 未知或过期的存储值一律回退到标准字号，避免渲染异常
      return isFontSize(stored) ? stored : 'standard';
    } catch {
      return 'standard';
    }
  });

  useEffect(() => {
    apply(fontSize);
    try { localStorage.setItem(STORAGE_KEY, fontSize); } catch { /* ignore */ }
  }, [fontSize]);

  const setFontSize = useCallback((s: FontSize) => setFontSizeState(s), []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error('useFontSize must be used within FontSizeProvider');
  return ctx;
};
