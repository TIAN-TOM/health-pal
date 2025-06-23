
import React from 'react';
import { Heart } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';

interface HealthInfoSectionProps {
  medicalHistoryInput: string;
  allergiesInput: string;
  onMedicalHistoryChange: (value: string) => void;
  onAllergiesChange: (value: string) => void;
}

const HealthInfoSection = ({ 
  medicalHistoryInput, 
  allergiesInput, 
  onMedicalHistoryChange, 
  onAllergiesChange 
}: HealthInfoSectionProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-3">
        <Heart className="h-5 w-5 mr-2 text-red-600" />
        <h3 className="text-lg font-medium">{t('health_info')}</h3>
      </div>
      
      <div>
        <Label htmlFor="medical_history">{t('medical_history')}</Label>
        <Textarea
          id="medical_history"
          placeholder={t('medical_history_placeholder')}
          value={medicalHistoryInput}
          onChange={(e) => onMedicalHistoryChange(e.target.value)}
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="allergies">{t('allergies')}</Label>
        <Textarea
          id="allergies"
          placeholder={t('allergies_placeholder')}
          value={allergiesInput}
          onChange={(e) => onAllergiesChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default HealthInfoSection;
