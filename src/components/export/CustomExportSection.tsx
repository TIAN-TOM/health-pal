
import React from 'react';
import { Database, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CustomExportSectionProps {
  loading: boolean;
  copiedFormat: 'json' | 'text' | null;
  customStartDate: string;
  customEndDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onExport: (format: 'json' | 'text') => void;
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
        <CardTitle className="flex items-center text-lg">
          <Database className="h-5 w-5 mr-2" />
          自定义时间范围
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">开始日期</Label>
          <Input
            id="start-date"
            type="date"
            value={customStartDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">结束日期</Label>
          <Input
            id="end-date"
            type="date"
            value={customEndDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={customStartDate}
          />
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => onExport('json')}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4"
          >
            {copiedFormat === 'json' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {loading ? '导出中...' : '复制给AI的格式 (JSON)'}
          </Button>
          
          <Button
            onClick={() => onExport('text')}
            disabled={loading}
            variant="outline"
            className="w-full py-4"
          >
            {copiedFormat === 'text' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {loading ? '导出中...' : '复制给人看的格式 (纯文本)'}
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">提示：</p>
          <p>• 选择您需要的具体时间段</p>
          <p>• 开始日期不能晚于结束日期</p>
          <p>• 可以选择任何日期范围进行数据导出</p>
          <p>• 支持选择未来日期以便预设导出计划</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomExportSection;
