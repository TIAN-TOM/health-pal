import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse, isValid } from 'date-fns';
import { Clock } from 'lucide-react';
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
    date ? format(date, 'yyyyMMdd') : ''
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 只支持无分隔符格式 YYYYMMDD
    if (value) {
      if (value.length === 8 && /^\d{8}$/.test(value)) {
        try {
          const parsedDate = parse(value, 'yyyyMMdd', new Date());
          if (isValid(parsedDate)) {
            onDateChange(parsedDate);
            return;
          }
        } catch {
          // Invalid date
        }
      }
      // 如果格式不正确，清除日期
      onDateChange(undefined);
    } else {
      onDateChange(undefined);
    }
  };

  const handleWheelDateChange = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate) {
      setInputValue(format(selectedDate, 'yyyyMMdd'));
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
          placeholder="输入日期，如 20240101"
          className="flex-1"
        />
        
        {/* 滚轮日期选择按钮 */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-10 p-0",
                !date && "text-muted-foreground"
              )}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4">
              <WheelDatePicker
                date={date}
                onDateChange={handleWheelDateChange}
                placeholder={placeholder}
              />
            </div>
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