
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { getRecordsByDateRange, generateTextFormat } from '@/services/dataExportService';
import { getBeijingTime } from '@/utils/beijingTime';
import { notifyAdminActivity, ACTIVITY_TYPES, MODULE_NAMES } from '@/services/adminNotificationService';

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
      
      console.log('快速导出参数:', { period, format, startDate, endDate: today });
      
      const records = await getRecordsByDateRange(startDate, today);
      console.log('获取到的记录:', records);

      let formattedData = '';
      if (format === 'text') {
        formattedData = generateTextFormat(records);
      }

      if (!formattedData || formattedData.trim() === '') {
        toast({
          title: "没有找到数据",
          description: "选择的时间范围内没有记录",
          variant: "destructive",
        });
        return;
      }

      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(formattedData);
        setCopiedFormat(`${period}-${format}`);
        setTimeout(() => setCopiedFormat(null), 3000);
        
        toast({
          title: "导出成功",
          description: "数据已复制到剪贴板",
        });

        // 通知管理员用户进行了数据导出
        await notifyAdminActivity({
          activity_type: ACTIVITY_TYPES.EXPORT,
          activity_description: `导出了${period}时间段的数据`,
          module_name: MODULE_NAMES.DATA_EXPORT
        });

        // 保存数据以供模态框显示
        setExportedData(formattedData);
      } catch (clipboardError) {
        console.error('复制到剪贴板失败:', clipboardError);
        toast({
          title: "复制失败",
          description: "请手动复制数据",
          variant: "destructive",
        });
        // 显示数据模态框供用户手动复制
        setExportedData(formattedData);
        setShowDataModal(true);
      }
      
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
      
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      const records = await getRecordsByDateRange(startDateObj, endDateObj);
      console.log('获取到的记录:', records);

      let formattedData = '';
      if (format === 'text') {
        formattedData = generateTextFormat(records);
      }

      if (!formattedData || formattedData.trim() === '') {
        toast({
          title: "没有找到数据",
          description: "选择的时间范围内没有记录",
          variant: "destructive",
        });
        return;
      }

      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(formattedData);
        setCopiedFormat(`custom-${format}`);
        setTimeout(() => setCopiedFormat(null), 3000);
        
        toast({
          title: "导出成功",
          description: "数据已复制到剪贴板",
        });

        // 通知管理员用户进行了自定义数据导出
        await notifyAdminActivity({
          activity_type: ACTIVITY_TYPES.EXPORT,
          activity_description: `导出了自定义时间段(${startDate}到${endDate})的数据`,
          module_name: MODULE_NAMES.DATA_EXPORT
        });

        // 保存数据以供模态框显示
        setExportedData(formattedData);
      } catch (clipboardError) {
        console.error('复制到剪贴板失败:', clipboardError);
        toast({
          title: "复制失败",
          description: "请手动复制数据",
          variant: "destructive",
        });
        // 显示数据模态框供用户手动复制
        setExportedData(formattedData);
        setShowDataModal(true);
      }
      
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
