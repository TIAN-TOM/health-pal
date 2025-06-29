
import React from 'react';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import PersonalSettingsCard from './settings/PersonalSettingsCard';
import UserInfo from './settings/UserInfo';
import SystemSettings from './settings/SystemSettings';
import SecurityAndContacts from './settings/SecurityAndContacts';
import HealthManagement from './settings/HealthManagement';
import LearningResources from './settings/LearningResources';
import AdminSection from './settings/AdminSection';
import DeveloperContact from './settings/DeveloperContact';
import UserManualSection from './settings/UserManualSection';
import AccountManagement from './settings/AccountManagement';

interface SettingsProps {
  onBack: () => void;
  onAdminPanel: () => void;
  onEmergencyContacts: () => void;
  onMedicalRecords: () => void;
  onEducation: () => void;
  onMedicationManagement: () => void;
  onPersonalProfile: () => void;
  onUserManual: () => void;
}

const Settings = ({
  onBack,
  onAdminPanel,
  onEmergencyContacts,
  onMedicalRecords,
  onEducation,
  onMedicationManagement,
  onPersonalProfile,
  onUserManual,
}: SettingsProps) => {
  const { userRole, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">设置中心</h1>
          <div className="w-16" />
        </div>

        <div className="space-y-4">
          <UserInfo 
            userEmail={user?.email}
            userRole={userRole || 'user'}
          />
          
          <PersonalSettingsCard 
            onPersonalProfile={onPersonalProfile}
          />
          
          <SystemSettings />
          
          <SecurityAndContacts 
            onEmergencyContacts={onEmergencyContacts}
          />
          
          <HealthManagement
            onMedicalRecords={onMedicalRecords}
            onMedicationManagement={onMedicationManagement}
            onEmergencyContacts={onEmergencyContacts}
          />
          
          <LearningResources
            onEducation={onEducation}
          />
          
          <UserManualSection
            onUserManual={onUserManual}
          />
          
          <AccountManagement />
          
          {userRole === 'admin' && (
            <AdminSection onAdminPanel={onAdminPanel} />
          )}
          
          <DeveloperContact />
        </div>
      </div>
    </div>
  );
};

export default Settings;
