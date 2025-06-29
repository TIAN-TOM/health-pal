
import React, { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle, Star, Zap, Bug, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UpdateLogProps {
  onBack: () => void;
}

interface UpdateItem {
  type: 'feature' | 'improvement' | 'bugfix';
  title: string;
  description: string;
}

interface UpdateEntry {
  version: string;
  date: string;
  updates: UpdateItem[];
  highlight?: boolean;
}

const UpdateLog = ({ onBack }: UpdateLogProps) => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const updateHistory: UpdateEntry[] = [
    {
      version: "v2.5.0",
      date: "2025-06-29",
      highlight: true,
      updates: [
        {
          type: "feature",
          title: "深色模式功能",
          description: "完善深色模式切换功能，支持系统级主题切换和本地存储偏好设置"
        },
        {
          type: "improvement",
          title: "记忆翻牌游戏移动端优化",
          description: "大幅优化手机端显示效果，增大卡片尺寸，加强背景色对比度，改善老年用户体验"
        },
        {
          type: "improvement",
          title: "五子棋视觉效果优化",
          description: "改进移动端五子棋落子显示，采用红色边框标记玩家棋子，提升可视性"
        },
        {
          type: "improvement",
          title: "设置页面功能完善",
          description: "恢复账号管理功能，包括退出登录和注销账号选项，完善系统设置存储机制"
        },
        {
          type: "bugfix",
          title: "系统设置持久化",
          description: "修复通知设置、音效设置等系统偏好无法正确保存的问题"
        }
      ]
    },
    {
      version: "v2.4.0",
      date: "2025-06-29",
      updates: [
        {
          type: "feature",
          title: "更新日志功能",
          description: "新增应用内更新日志查看功能，用户可以随时了解最新功能更新"
        },
        {
          type: "improvement",
          title: "记忆翻牌游戏优化",
          description: "增大卡片尺寸，优化表情符号选择，添加背景色区分，提升老年用户体验"
        },
        {
          type: "improvement",
          title: "用户界面优化",
          description: "提升整体界面对比度和可读性，优化按钮大小和间距"
        }
      ]
    },
    {
      version: "v2.3.0",
      date: "2025-06-28",
      updates: [
        {
          type: "feature",
          title: "增强登录注册体验",
          description: "优化用户登录和注册流程，提供更流畅的身份验证体验"
        },
        {
          type: "feature",
          title: "游戏功能扩展",
          description: "新增多款解压小游戏，包括五子棋、打砖块等经典游戏"
        },
        {
          type: "feature",
          title: "地图集成",
          description: "集成地图功能，为紧急联系和位置服务提供支持"
        }
      ]
    },
    {
      version: "v2.2.0",
      date: "2025-06-27",
      updates: [
        {
          type: "feature",
          title: "紧急模式功能",
          description: "新增紧急模式，快速访问紧急联系人和医疗信息"
        },
        {
          type: "feature",
          title: "用药管理系统",
          description: "完善用药管理功能，支持用药提醒和记录追踪"
        },
        {
          type: "improvement",
          title: "数据导出优化",
          description: "改进健康数据导出功能，支持多种格式导出"
        }
      ]
    },
    {
      version: "v2.1.0",
      date: "2025-06-26",
      updates: [
        {
          type: "feature",
          title: "呼吸练习功能",
          description: "新增引导式呼吸练习，帮助用户放松和缓解压力"
        },
        {
          type: "feature",
          title: "教育中心",
          description: "添加健康教育资源中心，提供专业的健康知识"
        },
        {
          type: "bugfix",
          title: "数据同步修复",
          description: "修复部分情况下健康记录同步不及时的问题"
        }
      ]
    },
    {
      version: "v2.0.0",
      date: "2025-06-25",
      updates: [
        {
          type: "feature",
          title: "全新设计界面",
          description: "采用全新的现代化设计语言，提升用户体验"
        },
        {
          type: "feature",
          title: "智能健康分析",
          description: "基于用户数据提供个性化的健康分析和建议"
        },
        {
          type: "feature",
          title: "多设备同步",
          description: "支持多设备间健康数据实时同步"
        }
      ]
    }
  ];

  const getTypeIcon = (type: UpdateItem['type']) => {
    switch (type) {
      case 'feature':
        return <Star className="h-4 w-4" />;
      case 'improvement':
        return <Zap className="h-4 w-4" />;
      case 'bugfix':
        return <Bug className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: UpdateItem['type']) => {
    const config = {
      feature: { label: '新功能', className: 'bg-green-100 text-green-800' },
      improvement: { label: '优化', className: 'bg-blue-100 text-blue-800' },
      bugfix: { label: '修复', className: 'bg-orange-100 text-orange-800' }
    };
    return config[type] || { label: '更新', className: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">更新日志</h1>
          <div className="w-16" /> {/* 占位符保持居中 */}
        </div>

        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">版本更新记录</h2>
          </div>
          <p className="text-gray-600 text-sm">了解健康生活伴侣的最新功能和改进</p>
        </div>

        <div className="space-y-4">
          {updateHistory.map((entry, entryIndex) => (
            <Card 
              key={entry.version} 
              className={`hover:shadow-lg transition-shadow duration-200 ${
                entry.highlight ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    {entry.version}
                    {entry.highlight && (
                      <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">
                        最新
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {entry.date}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entry.updates.map((update, updateIndex) => {
                    const badge = getTypeBadge(update.type);
                    return (
                      <div key={updateIndex} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(update.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="secondary" className={badge.className}>
                              {badge.label}
                            </Badge>
                            <h4 className="font-medium text-gray-900">{update.title}</h4>
                          </div>
                          <p className="text-gray-600 text-sm">{update.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {entryIndex < updateHistory.length - 1 && <Separator className="mt-4" />}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-start">
            <Star className="h-5 w-5 text-blue-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">持续改进</h3>
              <p className="text-blue-700 text-sm">
                我们致力于不断改进产品体验，您的反馈对我们非常重要。如有建议或问题，请通过设置页面联系我们。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLog;
