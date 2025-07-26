
import React from 'react';
import { ArrowLeft, Calendar, Zap, Bug, Sparkles, Home, Navigation, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpdateLogProps {
  onBack: () => void;
}

const UpdateLog = ({ onBack }: UpdateLogProps) => {
  const updates = [
    {
      version: '2.2.0',
      date: '2025-01-26',
      type: '功能优化',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🔧 修复症状记录页面导航问题',
          description: '修复眩晕症状、血糖情况、饮食作息、用药情况记录页面无法正常访问的问题',
          type: 'fix'
        },
        {
          title: '📅 优化家庭日历模块',
          description: '移除旧版家庭日历，统一使用增强版日历，扩大年限范围，减少加载错误',
          type: 'improvement'
        },
        {
          title: '🔧 完善更新日志',
          description: '修正更新日志中的日期和版本顺序，确保与实际开发进度一致',
          type: 'fix'
        }
      ]
    },
    {
      version: '2.1.0',
      date: '2025-01-26',
      type: '功能优化',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🔧 修复家庭管理模块导航问题',
          description: '修复从家庭管理子模块返回时直接跳转到首页的问题，现在正确返回到家庭管理中心',
          type: 'fix'
        },
        {
          title: '🔧 修复页面跳转白屏问题',
          description: '修复"每日数据中心"和"整理记录给医生/AI"按钮导致的页面崩溃问题',
          type: 'fix'
        },
        {
          title: '🔧 完善路由配置',
          description: '补充缺失的页面路由配置，确保所有导航功能正常工作',
          type: 'fix'
        }
      ]
    },
    {
      version: '2.0.0',
      date: '2025-01-26',
      type: '重大更新',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '✨ 增强版家庭日历',
          description: '全新的42格网格日历布局，支持农历显示、传统节日提醒和家庭成员生日管理',
          type: 'feature'
        },
        {
          title: '👥 完整家庭成员管理',
          description: '支持添加、编辑、删除家庭成员，自定义头像上传，生日提醒功能',
          type: 'feature'
        },
        {
          title: '🎨 优化用户界面',
          description: '全面改进卡片布局、响应式设计和交互体验',
          type: 'improvement'
        }
      ]
    },
    {
      version: '1.9.0',
      date: '2025-01-25',
      type: '功能增强',
      icon: Home,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      items: [
        {
          title: '🏠 家庭管理中心',
          description: '新增家庭管理功能模块，包括日历、账本、提醒、成员管理等',
          type: 'feature'
        },
        {
          title: '💰 家庭账本',
          description: '支持记录和统计家庭收支情况',
          type: 'feature'
        },
        {
          title: '⏰ 家庭提醒',
          description: '设置重要事项提醒功能',
          type: 'feature'
        }
      ]
    },
    {
      version: '1.8.0',
      date: '2025-01-24',
      type: '功能扩展',
      icon: Zap,
      color: 'bg-green-50 text-green-600 border-green-200',
      items: [
        {
          title: '💱 实时汇率查询',
          description: '新增澳币汇率实时查询功能，支持多种货币对比',
          type: 'feature'
        },
        {
          title: '📚 每日英语学习',
          description: '包含每日名言、单词学习和听力练习的英语学习模块',
          type: 'feature'
        },
        {
          title: '🎮 解压小游戏优化',
          description: '优化游戏性能，增加更多游戏选项',
          type: 'improvement'
        }
      ]
    },
    {
      version: '1.7.0',
      date: '2025-01-23',
      type: '用户体验',
      icon: Calendar,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      items: [
        {
          title: '📅 日历视图增强',
          description: '改进月度数据显示，增加打卡和症状记录的可视化',
          type: 'improvement'
        },
        {
          title: '🔍 数据导出功能',
          description: '支持将健康数据导出为多种格式，便于医生诊断',
          type: 'feature'
        },
        {
          title: '⚡ 性能优化',
          description: '优化应用加载速度和响应性能',
          type: 'improvement'
        }
      ]
    },
    {
      version: '1.6.0',
      date: '2025-01-22',
      type: '健康管理',
      icon: Calendar,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
      items: [
        {
          title: '🩺 症状记录优化',
          description: '改进眩晕、生活方式和用药记录的用户界面',
          type: 'improvement'
        },
        {
          title: '📊 数据统计增强',
          description: '新增更详细的健康数据分析和趋势图表',
          type: 'feature'
        },
        {
          title: '🔔 提醒系统',
          description: '智能提醒用户按时记录健康状况',
          type: 'feature'
        }
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'improvement':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fix':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            📝 更新日志
          </h1>
          <div className="w-16" />
        </div>

        {/* 更新列表 */}
        <div className="space-y-6">
          {updates.map((update, index) => {
            const IconComponent = update.icon;
            return (
              <Card key={update.version} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${update.color} border`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">版本 {update.version}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {update.date}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className={update.color}>
                      {update.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {update.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(item.type)}`}
                          >
                            {getTypeText(item.type)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border">
            <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">
              持续优化中，感谢您的使用和反馈！
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLog;
