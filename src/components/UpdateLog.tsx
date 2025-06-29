
import React from 'react';
import { ArrowLeft, Calendar, Star, Bug, Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UpdateLogProps {
  onBack: () => void;
}

const UpdateLog = ({ onBack }: UpdateLogProps) => {
  const updates = [
    {
      date: '2025-06-29',
      version: 'v1.2.0',
      items: [
        {
          type: 'feature',
          title: '新增更新日志功能',
          description: '用户现在可以查看每日功能更新和改进记录'
        },
        {
          type: 'improvement',
          title: '优化记忆翻牌游戏',
          description: '增大卡片尺寸，使用不同背景色帮助老花眼用户更好识别'
        },
        {
          type: 'improvement',
          title: '完善深色模式',
          description: '添加深色模式切换功能，并支持记忆用户选择'
        },
        {
          type: 'fix',
          title: '修复五子棋显示问题',
          description: '最后落子现在显示为红色边框，提升视觉效果'
        }
      ]
    },
    {
      date: '2025-06-28',
      version: 'v1.1.5',
      items: [
        {
          type: 'feature',
          title: '新增呼吸练习功能',
          description: '添加引导式呼吸练习，帮助用户放松身心'
        },
        {
          type: 'improvement',
          title: '优化数据导出',
          description: '改进数据导出格式，更便于医生查看'
        },
        {
          type: 'fix',
          title: '修复日历显示',
          description: '解决某些日期显示异常的问题'
        }
      ]
    },
    {
      date: '2025-06-27',
      version: 'v1.1.4',
      items: [
        {
          type: 'feature',
          title: '新增游戏中心',
          description: '添加记忆翻牌、五子棋等益智游戏'
        },
        {
          type: 'improvement',
          title: '优化用户界面',
          description: '改进整体视觉设计和交互体验'
        },
        {
          type: 'improvement',
          title: '完善记录功能',
          description: '增强眩晕、糖尿病等记录的详细程度'
        }
      ]
    },
    {
      date: '2025-06-26',
      version: 'v1.1.3',
      items: [
        {
          type: 'feature',
          title: '新增紧急模式',
          description: '一键进入紧急状态，快速联系紧急联系人'
        },
        {
          type: 'improvement',
          title: '优化数据统计',
          description: '改进每日数据中心的图表显示'
        },
        {
          type: 'fix',
          title: '修复语音记录',
          description: '解决部分设备语音记录失败的问题'
        }
      ]
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'improvement':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'fix':
        return <Bug className="h-4 w-4 text-orange-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'feature':
        return '新功能';
      case 'improvement':
        return '优化';
      case 'fix':
        return '修复';
      default:
        return '更新';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-green-100 text-green-800';
      case 'improvement':
        return 'bg-blue-100 text-blue-800';
      case 'fix':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">更新日志</h1>
        </div>

        <div className="space-y-6">
          {updates.map((update, updateIndex) => (
            <Card key={updateIndex} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{update.date}</span>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {update.version}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {update.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getTypeBgColor(item.type)}`}>
                            {getTypeText(item.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">更新说明</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div className="flex items-center">
              <Plus className="h-3 w-3 mr-2 text-green-600" />
              <span>新功能 - 全新添加的功能特性</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-2 text-blue-600" />
              <span>优化 - 现有功能的改进和完善</span>
            </div>
            <div className="flex items-center">
              <Bug className="h-3 w-3 mr-2 text-orange-600" />
              <span>修复 - 问题和错误的解决</span>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-6 text-center text-xs text-gray-500">
          持续改进中，感谢您的使用和反馈
        </div>
      </div>
    </div>
  );
};

export default UpdateLog;
