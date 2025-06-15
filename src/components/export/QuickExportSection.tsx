
import React from 'react';
import { Calendar, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickExportSectionProps {
  loading: boolean;
  copiedFormat: 'json' | 'text' | null;
  onExport: (timeRange: 'week' | 'month', format: 'json' | 'text') => void;
}

const QuickExportSection = ({ loading, copiedFormat, onExport }: QuickExportSectionProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            最近一周记录
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => onExport('week', 'json')}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4"
          >
            {copiedFormat === 'json' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {loading ? '导出中...' : '复制给AI的格式 (JSON)'}
          </Button>
          
          <Button
            onClick={() => onExport('week', 'text')}
            disabled={loading}
            variant="outline"
            className="w-full py-4"
          >
            {copiedFormat === 'text' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {loading ? '导出中...' : '复制给人看的格式 (纯文本)'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            最近一个月记录
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => onExport('month', 'json')}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4"
          >
            {copiedFormat === 'json' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {loading ? '导出中...' : '复制给AI的格式 (JSON)'}
          </Button>
          
          <Button
            onClick={() => onExport('month', 'text')}
            disabled={loading}
            variant="outline"
            className="w-full py-4"
          >
            {copiedFormat === 'text' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {loading ? '导出中...' : '复制给人看的格式 (纯文本)'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            导出说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>JSON格式</strong>：适合复制给AI分析，结构化数据便于AI理解</p>
            <p>• <strong>纯文本格式</strong>：适合发送给家人或医生查看，人类可读</p>
            <p>• 数据会自动复制到剪贴板，直接粘贴即可使用</p>
            <p>• 包含完整的症状、用药、生活记录、每日打卡信息</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickExportSection;
