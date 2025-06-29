
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Moon, Sun, Volume2, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const SystemSettings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState(() => {
    return localStorage.getItem('notifications-enabled') === 'true';
  });
  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem('dark-mode') === 'true' || document.documentElement.classList.contains('dark');
  });
  const [soundEnabled, setSoundEnabled] = React.useState(() => {
    return localStorage.getItem('sound-enabled') !== 'false';
  });

  const handleUpdateLog = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-update-log'));
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('notifications-enabled', enabled.toString());
    toast({
      title: enabled ? "已开启推送通知" : "已关闭推送通知",
      description: enabled ? "您将收到重要的应用通知" : "您将不再收到应用通知"
    });
  };

  const handleDarkModeChange = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('dark-mode', enabled.toString());
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: enabled ? "已开启深色模式" : "已关闭深色模式",
      description: enabled ? "界面已切换为深色主题" : "界面已切换为浅色主题"
    });
  };

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('sound-enabled', enabled.toString());
    toast({
      title: enabled ? "已开启音效" : "已关闭音效",
      description: enabled ? "应用音效已启用" : "应用音效已禁用"
    });
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
            onCheckedChange={handleNotificationsChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
            <span>深色模式</span>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={handleDarkModeChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            <span>音效开关</span>
          </div>
          <Switch 
            checked={soundEnabled} 
            onCheckedChange={handleSoundChange}
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
