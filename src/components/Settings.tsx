
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import HealthManagement from './settings/HealthManagement';
import SystemSettings from './settings/SystemSettings';
import AccountManagement from './settings/AccountManagement';
import UserInfo from './settings/UserInfo';
import PersonalSettingsCard from './settings/PersonalSettingsCard';

interface SettingsProps {
  onBack: () => void;
  onAdminPanel?: () => void;
  onEmergencyContacts: ()=> void;
  onMedicalRecords: () => void;
  onEducation: () => void;
  onMedicationManagement: () => void;
  onPersonalProfile: () => void;
  onUserManual: () => void;
  onUpdateLog: () => void;
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
  onUpdateLog
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
          <PersonalSettingsCard onPersonalProfile={onPersonalProfile} />
          
          <HealthManagement 
            onMedicationManagement={onMedicationManagement}
            onMedicalRecords={onMedicalRecords}
            onEmergencyContacts={onEmergencyContacts}
          />
          
          <SystemSettings 
            onEducation={onEducation}
            onUserManual={onUserManual}
            onUpdateLog={onUpdateLog}
            onAdminPanel={userRole === 'admin' ? onAdminPanel : undefined}
          />

          <AccountManagement />

          <UserInfo userEmail={user?.email} userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
