
import React from 'react';
import { Download, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationActionsProps {
  onDataExport: () => void;
  onSignOut: () => void;
}

const NavigationActions = ({ onDataExport, onSignOut }: NavigationActionsProps) => {
  return (
    <>
      {/* 数据导出 */}
      <div className="mt-8">
        <Button
          onClick={onDataExport}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-medium py-6 rounded-lg min-h-[64px]"
        >
          <Download className="mr-3 h-5 w-5" />
          <span className="leading-relaxed">整理记录给医生/AI</span>
        </Button>
      </div>

      {/* 退出登录 - 移到底部不显眼位置 */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            <LogOut className="h-4 w-4 mr-1" />
            退出登录
          </Button>
        </div>
      </div>
    </>
  );
};

export default NavigationActions;
