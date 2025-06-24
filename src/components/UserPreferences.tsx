
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import BasicInfoSection from '@/components/preferences/BasicInfoSection';
import HealthInfoSection from '@/components/preferences/HealthInfoSection';
import SystemSettingsSection from '@/components/preferences/SystemSettingsSection';
import { useUserPreferencesForm } from '@/hooks/useUserPreferencesForm';

interface UserPreferencesProps {
  onBack: () => void;
}

const UserPreferences = ({ onBack }: UserPreferencesProps) => {
  const {
    formData,
    medicalHistoryInput,
    allergiesInput,
    isLoading,
    loading,
    handleFieldChange,
    setMedicalHistoryInput,
    setAllergiesInput,
    handleSave
  } = useUserPreferencesForm();

  if (loading) {
    return (
      <PageLayout title="个人偏好设置" onBack={onBack}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="个人偏好设置" onBack={onBack}>
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <BasicInfoSection
              formData={formData}
              onChange={handleFieldChange}
            />

            <HealthInfoSection
              medicalHistoryInput={medicalHistoryInput}
              allergiesInput={allergiesInput}
              onMedicalHistoryChange={setMedicalHistoryInput}
              onAllergiesChange={setAllergiesInput}
            />

            <SystemSettingsSection />

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default UserPreferences;
