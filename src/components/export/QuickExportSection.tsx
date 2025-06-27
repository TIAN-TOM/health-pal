
import React from 'react';
import { Calendar, Download, FileText, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickExportSectionProps {
  loading: boolean;
  copiedFormat: string | null;
  onExport: (period: string, format: 'text') => void;
}

const QuickExportSection = ({ loading, copiedFormat, onExport }: QuickExportSectionProps) => {
  const quickOptions = [
    { key: 'week', label: '最近一周', icon: Calendar },
    { key: 'month', label: '最近一个月', icon: Calendar },
    { key: 'quarter', label: '最近三个月', icon: Calendar },
    { key: 'all', label: '全部记录', icon: FileText }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2" />
          快速导出
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {quickOptions.map((option) => (
            <Button
              key={option.key}
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => onExport(option.key, 'text')}
              disabled={loading}
            >
              <div className="flex items-center w-full">
                <option.icon className="h-4 w-4 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">
                    整理为易读格式
                  </div>
                </div>
                {copiedFormat === `${option.key}-text` ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </Button>
          ))}
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <FileText className="h-4 w-4 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">导出说明</p>
              <ul className="space-y-1">
                <li>• 数据将按时间顺序整理</li>
                <li>• 包含所有记录类型的详细信息</li>
                <li>• 格式清晰，便于医生查看</li>
                <li>• 点击按钮后自动复制到剪贴板</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickExportSection;
