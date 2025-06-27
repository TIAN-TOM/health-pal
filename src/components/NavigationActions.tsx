import React from 'react';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface NavigationActionsProps {
  onDataExport: () => void;
  onDailyData: () => void;
}
const NavigationActions = ({
  onDataExport,
  onDailyData
}: NavigationActionsProps) => {
  return <div className="space-y-4">
      {/* 每日数据中心 */}
      <div>
        <Button onClick={onDailyData} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-6 rounded-lg min-h-[64px]">
          <Calendar className="mr-3 h-5 w-5" />
          <span className="leading-relaxed">每日数据中心</span>
        </Button>
      </div>

      {/* 数据导出 */}
      <div>
        <Button onClick={onDataExport} className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-medium py-6 rounded-lg min-h-[64px]">
          <Download className="mr-3 h-5 w-5" />
          <span className="leading-relaxed">整理记录给医生/AI</span>
        </Button>
      </div>

      {/* 作者声明 */}
      
    </div>;
};
export default NavigationActions;