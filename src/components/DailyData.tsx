
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Smile, Activity, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecordsForPeriod } from '@/services/meniereRecordService';
import { getCheckinHistory } from '@/services/dailyCheckinService';
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

interface DailyDataProps {
  onBack: () => void;
}

const DailyData = ({ onBack }: DailyDataProps) => {
  const [records, setRecords] = useState<MeniereRecord[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recordsData, checkinsData] = await Promise.all([
        getRecordsForPeriod(30),
        getCheckinHistory(30)
      ]);
      setRecords(recordsData || []);
      setCheckins(checkinsData || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRecords = (date: string) => {
    const dateStr = date.split('T')[0];
    return records.filter(record => 
      record.timestamp.split('T')[0] === dateStr
    );
  };

  const getDateCheckin = (date: string) => {
    return checkins.find(checkin => checkin.checkin_date === date);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getRecordTypeCount = (date: string, type: string) => {
    return getDateRecords(date).filter(record => record.type === type).length;
  };

  const getAverageMoodScore = () => {
    const validCheckins = checkins.filter(c => c.mood_score);
    if (validCheckins.length === 0) return 0;
    const sum = validCheckins.reduce((acc, c) => acc + c.mood_score, 0);
    return (sum / validCheckins.length).toFixed(1);
  };

  const getTotalRecordsCount = () => {
    return records.length;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">每日数据</h1>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-500">加载数据中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">每日数据</h1>
        </div>

        {/* 总体统计卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              30天统计概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {getTotalRecordsCount()}
                </div>
                <div className="text-xs text-gray-600">总记录数</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {getAverageMoodScore()}
                </div>
                <div className="text-xs text-gray-600">平均心情</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {checkins.length}
                </div>
                <div className="text-xs text-gray-600">打卡天数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              最近7天概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getLast7Days().map(date => {
                const dayRecords = getDateRecords(date);
                const dayCheckin = getDateCheckin(date);
                return (
                  <div 
                    key={date}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-blue-50 ${
                      selectedDate === date ? 'bg-blue-100 border-blue-300' : 'bg-white'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{formatDate(date)}</div>
                        <div className="text-sm text-gray-500">
                          {dayRecords.length} 条记录
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {dayCheckin && (
                          <div className="flex items-center text-green-600">
                            <Smile className="h-4 w-4 mr-1" />
                            <span className="text-sm">{dayCheckin.mood_score}/5</span>
                          </div>
                        )}
                        {dayRecords.length > 0 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {formatDate(selectedDate)} 详情
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dayRecords = getDateRecords(selectedDate);
              const dayCheckin = getDateCheckin(selectedDate);
              
              if (dayRecords.length === 0 && !dayCheckin) {
                return (
                  <div className="text-center py-6">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">这一天没有记录</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {dayCheckin && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Smile className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium">每日打卡</span>
                        </div>
                        <div className="text-green-600 font-medium">
                          心情: {dayCheckin.mood_score}/5
                        </div>
                      </div>
                      {dayCheckin.note && (
                        <p className="text-sm text-gray-600 mt-2">{dayCheckin.note}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {getRecordTypeCount(selectedDate, 'dizziness')}
                      </div>
                      <div className="text-sm text-gray-600">眩晕记录</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {getRecordTypeCount(selectedDate, 'lifestyle')}
                      </div>
                      <div className="text-sm text-gray-600">生活记录</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {getRecordTypeCount(selectedDate, 'medication')}
                      </div>
                      <div className="text-sm text-gray-600">用药记录</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {dayRecords.length}
                      </div>
                      <div className="text-sm text-gray-600">总记录数</div>
                    </div>
                  </div>

                  {dayRecords.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">详细记录</h4>
                      <div className="space-y-2">
                        {dayRecords.map(record => (
                          <div key={record.id} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">
                                {record.type === 'dizziness' && '眩晕记录'}
                                {record.type === 'lifestyle' && '生活记录'}
                                {record.type === 'medication' && '用药记录'}
                              </div>
                              <div className="text-gray-600 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(record.timestamp).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            © 2024 梅尼埃症生活伴侣 - 专注于梅尼埃症患者的健康管理
            <br />
            本应用仅供参考，不能替代专业医疗建议
            <br />
            如有严重症状请及时就医
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyData;
