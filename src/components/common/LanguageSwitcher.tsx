
import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="zh-CN">{t('simplified_chinese')}</SelectItem>
          <SelectItem value="en">{t('english')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
