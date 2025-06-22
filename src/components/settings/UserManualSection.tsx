
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserManualSectionProps {
  onUserManual: () => void;
}

const UserManualSection = ({ onUserManual }: UserManualSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          帮助与支持
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onUserManual}
          variant="outline"
          className="w-full justify-start"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          使用手册
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserManualSection;
