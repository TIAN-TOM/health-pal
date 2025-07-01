
import React from 'react';
import { ArrowLeft, Calendar, Award, Globe, ShoppingCart, Database, Zap, Palette, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpdateLogProps {
  onBack: (targetPage?: string) => void;
}

const UpdateLog = ({ onBack }: UpdateLogProps) => {
  const updates = [
    {
      version: "v2.2.0",
      date: "2025-07-01",
      type: "major",
      title: "游戏体验优化与皮肤系统",
      changes: [
        {
          category: "游戏优化",
          icon: <Palette className="h-4 w-4" />,
          items: [
            "五子棋新增皮肤切换功能，支持经典木质皮肤",
            "记忆翻牌游戏优化计时逻辑，从翻开第一张牌开始计时",
            "移除体验较差的找不同游戏，专注核心游戏优化",
            "游戏皮肤系统与积分商城深度整合"
          ]
        },
        {
          category: "积分商城",
          icon: <ShoppingCart className="h-4 w-4" />,
          items: [
            "新增补签卡功能，可补签错过的打卡日期",
            "移除游戏道具类商品，简化商城结构",
            "优化商品分类与描述展示",
            "完善道具效果系统与用户反馈"
          ]
        },
        {
          category: "每日功能",
          icon: <RefreshCw className="h-4 w-4" />,
          items: [
            "每日打卡页面优化，移除不准确的连续天数显示",
            "每日英语内容确保每天更新不重复",
            "优化学习提示文案，提升用户体验",
            "增强北京时间零点自动更新机制"
          ]
        },
        {
          category: "系统改进",
          icon: <Database className="h-4 w-4" />,
          items: [
            "新增皮肤管理服务模块",
            "优化用户道具效果存储机制",
            "改进商品购买验证逻辑",
            "完善错误处理与用户提示"
          ]
        }
      ]
    },
    {
      version: "v2.1.0",
      date: "2025-06-30",
      type: "major",
      title: "英语学习系统与积分商城上线",
      changes: [
        {
          category: "新功能",
          icon: <Globe className="h-4 w-4" />,
          items: [
            "完善每日英语模块，支持数据库存储",
            "新增英语名言、单词、短语、听力四大板块",
            "支持难度分级（初级、中级、高级）",
            "增加语音朗读功能和音频控制",
            "丰富的英语学习内容示例数据"
          ]
        },
        {
          category: "积分系统",
          icon: <Award className="h-4 w-4" />,
          items: [
            "全新积分商城系统上线",
            "支持游戏皮肤、道具、徽章等多种商品类型",
            "完善的用户购买记录管理",
            "在每日打卡页面集成积分商城入口",
            "积分奖励规则优化与可视化展示"
          ]
        },
        {
          category: "数据库优化",
          icon: <Database className="h-4 w-4" />,
          items: [
            "新增英语学习内容相关数据表",
            "创建积分商城商品与购买记录表",
            "完善RLS安全策略，保证数据安全",
            "优化数据库查询性能",
            "增加数据完整性约束"
          ]
        },
        {
          category: "用户体验",
          icon: <Zap className="h-4 w-4" />,
          items: [
            "首页新增更新日志快速入口",
            "使用手册和更新日志并排显示",
            "优化英语学习内容的视觉呈现",
            "改进积分显示和奖励提示",
            "增强移动端适配效果"
          ]
        }
      ]
    },
    {
      version: "v2.0.5",
      date: "2025-06-29",
      type: "minor",
      title: "用户积分系统基础版",
      changes: [
        {
          category: "积分功能",
          icon: <Award className="h-4 w-4" />,
          items: [
            "建立用户积分基础数据表",
            "实现每日打卡积分奖励机制",
            "连续打卡额外奖励系统",
            "积分消费和增加API接口",
            "积分历史记录功能"
          ]
        }
      ]
    },
    {
      version: "v2.0.0",
      date: "2025-06-15",
      type: "major",
      title: "核心功能重构与优化",
      changes: [
        {
          category: "系统架构",
          icon: <Database className="h-4 w-4" />,
          items: [
            "完善Supabase数据库架构",
            "优化用户认证与权限管理",
            "重构核心服务层代码",
            "提升系统安全性与稳定性"
          ]
        },
        {
          category: "功能模块",
          icon: <Calendar className="h-4 w-4" />,
          items: [
            "每日打卡系统正式上线",
            "健康数据记录功能增强",
            "语音记录与转录功能",
            "解压小游戏模块",
            "呼吸训练功能"
          ]
        }
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'patch': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'major': return '重大更新';
      case 'minor': return '功能更新';
      case 'patch': return '修复更新';
      default: return '更新';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 头部 */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => onBack()} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">更新日志</h1>
        </div>

        {/* 更新列表 */}
        <div className="space-y-6">
          {updates.map((update, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getTypeColor(update.type)}>
                      {getTypeText(update.type)}
                    </Badge>
                    <h2 className="text-xl font-bold text-gray-800">{update.title}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">{update.version}</div>
                    <div className="text-sm text-gray-500">{update.date}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {update.changes.map((category, catIndex) => (
                    <div key={catIndex}>
                      <div className="flex items-center mb-3">
                        <div className="flex items-center text-gray-700 font-medium">
                          {category.icon}
                          <span className="ml-2">{category.category}</span>
                        </div>
                      </div>
                      <ul className="space-y-2 ml-6">
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 底部提示 */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-blue-800">持续更新中</h3>
            </div>
            <p className="text-blue-700 text-sm leading-relaxed">
              我们会持续改进应用功能，为您提供更好的健康管理体验。
              <br />
              如有建议或问题，欢迎通过设置页面联系我们。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateLog;
