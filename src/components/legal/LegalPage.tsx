import React, { useEffect, useState } from 'react';
import { ArrowLeft, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalPageProps {
  title: string;
  titleEn: string;
  content: React.ReactNode;
  contentEn: React.ReactNode;
  onBack?: () => void;
}

/**
 * 通用合规页面容器：支持中英文切换 + 返回按钮，复用站点视觉。
 */
const LegalPage = ({ title, titleEn, content, contentEn, onBack }: LegalPageProps) => {
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
    if (typeof navigator !== 'undefined' && navigator.language.startsWith('en')) return 'en';
    return 'zh';
  });

  useEffect(() => {
    document.title = `${lang === 'zh' ? title : titleEn} - 健康生活伴侣`;
  }, [lang, title, titleEn]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md md:max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {lang === 'zh' ? '返回' : 'Back'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          >
            <Languages className="h-4 w-4 mr-1" />
            {lang === 'zh' ? 'English' : '中文'}
          </Button>
        </div>

        <article className="bg-white rounded-lg shadow-sm p-5 md:p-8 prose prose-sm md:prose-base max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700">
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            {lang === 'zh' ? title : titleEn}
          </h1>
          <p className="text-xs text-gray-500 mb-4">
            {lang === 'zh' ? '最后更新：2026-06-30' : 'Last updated: 2026-06-30'}
          </p>
          {lang === 'zh' ? content : contentEn}
        </article>

        <div className="text-center text-xs text-gray-500 mt-6 pb-6">
          © 2026 健康生活伴侣 · Health Pal
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
