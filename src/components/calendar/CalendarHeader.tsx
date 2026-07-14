
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CalendarHeaderProps {
  monthName: string;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onRefresh: () => void;
  onDeleteAll: () => void;
  loading: boolean;
}

const CalendarHeader = ({
  monthName,
  onNavigateMonth,
  onGoToToday,
  onRefresh,
  onDeleteAll,
  loading
}: CalendarHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button onClick={onRefresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={loading}>
                清空记录
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定清空全部打卡记录？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将永久删除你的<strong>全部</strong>打卡历史，连续打卡天数也会清零，且<strong>无法恢复</strong>。请谨慎操作。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={onGoToToday} variant="outline" size="sm">
            今天
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Button
          onClick={() => onNavigateMonth('prev')}
          variant="ghost"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-medium">{monthName}</h3>
        
        <Button
          onClick={() => onNavigateMonth('next')}
          variant="ghost"
          size="sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default CalendarHeader;
