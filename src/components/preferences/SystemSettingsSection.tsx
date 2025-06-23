
import React from 'react';
import { Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface SystemSettingsSectionProps {
  formData: {
    preferred_language: string;
    timezone: string;
  };
  onChange: (field: string, value: string) => void;
}

const SystemSettingsSection = ({ formData, onChange }: SystemSettingsSectionProps) => {
  const { t, setLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    onChange('preferred_language', value);
    setLanguage(value as Language);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-3">
        <Globe className="h-5 w-5 mr-2 text-green-600" />
        <h3 className="text-lg font-medium">{t('system_settings')}</h3>
      </div>
      
      <div>
        <Label htmlFor="language">{t('preferred_language')}</Label>
        <Select value={formData.preferred_language} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh-CN">{t('simplified_chinese')}</SelectItem>
            <SelectItem value="zh-TW">{t('traditional_chinese')}</SelectItem>
            <SelectItem value="en">{t('english')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="timezone">{t('timezone')}</Label>
        <Select value={formData.timezone} onValueChange={(value) => onChange('timezone', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Shanghai">{t('beijing_time')}</SelectItem>
            <SelectItem value="Asia/Hong_Kong">{t('hongkong_time')}</SelectItem>
            <SelectItem value="Asia/Taipei">{t('taipei_time')}</SelectItem>
            <SelectItem value="UTC">{t('utc_time')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SystemSettingsSection;
