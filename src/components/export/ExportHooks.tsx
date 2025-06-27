
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getRecordsByDateRange, generateTextFormat } from '@/services/dataExportService';
import { getBeijingTime, getBeijingDateString } from '@/utils/beijingTime';

export const useDataExport = () => {
  const [loading, setLoading] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [exportedData, setExportedData] = useState<string>('');
  const [showDataModal, setShowDataModal] = useState(false);

  const handleQuickExport = async (period: string, format: 'text') => {
    setLoading(true);
    try {
      const today = getBeijingTime();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
        default:
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
      }

      const startDateStr = getBeijingDateString(startDate);
      const endDateStr = getBeijingDateString(today);
      
      console.log('快速导出参数:', { period, format, startDateStr, endDateStr });
      
      const records = await getRecordsByDateRange(startDateStr, endDateStr);
      console.log('获取到的记录数量:', records?.length || 0);

      let formattedData = '';
      if (format === 'text') {
        formattedData = generateTextFormat(records, startDateStr, endDateStr);
      }

      // 复制到剪贴板
      await navigator.clipboard.writeText(formattedData);
      
      setCopiedFormat(`${period}-${format}`);
      setTimeout(() => setCopiedFormat(null), 3000);
      
      toast({
        title: "导出成功",
        description: "数据已复制到剪贴板",
      });

      // 保存数据以供模态框显示
      setExportedData(formattedData);
      
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomExport = async (startDate: string, endDate: string, format: 'text') => {
    if (!startDate || !endDate) {
      toast({
        title: "请选择时间范围",
        description: "需要设置开始和结束日期",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('自定义导出参数:', { startDate, endDate, format });
      
      const records = await getRecordsByDateRange(startDate, endDate);
      console.log('获取到的记录数量:', records?.length || 0);

      let formattedData = '';
      if (format === 'text') {
        formattedData = generateTextFormat(records, startDate, endDate);
      }

      // 复制到剪贴板
      await navigator.clipboard.writeText(formattedData);
      
      setCopiedFormat(`custom-${format}`);
      setTimeout(() => setCopiedFormat(null), 3000);
      
      toast({
        title: "导出成功",
        description: "数据已复制到剪贴板",
      });

      // 保存数据以供模态框显示
      setExportedData(formattedData);
      
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    copiedFormat,
    exportedData,
    showDataModal,
    setShowDataModal,
    handleQuickExport,
    handleCustomExport
  };
};
