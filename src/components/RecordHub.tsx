
import React, { useState } from 'react';
import { ArrowLeft, Activity, TrendingUp, Home, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecordHubProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const RecordHub = ({ onBack, onNavigate }: RecordHubProps) => {
  const recordTypes = [
    {
      id: 'dizziness',
      title: '记录眩晕症状',
      description: '记录眩晕、头晕等症状的详细信息',
      icon: Activity,
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'diabetes',
      title: '记录血糖情况',
      description: '记录血糖监测数据和相关信息',
      icon: TrendingUp,
      color: 'bg-teal-500 hover:bg-teal-600',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600'
    },
    {
      id: 'lifestyle',
      title: '记录饮食与作息',
      description: '记录日常饮食、睡眠和生活习惯',
      icon: Home,
      color: 'bg-green-500 hover:bg-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'medication',
      title: '记录用药情况',
      description: '记录药物服用情况和效果评价',
      icon: Pill,
      color: 'bg-orange-500 hover:bg-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">健康记录</h1>
          <div className="w-16"></div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">选择记录类型</h2>
          <p className="text-gray-600 text-sm">选择您要记录的健康信息类型</p>
        </div>

        <div className="space-y-4">
          {recordTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card key={type.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <Button
                    onClick={() => onNavigate(type.id)}
                    className={`w-full ${type.color} text-white text-lg font-medium py-8 rounded-lg min-h-[120px]`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 ${type.iconBg} rounded-full flex items-center justify-center mb-3`}>
                        <IconComponent className={`h-6 w-6 ${type.iconColor}`} />
                      </div>
                      <span className="leading-relaxed mb-1">{type.title}</span>
                      <span className="text-sm opacity-90 font-normal">{type.description}</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Activity className="h-5 w-5 text-blue-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">记录提示</h3>
              <p className="text-blue-700 text-sm">
                定期记录健康数据有助于发现规律和趋势。建议每天固定时间进行记录，保持数据的连续性和准确性。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordHub;
