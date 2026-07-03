import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type FontSize = 'standard' | 'large' | 'xlarge';

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
  };
  root.style.fontSize = pxMap[s];
};

export const FontSizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window === 'undefined') return 'standard';
    return ((localStorage.getItem(STORAGE_KEY) as FontSize) || 'standard');
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
