
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Thermometer, Droplets, Pill, RefreshCw } from 'lucide-react';
import { getRecentRecords } from '@/services/meniereRecordService';
import { getRecentCheckins } from '@/services/dailyCheckinService';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';
import RecordDelete from '@/components/RecordDelete';

type MeniereRecord = Tables<'meniere_records'>;
type DailyCheckin = Tables<'daily_checkins'>;

interface HistoryViewProps {
  onRecordClick: (record: MeniereRecord) => void;
}

const HistoryView = ({ onRecordClick }: HistoryViewProps) => {
  const [records, setRecords] = useState<MeniereRecord[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [recordsData, checkinsData] = await Promise.all([
        getRecentRecords(5),
        getRecentCheckins(5)
      ]);
      setRecords(recordsData || []);
      setCheckins(checkinsData || []);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
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

  const getMoodEmoji = (score?: number) => {
    if (!score) return '😐';
    if (score >= 8) return '😄';
    if (score >= 6) return '😊';
    if (score >= 4) return '😐';
    return '😞';
  };

  const handleRecordDeleted = () => {
    loadHistory(); // 重新加载历史记录
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
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 最近打卡记录 */}
        {checkins.map((checkin) => (
          <div key={checkin.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium text-green-800">每日打卡</div>
                <div className="text-sm text-green-600">
                  {format(new Date(checkin.checkin_date), 'MM月dd日', { locale: zhCN })} 
                  {checkin.mood_score && (
                    <span className="ml-2">
                      心情: {getMoodEmoji(checkin.mood_score)} {checkin.mood_score}/10
                    </span>
                  )}
                </div>
              </div>
            </div>
            <RecordDelete
              recordId={checkin.id}
              recordType="daily_checkins"
              onDeleted={handleRecordDeleted}
            />
          </div>
        ))}

        {/* 症状记录 */}
        {records.map((record) => (
          <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div 
              className="flex items-center space-x-3 flex-1 cursor-pointer"
              onClick={() => onRecordClick(record)}
            >
              {getRecordIcon(record.type)}
              <div>
                <div className="font-medium">{getRecordTitle(record)}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(record.timestamp), 'MM月dd日 HH:mm', { locale: zhCN })}
                </div>
              </div>
            </div>
            <RecordDelete
              recordId={record.id}
              recordType="meniere_records"
              onDeleted={handleRecordDeleted}
            />
          </div>
        ))}

        {records.length === 0 && checkins.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            还没有记录，开始记录您的症状吧
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryView;
