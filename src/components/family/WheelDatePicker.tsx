import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zhCN } from 'date-fns/locale';

interface WheelDatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const WheelDatePicker = ({ 
  date, 
  onDateChange, 
  placeholder = "选择日期",
  label,
  className 
}: WheelDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(date ? date.getFullYear() : new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(date ? date.getMonth() + 1 : new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(date ? date.getDate() : new Date().getDate());

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  // 年份范围：1900年到当前年份+10年
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 11 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 计算当前年月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  // 更新日期选择
  useEffect(() => {
    if (date) {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
      setSelectedDay(date.getDate());
    }
  }, [date]);

  // 当年份或月份改变时，调整日期
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (date) {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
      setSelectedDay(date.getDate());
    }
    setIsOpen(false);
  };

  const scrollToValue = (ref: React.RefObject<HTMLDivElement>, value: number, itemHeight: number = 40) => {
    if (ref.current) {
      const index = ref.current.children[0].children.length > 0 ? 
        Array.from(ref.current.children[0].children).findIndex(child => 
          parseInt(child.textContent || '0') === value
        ) : 0;
      ref.current.scrollTop = index * itemHeight - itemHeight * 2; // 居中显示
    }
  };

  // 在打开时滚动到当前选中的值
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToValue(yearRef, selectedYear);
        scrollToValue(monthRef, selectedMonth);
        scrollToValue(dayRef, selectedDay);
      }, 100);
    }
  }, [isOpen, selectedYear, selectedMonth, selectedDay]);

  const WheelItem = ({ 
    items, 
    selectedValue, 
    onValueChange, 
    wheelRef 
  }: { 
    items: number[], 
    selectedValue: number, 
    onValueChange: (value: number) => void,
    wheelRef: React.RefObject<HTMLDivElement>
  }) => (
    <div 
      ref={wheelRef}
      className="h-40 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div className="flex flex-col">
        {/* 顶部空白 */}
        <div style={{ height: '80px' }}></div>
        {items.map(item => (
          <div
            key={item}
            className={cn(
              "h-10 flex items-center justify-center cursor-pointer transition-all duration-200",
              selectedValue === item 
                ? "bg-primary text-primary-foreground font-semibold scale-110" 
                : "hover:bg-accent text-muted-foreground"
            )}
            onClick={() => onValueChange(item)}
          >
            {item}
          </div>
        ))}
        {/* 底部空白 */}
        <div style={{ height: '80px' }}></div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'yyyy年MM月dd日', { locale: zhCN }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <div className="text-sm font-medium mb-3 text-center">选择日期</div>
            
            {/* 滚轮选择器 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">年</div>
                <WheelItem
                  items={years}
                  selectedValue={selectedYear}
                  onValueChange={setSelectedYear}
                  wheelRef={yearRef}
                />
              </div>
              
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">月</div>
                <WheelItem
                  items={months}
                  selectedValue={selectedMonth}
                  onValueChange={setSelectedMonth}
                  wheelRef={monthRef}
                />
              </div>
              
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">日</div>
                <WheelItem
                  items={days}
                  selectedValue={selectedDay}
                  onValueChange={setSelectedDay}
                  wheelRef={dayRef}
                />
              </div>
            </div>
            
            {/* 确认按钮 */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                取消
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                确认
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* 显示选中的日期 */}
      {date && (
        <p className="text-sm text-muted-foreground">
          已选择：{format(date, 'yyyy年MM月dd日', { locale: zhCN })}
        </p>
      )}
    </div>
  );
};

export default WheelDatePicker;