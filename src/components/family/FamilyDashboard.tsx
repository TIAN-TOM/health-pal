
import React from 'react';
import { ArrowLeft, Calendar, DollarSign, Bell, Users, MessageSquare, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FamilyDashboardProps {
  onBack: () => void;
  onNavigate: (page: string, source?: string) => void;
}

const FamilyDashboard = ({ onBack, onNavigate }: FamilyDashboardProps) => {
  const familyFeatures = [
    {
      id: 'family-calendar',
      title: '家庭日历',
      description: '管理家庭日程和重要事件',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      route: 'family-calendar'
    },
    {
      id: 'enhanced-family-calendar',
      title: '✨ 增强版日历',
      description: '42格网格布局，支持农历、节日、生日提醒',
      icon: Sparkles,
      color: 'from-purple-500 to-purple-600',
      route: 'enhanced-family-calendar'
    },
    {
      id: 'family-expenses',
      title: '家庭账本',
      description: '记录和统计家庭收支',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      route: 'family-expenses'
    },
    {
      id: 'family-reminders',
      title: '家庭提醒',
      description: '设置重要事项提醒',
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      route: 'family-reminders'
    },
    {
      id: 'family-members',
      title: '家庭成员',
      description: '管理家庭成员信息',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      route: 'family-members'
    },
    {
      id: 'family-messages',
      title: '家庭留言',
      description: '家庭成员间的消息交流',
      icon: MessageSquare,
      color: 'from-pink-500 to-pink-600',
      route: 'family-messages'
    },
    {
      id: 'family-stats',
      title: '家庭统计',
      description: '查看家庭数据统计',
      icon: BarChart3,
      color: 'from-cyan-500 to-cyan-600',
      route: 'family-stats'
    }
  ];

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
            返回主页
          </Button>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            🏠 家庭管理中心
          </h1>
          <div className="w-16" />
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={feature.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 overflow-hidden"
                onClick={() => onNavigate(feature.route)}
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-gray-700 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border">
            <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-sm text-gray-600">
              体验全新的增强版家庭日历，功能更强大！
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
