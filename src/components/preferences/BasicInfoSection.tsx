
import React from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface BasicInfoSectionProps {
  formData: {
    age: string;
    gender: string;
    height: string;
    weight: string;
  };
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection = ({ formData, onChange }: BasicInfoSectionProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-3">
        <User className="h-5 w-5 mr-2 text-blue-600" />
        <h3 className="text-lg font-medium">{t('basic_info')}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">{t('age')}</Label>
          <Input
            id="age"
            type="number"
            placeholder={t('age_placeholder')}
            value={formData.age}
            onChange={(e) => onChange('age', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="gender">{t('gender')}</Label>
          <Select value={formData.gender} onValueChange={(value) => onChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('please_select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('male')}</SelectItem>
              <SelectItem value="female">{t('female')}</SelectItem>
              <SelectItem value="other">{t('other')}</SelectItem>
              <SelectItem value="prefer_not_to_say">{t('prefer_not_to_say')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height">{t('height')}</Label>
          <Input
            id="height"
            type="number"
            placeholder={t('height_placeholder')}
            value={formData.height}
            onChange={(e) => onChange('height', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="weight">{t('weight')}</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder={t('weight_placeholder')}
            value={formData.weight}
            onChange={(e) => onChange('weight', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
