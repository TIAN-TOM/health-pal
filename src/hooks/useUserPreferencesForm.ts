
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  medical_history: string[];
  allergies: string[];
  preferred_language: string;
  timezone: string;
}

export const useUserPreferencesForm = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { preferences, loading, savePreferences } = useUserPreferences();
  
  const [formData, setFormData] = useState<FormData>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    medical_history: [],
    allergies: [],
    preferred_language: 'zh-CN',
    timezone: 'Asia/Shanghai'
  });

  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        age: preferences.age?.toString() || '',
        gender: preferences.gender || '',
        height: preferences.height?.toString() || '',
        weight: preferences.weight?.toString() || '',
        medical_history: preferences.medical_history || [],
        allergies: preferences.allergies || [],
        preferred_language: preferences.preferred_language || 'zh-CN',
        timezone: preferences.timezone || 'Asia/Shanghai'
      });
      setMedicalHistoryInput(preferences.medical_history?.join(', ') || '');
      setAllergiesInput(preferences.allergies?.join(', ') || '');
    }
  }, [preferences]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedData = {
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        gender: formData.gender ? formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say' : undefined,
        medical_history: medicalHistoryInput ? 
          medicalHistoryInput.split(',').map(item => item.trim()).filter(Boolean) : [],
        allergies: allergiesInput ? 
          allergiesInput.split(',').map(item => item.trim()).filter(Boolean) : [],
        preferred_language: formData.preferred_language,
        timezone: formData.timezone
      };

      console.log('Saving preferences:', updatedData);
      const success = await savePreferences(updatedData);
      
      if (success) {
        toast({
          title: t('success'),
          description: t('preferences_saved'),
        });
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: t('error'),
        description: t('preferences_save_failed'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    medicalHistoryInput,
    allergiesInput,
    isLoading,
    loading,
    handleFieldChange,
    setMedicalHistoryInput,
    setAllergiesInput,
    handleSave
  };
};
