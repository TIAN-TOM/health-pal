
import React, { useState, useEffect } from 'react';
import { Clock, Activity, Home, Pill, Mic, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getRecentRecords } from '@/services/meniereRecordService';
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

interface HistoryViewProps {
  onRecordClick?: (record: MeniereRecord) => void;
}

const HistoryView = ({ onRecordClick }: HistoryViewProps) => {
  const [records, setRecords] = useState<MeniereRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await getRecentRecords(5);
      setRecords(data || []);
    } catch (error) {
      console.error('加载记录失败:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'dizziness': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'lifestyle': return <Home className="h-4 w-4 text-green-600" />;
      case 'medication': return <Pill className="h-4 w-4 text-purple-600" />;
      case 'voice': return <Mic className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRecordTitle = (record: MeniereRecord) => {
    switch (record.type) {
      case 'dizziness': 
        return `眩晕发作 - ${record.severity === 'mild' ? '轻微' : record.severity === 'moderate' ? '中等' : '严重'}`;
      case 'lifestyle': 
        return `生活记录 - 睡眠${record.sleep === 'good' ? '良好' : record.sleep === 'average' ? '一般' : '不佳'}`;
      case 'medication': 
        return `用药记录 - ${record.medications?.[0] || '药物'}`;
      case 'voice': 
        return record.note || '语音记录';
      default: 
        return '记录';
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRecordClick = (record: MeniereRecord) => {
    if (onRecordClick) {
      onRecordClick(record);
    } else {
      // 默认行为：显示记录详情
      alert(`记录详情：\n类型：${record.type}\n时间：${formatDateTime(record.timestamp)}\n备注：${record.note || '无'}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-500 leading-relaxed">加载记录中...</p>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 leading-relaxed">还没有记录</p>
          <p className="text-sm text-gray-400 leading-relaxed mt-2">开始记录您的症状和生活状况吧</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4 leading-relaxed">最近记录</h3>
      <div className="space-y-3">
        {records.map((record: MeniereRecord) => (
          <Card 
            key={record.id} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-blue-50"
            onClick={() => handleRecordClick(record)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between min-h-[48px]">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    {getRecordIcon(record.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 leading-relaxed">
                      {getRecordTitle(record)}
                    </div>
                    <div className="text-sm text-gray-500 leading-relaxed">
                      {formatDateTime(record.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0"></div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
