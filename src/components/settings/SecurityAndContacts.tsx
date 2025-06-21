
import React from 'react';
import { Shield, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SecurityAndContactsProps {
  onEmergencyContacts: () => void;
}

const SecurityAndContacts = ({ onEmergencyContacts }: SecurityAndContactsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          安全与联系
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onEmergencyContacts}
          variant="outline"
          className="w-full justify-start"
        >
          <Phone className="h-4 w-4 mr-2" />
          紧急联系人管理
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecurityAndContacts;
