
import React from 'react';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationActionsProps {
  onDataExport: () => void;
  onDailyData: () => void;
}

const NavigationActions = ({ onDataExport, onDailyData }: NavigationActionsProps) => {
  return (
    <div className="space-y-4">
      {/* 每日数据查看 */}
      <div>
        <Button
          onClick={onDailyData}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-6 rounded-lg min-h-[64px]"
        >
          <TrendingUp className="mr-3 h-5 w-5" />
          <span className="leading-relaxed">查看每日数据</span>
        </Button>
      </div>

      {/* 数据导出 */}
      <div>
        <Button
          onClick={onDataExport}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-medium py-6 rounded-lg min-h-[64px]"
        >
          <Download className="mr-3 h-5 w-5" />
          <span className="leading-relaxed">整理记录给医生/AI</span>
        </Button>
      </div>

      {/* 作者声明 */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          © 2025 梅尼埃症生活伴侣 - 专注于梅尼埃症患者的健康管理
          <br />
          本应用仅供参考，不能替代专业医疗建议
          <br />
          如有严重症状请及时就医
          <br />
          <span className="mt-2 block">
            开发者：
            <a 
              href="https://www.linkedin.com/in/tom-tian-317580257/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Yushun Tian
            </a>
          </span>
        </p>
      </div>
    </div>
  );
};

export default NavigationActions;
