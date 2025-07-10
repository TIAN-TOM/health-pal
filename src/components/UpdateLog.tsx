import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Star, Bug, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdateLogProps {
  onBack: () => void;
}

const UpdateLog = ({ onBack }: UpdateLogProps) => {
  const updates = [
    {
      version: "v2.5.3",
      date: "2025-07-10",
      type: "major",
      title: "五子棋游戏功能大幅增强",
      items: [
        "🎯 新增悔棋功能，支持撤销上一步移动",
        "🎨 新增现代灰调皮肤和复古绿调皮肤",
        "📋 历史记录系统，完整记录游戏过程",
        "🔒 智能悔棋限制，只在玩家回合且游戏进行中可用",
        "🎮 改进游戏状态管理，确保操作准确性",
        "💎 皮肤选择更加丰富，满足不同视觉偏好",
        "⚡ 优化用户交互体验，按钮状态智能显示",
        "🎵 保持原有音效和AI智能对战功能"
      ]
    },
    {
      version: "v2.5.2",
      date: "2025-07-09",
      type: "major",
      title: "每日英语数据库内容完善",
      items: [
        "✅ 成功添加35条英语名言到数据库，覆盖不同主题和难度",
        "✅ 成功添加35个英语单词到数据库，包含发音、例句和翻译",
        "✅ 成功添加35个英语短语到数据库，涵盖习语、口语和商务用语",
        "✅ 成功添加18篇英语听力材料到数据库，适合不同水平学习者",
        "🎯 内容分类包含初级、中级、高级三个难度等级",
        "💡 确保30天内每日内容不重样，基于北京时间自动更新",
        "🔍 修复了数据库约束问题，确保内容正确保存",
        "📊 内容库总量达到123项学习材料，丰富度大幅提升"
      ]
    },
    {
      version: "v2.5.1", 
      date: "2025-07-08",
      type: "major",
      title: "每日英语模块重大优化",
      items: [
        "🔧 修复每日英语内容重复问题，确保每天内容都不一样",
        "📅 基于北京时间的精确日期切换，确保0点准时更新内容",
        "📚 优化英语学习内容分发算法和缓存机制",
        "🎯 改进内容分发算法，确保至少30天内不重样",
        "⚡ 新增内容缓存机制，提升加载速度和用户体验",
        "🔄 优化时间检测机制，每分钟检查日期变化确保及时更新",
        "📊 增加内容唯一性测试功能，确保质量稳定",
        "🎵 保持原有语音朗读和学习功能，体验更流畅",
        "🌟 显示北京时间和内容更新提示，用户体验更友好",
        "📝 完善日志记录，便于监控和调试内容分发情况"
      ]
    },
    {
      version: "v2.4.1",
      date: "2025-07-02",
      type: "patch", 
      title: "语音记录功能修复",
      items: [
        "🔧 修复语音记录进度条显示问题，进度条右侧现在正确显示录音总时长",
        "🔧 修复保存语音记录后错误显示『录音已删除』的提示问题",
        "🎵 优化历史记录播放和下载功能，确保所有操作正常工作",
        "⚡ 改进音频元数据加载处理，提高播放体验",
        "🎯 完善进度条同步机制，确保播放进度准确显示"
      ]
    },
    {
      version: "v2.4.0",
      date: "2025-07-02",
      type: "major",
      title: "语音记录与英语学习重大优化",
      items: [
        "✨ 完全重构语音记录功能，支持高质量录音和30天云端存储",
        "🎵 新增语音播放控制：播放/暂停、进度调节、音量控制",
        "📝 语音记录支持添加备注和标题，便于管理",
        "🔒 增强隐私保护：只有用户本人可收听自己的录音",
        "📊 管理员可查看录音记录元数据，但无法访问音频内容",
        "🌟 每日英语新增大量初级和中级内容",
        "📚 英语学习内容现支持一个月不重样的自动更新",
        "⚙️ 管理员面板新增积分管理功能",
        "🔧 修复了语音记录保存和播放的多个问题",
        "🎯 优化每日英语页面，移除日期选择器，支持语音中断功能"
      ]
    },
    {
      version: "v2.3.1",
      date: "2025-06-28",
      type: "minor",
      title: "用户体验优化",
      items: [
        "🎨 优化了管理员面板的用户界面设计",
        "📱 改进了移动端的响应式布局",
        "⚡ 提升了页面加载速度",
        "🐛 修复了几个小的界面显示问题"
      ]
    },
    {
      version: "v2.3.0",
      date: "2025-06-25",
      type: "major",
      title: "英语学习功能上线",
      items: [
        "📖 新增每日英语学习模块",
        "💬 包含英语名言、单词学习、常用短语和听力练习",
        "🔊 支持英语朗读功能，帮助练习发音",
        "📊 管理员可以添加和编辑英语学习内容",
        "🎯 根据难度级别分类显示学习内容"
      ]
    },
    {
      version: "v2.2.0",
      date: "2025-06-20",
      type: "major",
      title: "积分系统与商城",
      items: [
        "🎁 全新积分系统上线",
        "🏪 积分商城，可用积分兑换虚拟物品",
        "📅 每日打卡获得积分奖励",
        "🔥 连续打卡额外奖励机制",
        "👑 管理员积分管理功能"
      ]
    },
    {
      version: "v2.1.0",
      date: "2025-06-15",
      type: "major",
      title: "管理员系统完善",
      items: [
        "👨‍💼 完整的管理员权限系统",
        "📊 用户管理和数据统计",
        "📢 公告管理功能",
        "🔔 管理员通知中心",
        "📚 教育资源管理"
      ]
    },
    {
      version: "v2.0.0",
      date: "2025-06-10",
      type: "major",
      title: "全面重构与功能增强",
      items: [
        "🎨 全新的用户界面设计",
        "⚡ 性能大幅优化",
        "🔐 完善的用户认证系统",
        "💾 数据备份与导出功能",
        "📱 完美的移动端适配"
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'major': return <Star className="h-4 w-4" />;
      case 'minor': return <Zap className="h-4 w-4" />;
      case 'patch': return <Bug className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch': return 'bg-green-100 text-green-800 border-green-200';
      case 'security': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'major': return '重大更新';
      case 'minor': return '功能更新';
      case 'patch': return '问题修复';
      case 'security': return '安全更新';
      default: return '常规更新';
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
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800 flex items-center justify-center">
              <Clock className="mr-2 h-6 w-6 text-blue-600" />
              更新日志
            </CardTitle>
            <p className="text-center text-gray-600">
              记录系统的每一次改进与优化
            </p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {updates.map((update, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getTypeColor(update.type)} flex items-center gap-1`}>
                      {getTypeIcon(update.type)}
                      {getTypeText(update.type)}
                    </Badge>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {update.version}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {update.date}
                  </div>
                </div>
                <h4 className="text-lg text-gray-700 mt-2">{update.title}</h4>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {update.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              💡 持续改进中
            </h3>
            <p className="text-gray-600">
              我们持续关注用户反馈，不断优化产品体验。如有建议或问题，欢迎随时联系我们！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLog;
