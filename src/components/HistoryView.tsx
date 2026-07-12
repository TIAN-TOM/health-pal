
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Thermometer, Droplets, Pill, RefreshCw, Search, Filter, Clock, FileText } from 'lucide-react';
import { getRecentRecords, getRecordsForPeriod } from '@/services/meniereRecordService';
import type { Tables } from '@/integrations/supabase/types';
import RecordDelete from '@/components/RecordDelete';
import EmptyState from '@/components/common/EmptyState';

type MeniereRecord = Tables<'meniere_records'>;

interface HistoryViewProps {
  onRecordClick: (record: MeniereRecord) => void;
  showEnhancedFeatures?: boolean;
  onBack?: () => void;
}

// 每页显示的记录条数，避免"全部时间"一次渲染上百条
const PAGE_SIZE = 30;

const fetchRecordsForFilter = async (dateFilter: string): Promise<MeniereRecord[]> => {
  if (dateFilter === 'all') {
    return (await getRecordsForPeriod(365)) || [];
  }
  if (dateFilter === 'recent') {
    return (await getRecentRecords(5)) || [];
  }
  return (await getRecordsForPeriod(parseInt(dateFilter))) || [];
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
  // timestamp 存真 UTC，显示统一按北京时区
  const date = new Date(record.timestamp).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', {
    timeZone: 'Asia/Shanghai',
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

const HistoryView = ({ onRecordClick, showEnhancedFeatures = false, onBack }: HistoryViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('recent');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ['history-records', dateFilter],
    queryFn: () => fetchRecordsForFilter(dateFilter),
  });

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === typeFilter);
    }

    if (dateFilter === 'recent') {
      filtered = filtered.slice(0, 5);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.note?.toLowerCase().includes(query) ||
        record.symptoms?.some(symptom => symptom.toLowerCase().includes(query)) ||
        record.medications?.some(med => med.toLowerCase().includes(query)) ||
        record.diet?.some(food => food.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [records, searchQuery, typeFilter, dateFilter]);

  // 筛选条件变化时回到第一页
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, typeFilter, dateFilter]);

  const visibleRecords = useMemo(
    () =>
      filteredRecords.slice(0, visibleCount).map(record => ({
        record,
        title: getRecordTitle(record),
        subtitle: getRecordSubtitle(record),
      })),
    [filteredRecords, visibleCount]
  );

  const remainingCount = filteredRecords.length - visibleRecords.length;

  const handleRecordDeleted = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">加载历史记录中...</p>
        </CardContent>
      </Card>
    );
  }

  const recordList = (
    <>
      {visibleRecords.map(({ record, title, subtitle }) => (
        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
          <div
            className="flex items-center space-x-3 flex-1 cursor-pointer"
            onClick={() => onRecordClick(record)}
          >
            {getRecordIcon(record.type)}
            <div className="flex-1 min-w-0">
              <div className="font-medium">{title}</div>
              <div className="text-sm text-gray-600 truncate">
                {subtitle}
              </div>
              {record.note && (
                <div className="text-xs text-gray-500 truncate mt-1">
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

      {remainingCount > 0 && (
        <Button
          variant="outline"
          onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
          className="w-full min-h-[48px] text-base"
        >
          加载更多（还有 {remainingCount} 条）
        </Button>
      )}

      {filteredRecords.length === 0 && !isLoading && (
        <EmptyState
          icon={FileText}
          title={searchQuery ? '没有找到匹配的记录' : '还没有记录'}
          description={searchQuery ? '换个关键词或调整筛选条件试试' : '开始记录您的症状，让每一次变化都被看见'}
        />
      )}
    </>
  );

  // 如果是独立页面模式，渲染完整页面
  if (onBack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
            <h1 className="text-xl font-bold">最近记录</h1>
            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="space-y-4">
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
                      <SelectItem value="all">全部时间</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>共 {filteredRecords.length} 条记录</span>
                  {searchQuery && (
                    <span>搜索到 {filteredRecords.length} 条结果</span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {recordList}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 原有的卡片模式
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>最近记录</span>
          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>

        {showEnhancedFeatures && (
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索记录内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

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
                  <SelectItem value="all">全部时间</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>共 {filteredRecords.length} 条记录</span>
              {searchQuery && (
                <span>搜索到 {filteredRecords.length} 条结果</span>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {recordList}
      </CardContent>
    </Card>
  );
};

export default HistoryView;
