
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';

interface NavigationActionsProps {
  onDataExport: () => void;
}

const NavigationActions = ({ onDataExport }: NavigationActionsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <Card 
        className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onDataExport}
      >
        <CardContent className="p-4 flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
            <Download className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-800">整理记录给医生</div>
            <div className="text-sm text-gray-600">导出数据用于就医或AI分析</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationActions;
