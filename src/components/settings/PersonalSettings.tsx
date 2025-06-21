
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PersonalSettingsProps {
  onProfileEdit: () => void;
}

const PersonalSettings = ({ onProfileEdit }: PersonalSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2" />
          个人设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onProfileEdit}
          variant="outline"
          className="w-full justify-start"
        >
          <User className="h-4 w-4 mr-2" />
          编辑个人资料
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalSettings;
