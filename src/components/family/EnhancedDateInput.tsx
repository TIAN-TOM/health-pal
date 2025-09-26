import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zhCN } from 'date-fns/locale';
import WheelDatePicker from './WheelDatePicker';

interface EnhancedDateInputProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const EnhancedDateInput = ({ 
  date, 
  onDateChange, 
  placeholder = "选择日期",
  label,
  className 
}: EnhancedDateInputProps) => {
  const [inputValue, setInputValue] = useState(
    date ? format(date, 'yyyy-MM-dd') : ''
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 尝试解析输入的日期
    if (value) {
      // 支持多种日期格式，包括无分隔符格式
      const formats = [
        'yyyy-MM-dd',
        'yyyy/MM/dd', 
        'MM/dd/yyyy',
        'MM-dd-yyyy',
        'dd/MM/yyyy',
        'dd-MM-yyyy',
        'yyyyMMdd'  // 支持无分隔符格式如20020101
      ];
      
      for (const dateFormat of formats) {
        try {
          const parsedDate = parse(value, dateFormat, new Date());
          if (isValid(parsedDate)) {
            onDateChange(parsedDate);
            return;
          }
        } catch {
          // Continue to next format
        }
      }
    } else {
      onDateChange(undefined);
    }
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate) {
      setInputValue(format(selectedDate, 'yyyy-MM-dd'));
    } else {
      setInputValue('');
    }
    setIsPopoverOpen(false);
  };

  const handleWheelDateChange = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate) {
      setInputValue(format(selectedDate, 'yyyy-MM-dd'));
    } else {
      setInputValue('');
    }
  };

  // 格式化中文显示
  const formatChineseDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日', { locale: zhCN });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex space-x-2">
        {/* 手动输入框 */}
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="输入日期，如 2024-01-01 或 20240101"
          className="flex-1"
        />
        
        {/* 日期选择按钮 */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-10 p-0",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calendar" className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>日历</span>
                </TabsTrigger>
                <TabsTrigger value="wheel" className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>滚轮</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleCalendarSelect}
                  initialFocus
                  className="pointer-events-auto"
                  locale={zhCN}
                  formatters={{
                    formatMonthCaption: (date) => format(date, 'yyyy年MM月', { locale: zhCN }),
                    formatWeekdayName: (date) => format(date, 'eeeee', { locale: zhCN })
                  }}
                />
              </TabsContent>
              
              <TabsContent value="wheel" className="p-4">
                <WheelDatePicker
                  date={date}
                  onDateChange={handleWheelDateChange}
                  placeholder={placeholder}
                />
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* 显示选中的日期（中文格式） */}
      {date && (
        <p className="text-sm text-muted-foreground">
          已选择：{formatChineseDate(date)}
        </p>
      )}
    </div>
  );
};

export default EnhancedDateInput;