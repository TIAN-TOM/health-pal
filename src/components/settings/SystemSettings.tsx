
import React from 'react';
import { Settings as SettingsIcon, Book, HelpCircle, Shield, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemSettingsProps {
  onEducation: () => void;
  onUserManual: () => void;
  onUpdateLog: () => void;
  onAdminPanel?: () => void;
}

const SystemSettings = ({ onEducation, onUserManual, onUpdateLog, onAdminPanel }: SystemSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" />
          系统功能
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onEducation}
          variant="outline"
          className="w-full justify-start"
        >
          <Book className="h-4 w-4 mr-2" />
          科普资料
        </Button>
        
        <Button
          onClick={onUserManual}
          variant="outline"
          className="w-full justify-start"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          使用手册
        </Button>

        <Button
          onClick={onUpdateLog}
          variant="outline"
          className="w-full justify-start"
        >
          <History className="h-4 w-4 mr-2" />
          更新日志
        </Button>
        
        {onAdminPanel && (
          <Button
            onClick={onAdminPanel}
            variant="outline"
            className="w-full justify-start"
          >
            <Shield className="h-4 w-4 mr-2" />
            管理员面板
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
