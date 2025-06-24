
import React from 'react';
import { Pill, FileText, Phone, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthManagementProps {
  onMedicationManagement: () => void;
  onMedicalRecords: () => void;
  onEmergencyContacts: () => void;
}

const HealthManagement = ({ onMedicationManagement, onMedicalRecords, onEmergencyContacts }: HealthManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" />
          健康管理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onMedicationManagement}
          variant="outline"
          className="w-full justify-start"
        >
          <Pill className="h-4 w-4 mr-2" />
          常用药物管理
        </Button>
        
        <Button
          onClick={onMedicalRecords}
          variant="outline"
          className="w-full justify-start"
        >
          <FileText className="h-4 w-4 mr-2" />
          就医记录管理
        </Button>
        
        <Button
          onClick={onEmergencyContacts}
          variant="outline"
          className="w-full justify-start"
        >
          <Phone className="h-4 w-4 mr-2" />
          紧急联系人
        </Button>
      </CardContent>
    </Card>
  );
};

export default HealthManagement;
