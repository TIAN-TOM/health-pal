
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Moon, Sun, Volume2, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const SystemSettings = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleUpdateLog = () => {
    // 这里需要通过父组件传递导航功能
    window.dispatchEvent(new CustomEvent('navigate-to-update-log'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          系统设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span>推送通知</span>
          </div>
          <Switch 
            checked={notifications} 
            onCheckedChange={setNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
            <span>深色模式</span>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={setDarkMode}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            <span>音效开关</span>
          </div>
          <Switch 
            checked={soundEnabled} 
            onCheckedChange={setSoundEnabled}
          />
        </div>

        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleUpdateLog}
          >
            <FileText className="h-4 w-4 mr-2" />
            更新日志
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
