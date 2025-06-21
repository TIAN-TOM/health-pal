
import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminSectionProps {
  onAdminPanel: () => void;
}

const AdminSection = ({ onAdminPanel }: AdminSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          管理员
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onAdminPanel}
          variant="outline"
          className="w-full justify-start"
        >
          <Shield className="h-4 w-4 mr-2" />
          管理员面板
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminSection;
