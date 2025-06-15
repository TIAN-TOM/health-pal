
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getBeijingTime, getBeijingDateString, getCurrentBeijingTime } from '@/utils/beijingTime';
import { getRecordsByDateRange, generateJSONFormat, generateTextFormat } from '@/services/dataExportService';
import QuickExportSection from './export/QuickExportSection';
import CustomExportSection from './export/CustomExportSection';
import AIAssistantSection from './export/AIAssistantSection';

interface DataExportProps {
  onBack: () => void;
}

const DataExport = ({ onBack }: DataExportProps) => {
  const [loading, setLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'text' | null>(null);
  const { toast } = useToast();

  // 设置默认日期（最近一个月）- 使用北京时间
  React.useEffect(() => {
    const today = getBeijingTime();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    const todayStr = getBeijingDateString(today);
    const oneMonthAgoStr = getBeijingDateString(oneMonthAgo);
    
    console.log('设置默认日期范围:', oneMonthAgoStr, '-', todayStr);
    
    setCustomEndDate(todayStr);
    setCustomStartDate(oneMonthAgoStr);
    
    // 打印当前北京时间
    getCurrentBeijingTime();
  }, []);

  const copyToClipboard = async (text: string, format: 'json' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      toast({
        title: "复制成功",
        description: `${format === 'json' ? 'JSON格式' : '纯文本格式'}数据已复制到剪贴板`,
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制数据",
        variant: 'destructive'
      });
    }
  };

  const handleQuickExport = async (timeRange: 'week' | 'month', format: 'json' | 'text') => {
    setLoading(true);
    try {
      // 动态计算时间范围 - 使用最新的北京时间
      const now = getBeijingTime();
      const timeLimit = new Date(now);
      
      if (timeRange === 'week') {
        timeLimit.setDate(now.getDate() - 7);
      } else {
        timeLimit.setMonth(now.getMonth() - 1);
      }
      
      const startDateStr = getBeijingDateString(timeLimit);
      const endDateStr = getBeijingDateString(now);
      
      console.log('快速导出时间范围:', startDateStr, '-', endDateStr);
      console.log('使用的北京时间:', now.toISOString());
      
      const records = await getRecordsByDateRange(timeLimit, now);

      console.log('导出的记录数量:', records?.length || 0);

      if (!records || records.length === 0) {
        toast({
          title: '提示',
          description: '选定时间范围内没有记录数据',
        });
        return;
      }

      if (format === 'json') {
        const jsonData = generateJSONFormat(records, startDateStr, endDateStr);
        await copyToClipboard(JSON.stringify(jsonData, null, 2), 'json');
      } else {
        const textData = generateTextFormat(records, startDateStr, endDateStr);
        await copyToClipboard(textData, 'text');
      }

    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomExport = async (format: 'json' | 'text') => {
    if (!customStartDate || !customEndDate) {
      toast({
        title: '错误',
        description: '请选择开始和结束日期',
        variant: 'destructive'
      });
      return;
    }

    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    
    if (startDate > endDate) {
      toast({
        title: '错误',
        description: '开始日期不能晚于结束日期',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('自定义导出时间范围:', customStartDate, '-', customEndDate);
      
      const records = await getRecordsByDateRange(startDate, endDate);

      console.log('导出的记录数量:', records?.length || 0);

      if (!records || records.length === 0) {
        toast({
          title: '提示',
          description: '选定时间范围内没有记录数据',
        });
        return;
      }

      if (format === 'json') {
        const jsonData = generateJSONFormat(records, customStartDate, customEndDate);
        await copyToClipboard(JSON.stringify(jsonData, null, 2), 'json');
      } else {
        const textData = generateTextFormat(records, customStartDate, customEndDate);
        await copyToClipboard(textData, 'text');
      }

    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">整理记录给医生/AI</h1>
          <div className="w-16"></div>
        </div>

        <Tabs defaultValue="quick" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">快速导出</TabsTrigger>
            <TabsTrigger value="custom">自定义时间</TabsTrigger>
          </TabsList>

          <TabsContent value="quick">
            <QuickExportSection
              loading={loading}
              copiedFormat={copiedFormat}
              onExport={handleQuickExport}
            />
            <div className="mt-6">
              <AIAssistantSection />
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <CustomExportSection
              loading={loading}
              copiedFormat={copiedFormat}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onStartDateChange={setCustomStartDate}
              onEndDateChange={setCustomEndDate}
              onExport={handleCustomExport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataExport;
