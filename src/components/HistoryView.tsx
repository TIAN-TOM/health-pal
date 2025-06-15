
import React, { useState, useEffect } from 'react';
import { Clock, Activity, Home, Pill, Mic } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getRecentRecords } from '@/services/meniereRecordService';
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

const HistoryView = () => {
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    if (diffInHours < 48) return '昨天';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
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
          <Card key={record.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between min-h-[48px]">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getRecordIcon(record.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 leading-relaxed">
                      {getRecordTitle(record)}
                    </div>
                    <div className="text-sm text-gray-500 leading-relaxed">
                      {formatTime(record.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
