
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Thermometer, Droplets, Pill, RefreshCw, Search, Filter, Clock } from 'lucide-react';
import { getRecentRecords, getRecordsForPeriod } from '@/services/meniereRecordService';
import type { Tables } from '@/integrations/supabase/types';
import RecordDelete from '@/components/RecordDelete';

type MeniereRecord = Tables<'meniere_records'>;

interface HistoryViewProps {
  onRecordClick: (record: MeniereRecord) => void;
  showEnhancedFeatures?: boolean;
}

const HistoryView = ({ onRecordClick, showEnhancedFeatures = false }: HistoryViewProps) => {
  const [records, setRecords] = useState<MeniereRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MeniereRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7');

  useEffect(() => {
    loadHistory();
  }, [dateFilter]);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, typeFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      let recordsData;
      
      if (showEnhancedFeatures && dateFilter !== 'recent') {
        const days = parseInt(dateFilter);
        recordsData = await getRecordsForPeriod(days);
      } else {
        recordsData = await getRecentRecords(showEnhancedFeatures ? 20 : 5);
      }
      
      setRecords(recordsData || []);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    // 类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === typeFilter);
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.note?.toLowerCase().includes(query) ||
        record.symptoms?.some(symptom => symptom.toLowerCase().includes(query)) ||
        record.medications?.some(med => med.toLowerCase().includes(query)) ||
        record.diet?.some(food => food.toLowerCase().includes(query))
      );
    }

    setFilteredRecords(filtered);
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'dizziness': return <Thermometer className="h-4 w-4 text-red-500" />;
      case 'lifestyle': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'medication': return <Pill className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecordTitle = (record: MeniereRecord) => {
    switch (record.type) {
      case 'dizziness': return '眩晕记录';
      case 'lifestyle': return '生活方式记录';
      case 'medication': return '用药记录';
      default: return '其他记录';
    }
  };

  const getRecordSubtitle = (record: MeniereRecord) => {
    const date = new Date(record.timestamp).toLocaleDateString('zh-CN');
    const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    let subtitle = `${date} ${time}`;
    
    if (record.type === 'dizziness' && record.severity) {
      const severityMap = { mild: '轻微', moderate: '中等', severe: '严重' };
      subtitle += ` • ${severityMap[record.severity as keyof typeof severityMap] || record.severity}`;
    }
    
    return subtitle;
  };

  const handleRecordDeleted = () => {
    loadHistory();
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">加载历史记录中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>最近记录</span>
          <Button
            onClick={loadHistory}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        
        {showEnhancedFeatures && (
          <div className="space-y-4 mt-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索记录内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 筛选器 */}
            <div className="flex space-x-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="dizziness">眩晕记录</SelectItem>
                  <SelectItem value="lifestyle">生活记录</SelectItem>
                  <SelectItem value="medication">用药记录</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">最近5条</SelectItem>
                  <SelectItem value="3">近3天</SelectItem>
                  <SelectItem value="7">近7天</SelectItem>
                  <SelectItem value="30">近30天</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 统计信息 */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>共 {filteredRecords.length} 条记录</span>
              {searchQuery && (
                <span>搜索到 {filteredRecords.length} 条结果</span>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {filteredRecords.map((record) => (
          <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
            <div 
              className="flex items-center space-x-3 flex-1 cursor-pointer"
              onClick={() => onRecordClick(record)}
            >
              {getRecordIcon(record.type)}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{getRecordTitle(record)}</div>
                <div className="text-sm text-gray-500 truncate">
                  {getRecordSubtitle(record)}
                </div>
                {record.note && (
                  <div className="text-xs text-gray-400 truncate mt-1">
                    {record.note}
                  </div>
                )}
              </div>
            </div>
            <RecordDelete
              recordId={record.id}
              recordType="meniere_records"
              onDeleted={handleRecordDeleted}
            />
          </div>
        ))}

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? '没有找到匹配的记录' : '还没有记录，开始记录您的症状吧'}
          </div>
        )}
      </CardContent>
    </Card>
  );

  function getRecordIcon(type: string) {
    switch (type) {
      case 'dizziness': return <Thermometer className="h-4 w-4 text-red-500" />;
      case 'lifestyle': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'medication': return <Pill className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  }

  function getRecordTitle(record: MeniereRecord) {
    switch (record.type) {
      case 'dizziness': return '眩晕记录';
      case 'lifestyle': return '生活方式记录';
      case 'medication': return '用药记录';
      default: return '其他记录';
    }
  }

  function getRecordSubtitle(record: MeniereRecord) {
    const date = new Date(record.timestamp).toLocaleDateString('zh-CN');
    const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    let subtitle = `${date} ${time}`;
    
    if (record.type === 'dizziness' && record.severity) {
      const severityMap = { mild: '轻微', moderate: '中等', severe: '严重' };
      subtitle += ` • ${severityMap[record.severity as keyof typeof severityMap] || record.severity}`;
    }
    
    return subtitle;
  }

  function handleRecordDeleted() {
    loadHistory();
  }
};

export default HistoryView;
