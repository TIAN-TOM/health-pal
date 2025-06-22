
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import PersonalSettings from './settings/PersonalSettings';
import UserPreferencesSection from './settings/UserPreferencesSection';
import HealthManagement from './settings/HealthManagement';
import SecurityAndContacts from './settings/SecurityAndContacts';
import LearningResources from './settings/LearningResources';
import UserManualSection from './settings/UserManualSection';
import AdminSection from './settings/AdminSection';
import AccountManagement from './settings/AccountManagement';
import DeveloperContact from './settings/DeveloperContact';
import UserInfo from './settings/UserInfo';

interface SettingsProps {
  onBack: () => void;
  onAdminPanel?: () => void;
  onEmergencyContacts: ()=> void;
  onMedicalRecords: () => void;
  onEducation: () => void;
  onMedicationManagement: () => void;
  onProfileEdit: () => void;
  onUserPreferences: () => void;
  onUserManual: () => void;
}

const Settings = ({ 
  onBack, 
  onAdminPanel, 
  onEmergencyContacts, 
  onMedicalRecords, 
  onEducation,
  onMedicationManagement,
  onProfileEdit,
  onUserPreferences,
  onUserManual
}: SettingsProps) => {
  const { user, userRole } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">设置</h1>
        </div>

        <div className="space-y-4">
          {userRole === 'admin' && onAdminPanel && (
            <AdminSection onAdminPanel={onAdminPanel} />
          )}
          
          <PersonalSettings onProfileEdit={onProfileEdit} />
          
          <UserPreferencesSection onUserPreferences={onUserPreferences} />
          
          <HealthManagement 
            onMedicationManagement={onMedicationManagement}
            onMedicalRecords={onMedicalRecords}
          />
          
          <SecurityAndContacts onEmergencyContacts={onEmergencyContacts} />
          
          <LearningResources onEducation={onEducation} />

          <UserManualSection onUserManual={onUserManual} />

          <AccountManagement />

          <DeveloperContact />

          <UserInfo userEmail={user?.email} userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
