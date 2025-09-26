import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zhCN } from 'date-fns/locale';

interface DateInputWithCalendarProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const DateInputWithCalendar = ({ 
  date, 
  onDateChange, 
  placeholder = "选择日期",
  label,
  className 
}: DateInputWithCalendarProps) => {
  const [inputValue, setInputValue] = useState(
    date ? format(date, 'yyyy-MM-dd') : ''
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 尝试解析输入的日期
    if (value) {
      // 支持多种日期格式
      const formats = [
        'yyyy-MM-dd',
        'yyyy/MM/dd', 
        'MM/dd/yyyy',
        'MM-dd-yyyy',
        'dd/MM/yyyy',
        'dd-MM-yyyy'
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
    setIsCalendarOpen(false);
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
          placeholder="输入日期，如 2024-01-01"
          className="flex-1"
        />
        
        {/* 日历选择按钮 */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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

export default DateInputWithCalendar;