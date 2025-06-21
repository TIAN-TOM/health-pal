
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBeijingTime, getBeijingDateString, getCurrentBeijingTime } from '@/utils/beijingTime';
import QuickExportSection from './export/QuickExportSection';
import CustomExportSection from './export/CustomExportSection';
import AIAssistantSection from './export/AIAssistantSection';
import ExportModal from './export/ExportModal';
import { useDataExport } from './export/ExportHooks';

interface DataExportProps {
  onBack: () => void;
}

const DataExport = ({ onBack }: DataExportProps) => {
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const {
    loading,
    copiedFormat,
    exportedData,
    showDataModal,
    setShowDataModal,
    handleQuickExport,
    handleCustomExport
  } = useDataExport();

  // 设置默认日期（最近一个月）- 使用北京时间
  React.useEffect(() => {
    // 页面加载时滚动到顶部
    window.scrollTo(0, 0);
    
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

  const handleCustomExportWrapper = (format: 'json' | 'text') => {
    handleCustomExport(customStartDate, customEndDate, format);
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
              onExport={handleCustomExportWrapper}
            />
            <div className="mt-6">
              <AIAssistantSection />
            </div>
          </TabsContent>
        </Tabs>

        <ExportModal
          showDataModal={showDataModal}
          exportedData={exportedData}
          onClose={() => setShowDataModal(false)}
        />
      </div>
    </div>
  );
};

export default DataExport;
