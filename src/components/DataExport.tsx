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
  const [exportedData, setExportedData] = useState<string>('');
  const [showDataModal, setShowDataModal] = useState(false);
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

  // 移动端友好的复制功能
  const copyToClipboard = async (text: string, format: 'json' | 'text') => {
    try {
      // 首先尝试现代剪贴板API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
        toast({
          title: "复制成功",
          description: `${format === 'json' ? 'JSON格式' : '纯文本格式'}数据已复制到剪贴板`,
        });
        return;
      }
      
      // 备用方案：使用传统的选择和复制方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
        toast({
          title: "复制成功",
          description: `${format === 'json' ? 'JSON格式' : '纯文本格式'}数据已复制到剪贴板`,
        });
      } else {
        throw new Error('复制命令执行失败');
      }
    } catch (error) {
      console.error('复制失败:', error);
      // 如果复制失败，显示数据供用户手动复制
      setExportedData(text);
      setShowDataModal(true);
      toast({
        title: "自动复制失败",
        description: "请手动选择并复制下方显示的数据",
        variant: 'default'
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

        {/* 手动复制数据模态框 */}
        {showDataModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">请手动复制数据</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDataModal(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  自动复制失败，请选择下方文本并手动复制：
                </p>
                <textarea
                  value={exportedData}
                  readOnly
                  className="w-full h-64 p-3 border rounded-md font-mono text-xs resize-none"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                    textarea.select();
                    document.execCommand('copy');
                    toast({
                      title: "已选择文本",
                      description: "请使用系统复制功能(Ctrl+C 或长按选择复制)",
                    });
                  }}
                  className="flex-1"
                >
                  选择全部文本
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDataModal(false)}
                  className="flex-1"
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExport;
