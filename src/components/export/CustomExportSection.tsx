
import React from 'react';
import { Calendar, Download, FileText, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomExportSectionProps {
  loading: boolean;
  copiedFormat: string | null;
  customStartDate: string;
  customEndDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onExport: (format: 'text') => void;
}

const CustomExportSection = ({
  loading,
  copiedFormat,
  customStartDate,
  customEndDate,
  onStartDateChange,
  onEndDateChange,
  onExport
}: CustomExportSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          自定义时间范围
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">开始日期</Label>
            <Input
              id="startDate"
              type="date"
              value={customStartDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">结束日期</Label>
            <Input
              id="endDate"
              type="date"
              value={customEndDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start h-auto p-4"
          onClick={() => onExport('text')}
          disabled={loading || !customStartDate || !customEndDate}
        >
          <div className="flex items-center w-full">
            <FileText className="h-4 w-4 mr-3" />
            <div className="text-left flex-1">
              <div className="font-medium">导出自定义时间段</div>
              <div className="text-sm text-gray-500">
                整理为易读格式
              </div>
            </div>
            {copiedFormat === 'custom-text' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </Button>

        <div className="p-3 bg-amber-50 rounded-lg">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 text-amber-600 mt-0.5 mr-2" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">时间选择提示</p>
              <ul className="space-y-1">
                <li>• 选择合适的时间范围以获得有效数据</li>
                <li>• 建议导出最近1-3个月的记录</li>
                <li>• 时间跨度过大可能影响加载速度</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomExportSection;
