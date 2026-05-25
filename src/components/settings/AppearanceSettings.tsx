import React from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
];

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          外观主题
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {options.map(({ value, label, icon: Icon }) => {
            const active = theme === value;
            return (
              <Button
                key={value}
                variant={active ? 'default' : 'outline'}
                onClick={() => setTheme(value)}
                className={cn('flex flex-col h-auto py-3 gap-1', active && 'ring-2 ring-primary')}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
