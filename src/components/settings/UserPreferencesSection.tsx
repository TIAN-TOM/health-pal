
import React from 'react';
import { Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserPreferencesSectionProps {
  onUserPreferences: () => void;
}

const UserPreferencesSection = ({ onUserPreferences }: UserPreferencesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          偏好设置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onUserPreferences}
          variant="outline"
          className="w-full justify-start"
        >
          <User className="h-4 w-4 mr-2" />
          个人偏好设置
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserPreferencesSection;
