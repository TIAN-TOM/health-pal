import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle2, Star, Zap, Database, Shield, Mic, Globe } from 'lucide-react';

interface UpdateLogProps {
  onBack: () => void;
}

const UpdateLog = ({ onBack }: UpdateLogProps) => {
  const updates = [
    {
      version: "v2.4.0",
      date: "2025-07-02",
      type: "major",
      title: "语音记录与英语学习功能重大升级",
      changes: [
        {
          category: "语音记录功能",
          icon: <Mic className="h-4 w-4" />,
          items: [
            "✨ 语音记录现已完全连接到数据库，支持云端存储",
            "🔒 实现了严格的隐私保护：只有用户本人可以收听自己的录音",
            "👨‍💼 管理员只能查看语音记录的元数据，无法访问音频内容",
            "⏰ 语音记录自动保存30天，到期自动清理",
            "🎵 默认使用最高质量录音设置，移除质量选择选项",
            "📝 支持为语音记录添加备注和标题",
            "📊 新增语音记录历史查看功能",
            "💾 优化音频文件存储策略，使用Supabase Storage"
          ]
        },
        {
          category: "每日英语学习",
          icon: <Globe className="h-4 w-4" />,
          items: [
            "📚 管理员现可直接添加、编辑、删除英语学习内容",
            "🔧 新增完整的英语内容管理界面",
            "📖 支持管理英语名言、单词、短语、听力四个模块",
            "🎯 优化内容展示逻辑，确保每日内容稳定随机",
            "🌟 增强内容分类和难度级别管理",
            "🔄 实时内容更新，管理员修改后立即生效"
          ]
        },
        {
          category: "数据库与安全",
          icon: <Database className="h-4 w-4" />,
          items: [
            "🛡️ 完善的行级安全策略(RLS)确保数据隐私",
            "🔐 语音文件访问权限严格控制",
            "⚡ 优化数据库查询性能",
            "🗄️ 自动清理过期数据功能",
            "🔄 完善的错误处理和重试机制"
          ]
        },
        {
          category: "管理员功能",
          icon: <Shield className="h-4 w-4" />,
          items: [
            "👨‍💼 新增英语内容管理模块到管理员面板",
            "📊 管理员可查看所有用户的语音记录统计",
            "🔍 增强用户数据管理功能",
            "⚙️ 优化管理界面用户体验"
          ]
        }
      ]
    },
    {
      version: "v2.3.1",
      date: "2025-07-01", 
      type: "minor",
      title: "积分商城商品更新",
      changes: [
        {
          category: "积分商城",
          icon: <Star className="h-4 w-4" />,
          items: [
            "🛍️ 更新积分商城商品类型约束",
            "🎮 新增五子棋经典皮肤",
            "🎫 补签卡功能优化",
            "🏆 新增打卡达人徽章",
            "🧘 呼吸练习增强版解锁",
            "📚 英语学习进阶功能"
          ]
        }
      ]
    },
    {
      version: "v2.3.0",
      date: "2025-06-25",
      type: "major",
      title: "健康数据可视化与分析",
      changes: [
        {
          category: "数据分析",
          icon: <Zap className="h-4 w-4" />,
          items: [
            "📈 新增健康数据统计图表",
            "📊 支持多维度数据分析",
            "🔍 优化数据筛选和排序",
            "🧮 改进算法，提高分析准确性"
          ]
        }
      ]
    },
    {
      version: "v2.2.0",
      date: "2025-06-15",
      type: "minor",
      title: "紧急联系人与短信通知",
      changes: [
        {
          category: "紧急求助",
          icon: <Shield className="h-4 w-4" />,
          items: [
            "🆘 新增紧急联系人设置",
            "✉️ 支持一键发送求助短信",
            "📍 自动附加地理位置信息",
            "📞 紧急呼叫功能优化"
          ]
        }
      ]
    },
    {
      version: "v2.1.0",
      date: "2025-06-05",
      type: "minor",
      title: "每日健康打卡",
      changes: [
        {
          category: "日常记录",
          icon: <Calendar className="h-4 w-4" />,
          items: [
            "📅 每日健康打卡功能上线",
            "✍️ 支持记录心情、睡眠、饮食等",
            "📸 允许上传照片记录",
            "🔔 每日提醒功能"
          ]
        }
      ]
    },
    {
      version: "v2.0.0",
      date: "2025-05-20",
      type: "major",
      title: "全新UI与用户体验升级",
      changes: [
        {
          category: "界面设计",
          icon: <Star className="h-4 w-4" />,
          items: [
            "✨ 全新UI设计，更美观易用",
            "🎨 优化色彩搭配和排版",
            "📱 适配各种屏幕尺寸",
            "🌙 新增夜间模式"
          ]
        }
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'major': return '重大更新';
      case 'minor': return '功能更新';
      case 'patch': return '问题修复';
      default: return '更新';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-gray-800 flex items-center justify-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              更新日志
            </CardTitle>
            <p className="text-gray-600 mt-2">
              健康生活伴侣应用的功能更新记录
            </p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {updates.map((update, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={`${getTypeColor(update.type)} font-medium`}
                    >
                      {getTypeLabel(update.type)}
                    </Badge>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {update.version}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{update.date}</span>
                  </div>
                </div>
                <h4 className="text-lg text-gray-700 mt-2">{update.title}</h4>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-6">
                  {update.changes.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-600">{category.icon}</span>
                        <h5 className="font-semibold text-gray-800">
                          {category.category}
                        </h5>
                      </div>
                      <div className="grid gap-2 ml-6">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <div className="text-gray-600">
              <p className="mb-2">
                💡 如果您有任何建议或发现问题，请联系开发者
              </p>
              <p className="text-sm">
                我们持续改进应用，为您提供更好的健康管理体验
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateLog;
