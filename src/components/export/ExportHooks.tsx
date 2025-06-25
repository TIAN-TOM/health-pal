
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getRecordsByDateRange, generateJSONFormat, generateTextFormat } from '@/services/dataExportService';
import { getBeijingTime, getBeijingDateString } from '@/utils/beijingTime';

export const useDataExport = () => {
  const [loading, setLoading] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'text' | null>(null);
  const [exportedData, setExportedData] = useState<string>('');
  const [showDataModal, setShowDataModal] = useState(false);
  const { toast } = useToast();

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
      
      const data = await getRecordsByDateRange(timeLimit, now);

      console.log('导出的记录数量:', {
        meniere: data.meniereRecords?.length || 0,
        checkins: data.dailyCheckins?.length || 0,
        diabetes: data.diabetesRecords?.length || 0,
        medical: data.medicalRecords?.length || 0
      });

      const totalRecords = (data.meniereRecords?.length || 0) + 
                          (data.dailyCheckins?.length || 0) + 
                          (data.diabetesRecords?.length || 0) + 
                          (data.medicalRecords?.length || 0);

      if (totalRecords === 0) {
        toast({
          title: '提示',
          description: '选定时间范围内没有记录数据',
        });
        return;
      }

      if (format === 'json') {
        const jsonData = generateJSONFormat(data);
        await copyToClipboard(jsonData, 'json');
      } else {
        const textData = generateTextFormat(data);
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

  const handleCustomExport = async (startDate: string, endDate: string, format: 'json' | 'text') => {
    if (!startDate || !endDate) {
      toast({
        title: '错误',
        description: '请选择开始和结束日期',
        variant: 'destructive'
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast({
        title: '错误',
        description: '开始日期不能晚于结束日期',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('自定义导出时间范围:', startDate, '-', endDate);
      
      const data = await getRecordsByDateRange(start, end);

      console.log('导出的记录数量:', {
        meniere: data.meniereRecords?.length || 0,
        checkins: data.dailyCheckins?.length || 0,
        diabetes: data.diabetesRecords?.length || 0,
        medical: data.medicalRecords?.length || 0
      });

      const totalRecords = (data.meniereRecords?.length || 0) + 
                          (data.dailyCheckins?.length || 0) + 
                          (data.diabetesRecords?.length || 0) + 
                          (data.medicalRecords?.length || 0);

      if (totalRecords === 0) {
        toast({
          title: '提示',
          description: '选定时间范围内没有记录数据',
        });
        return;
      }

      if (format === 'json') {
        const jsonData = generateJSONFormat(data);
        await copyToClipboard(jsonData, 'json');
      } else {
        const textData = generateTextFormat(data);
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
