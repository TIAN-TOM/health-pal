
import React from 'react';
import { ArrowLeft, Clock, Activity, Home, Pill, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type MeniereRecord = Tables<'meniere_records'>;

interface RecordDetailProps {
  record: MeniereRecord;
  onBack: () => void;
}

const RecordDetail = ({ record, onBack }: RecordDetailProps) => {
  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'dizziness': return <Activity className="h-5 w-5 text-blue-600" />;
      case 'lifestyle': return <Home className="h-5 w-5 text-green-600" />;
      case 'medication': return <Pill className="h-5 w-5 text-purple-600" />;
      case 'voice': return <Mic className="h-5 w-5 text-orange-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'dizziness': return '眩晕记录';
      case 'lifestyle': return '生活记录';
      case 'medication': return '用药记录';
      case 'voice': return '语音记录';
      default: return '记录';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getSeverityText = (severity?: string) => {
    switch (severity) {
      case 'mild': return '轻微';
      case 'moderate': return '中等';
      case 'severe': return '严重';
      default: return severity;
    }
  };

  const getSleepText = (sleep?: string) => {
    switch (sleep) {
      case 'good': return '良好';
      case 'average': return '一般';
      case 'poor': return '不佳';
      default: return sleep;
    }
  };

  const getStressText = (stress?: string) => {
    switch (stress) {
      case 'low': return '轻微';
      case 'medium': return '中等';
      case 'high': return '严重';
      default: return stress;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">记录详情</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getRecordIcon(record.type)}
              <span className="ml-2">{getTypeTitle(record.type)}</span>
            </CardTitle>
            <p className="text-sm text-gray-500">
              {formatDateTime(record.timestamp)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.type === 'dizziness' && (
              <>
                {record.severity && (
                  <div>
                    <h4 className="font-medium text-gray-700">严重程度</h4>
                    <p className="text-gray-600">{getSeverityText(record.severity)}</p>
                  </div>
                )}
                {record.duration && (
                  <div>
                    <h4 className="font-medium text-gray-700">持续时间</h4>
                    <p className="text-gray-600">{record.duration}</p>
                  </div>
                )}
                {record.symptoms && record.symptoms.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700">症状</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.symptoms.map((symptom, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {record.type === 'lifestyle' && (
              <>
                {record.diet && record.diet.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700">饮食</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.diet.map((item, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {record.sleep && (
                  <div>
                    <h4 className="font-medium text-gray-700">睡眠质量</h4>
                    <p className="text-gray-600">{getSleepText(record.sleep)}</p>
                  </div>
                )}
                {record.stress && (
                  <div>
                    <h4 className="font-medium text-gray-700">压力水平</h4>
                    <p className="text-gray-600">{getStressText(record.stress)}</p>
                  </div>
                )}
              </>
            )}

            {record.type === 'medication' && (
              <>
                {record.medications && record.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700">药物</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.medications.map((med, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {record.dosage && (
                  <div>
                    <h4 className="font-medium text-gray-700">剂量</h4>
                    <p className="text-gray-600">{record.dosage}</p>
                  </div>
                )}
              </>
            )}

            {record.note && (
              <div>
                <h4 className="font-medium text-gray-700">备注</h4>
                <p className="text-gray-600">{record.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordDetail;
