import React from 'react';
import { Sun, Moon, Monitor, Palette, Type } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { useFontSize, type FontSize } from '@/contexts/FontSizeContext';
import { cn } from '@/lib/utils';

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
];

const fontOptions: { value: FontSize; label: string; sample: string }[] = [
  { value: 'standard', label: '标准', sample: 'Aa' },
  { value: 'large', label: '大', sample: 'Aa' },
  { value: 'xlarge', label: '加大', sample: 'Aa' },
  { value: 'xxlarge', label: '特大', sample: 'Aa' },
];

const sampleSizeClass: Record<FontSize, string> = {
  standard: 'text-base',
  large: 'text-lg',
  xlarge: 'text-xl',
  xxlarge: 'text-2xl',
};

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          外观主题
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => {
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
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2 flex items-center">
            <Type className="h-4 w-4 mr-1.5" />
            全局字号
          </p>
          <div className="grid grid-cols-2 gap-2">
            {fontOptions.map(({ value, label, sample }) => {
              const active = fontSize === value;
              const sizeClass = sampleSizeClass[value];
              return (
                <Button
                  key={value}
                  variant={active ? 'default' : 'outline'}
                  onClick={() => setFontSize(value)}
                  className={cn('flex flex-col h-auto py-3 gap-1', active && 'ring-2 ring-primary')}
                >
                  <span className={cn('font-semibold leading-none', sizeClass)}>{sample}</span>
                  <span className="text-xs">{label}</span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            调整后整个应用界面会随之放大，适合视力不便的用户。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
