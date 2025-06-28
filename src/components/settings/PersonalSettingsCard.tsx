
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PersonalSettingsCardProps {
  onPersonalProfile: () => void;
}

const PersonalSettingsCard = ({ onPersonalProfile }: PersonalSettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2" />
          个人设置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onPersonalProfile}
          variant="outline"
          className="w-full justify-start"
        >
          <User className="h-4 w-4 mr-2" />
          个人资料与偏好设置
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalSettingsCard;
