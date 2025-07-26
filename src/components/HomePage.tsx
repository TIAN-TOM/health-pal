
import React from 'react';
import { Calendar, BarChart3, ListChecks, Settings, Users, HeartHandshake, MessageSquare, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HomePageProps {
  userDisplayName: string;
  onSettingsClick: () => void;
  onEmergencyClick: () => void;
  onNavigate: (page: string, source?: string) => void;
  homeRef: React.MutableRefObject<HTMLDivElement | null>;
}

const HomePage = ({ userDisplayName, onSettingsClick, onEmergencyClick, onNavigate, homeRef }: HomePageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleNavigation = (route: string) => {
    if (!user) {
      toast({
        title: '请先登录',
        description: '您需要登录才能访问此功能。',
      });
      return;
    }
    onNavigate(route);
  };

  const symptomsCards = [
    {
      title: '记录眩晕症状',
      description: '记录眩晕、头晕等症状的详细信息',
      icon: '💫',
      color: 'from-blue-400 to-blue-500',
      onClick: () => onNavigate('dizziness-record'),
      category: 'primary'
    },
    {
      title: '记录血糖情况',
      description: '记录血糖监测数据和相关信息',
      icon: '📊', 
      color: 'from-emerald-400 to-emerald-500',
      onClick: () => onNavigate('diabetes-record'),
      category: 'primary'
    },
    {
      title: '记录饮食与作息',
      description: '记录日常饮食、睡眠和生活习惯',
      icon: '🏠',
      color: 'from-green-400 to-green-500', 
      onClick: () => onNavigate('lifestyle-record'),
      category: 'primary'
    },
    {
      title: '记录用药情况',
      description: '记录药物服用情况和效果评价',
      icon: '💊',
      color: 'from-orange-400 to-orange-500',
      onClick: () => onNavigate('medication-record'),
      category: 'primary'
    }
  ];

  const mainCards = [
    {
      title: '每日健康打卡',
      description: '记录每日健康状况，包括心情、症状等',
      icon: ListChecks,
      color: 'from-pink-400 to-pink-500',
      onClick: () => handleNavigation('checkin'),
      category: 'primary'
    },
    {
      title: '查看日历视图',
      description: '以日历形式查看健康数据',
      icon: Calendar,
      color: 'from-purple-400 to-purple-500',
      onClick: () => handleNavigation('daily-data'),
      category: 'primary'
    },
    {
      title: '查看历史记录',
      description: '查看所有历史健康记录',
      icon: BarChart3,
      color: 'from-yellow-400 to-yellow-500',
      onClick: () => handleNavigation('daily-data'),
      category: 'primary'
    },
    {
      title: '家庭管理中心',
      description: '家庭日历、账本、提醒等',
      icon: Users,
      color: 'from-blue-400 to-blue-500',
      onClick: () => handleNavigation('familyDashboard'),
      category: 'secondary'
    },
    {
      title: '整理记录给医生/AI',
      description: '将健康数据整理成报告，方便医生诊断',
      icon: HeartHandshake,
      color: 'from-red-400 to-red-500',
      onClick: () => handleNavigation('export'),
      category: 'secondary'
    },
    {
      title: '设置',
      description: '个性化设置和偏好设置',
      icon: Settings,
      color: 'from-gray-400 to-gray-500',
      onClick: () => handleNavigation('settings'),
      category: 'secondary'
    },
    {
      title: '语音记录',
      description: '记录语音信息',
      icon: MessageSquare,
      color: 'from-teal-400 to-teal-500',
      onClick: () => handleNavigation('voice'),
      category: 'secondary'
    },
    {
      title: 'AI辅助分析',
      description: '利用AI技术分析健康数据',
      icon: BrainCircuit,
      color: 'from-indigo-400 to-indigo-500',
      onClick: () => handleNavigation('admin-panel'),
      category: 'secondary'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" ref={homeRef}>
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* 主要功能卡片 */}
          {mainCards.map((card, index) => (
            <Card
              key={index}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 overflow-hidden`}
              onClick={card.onClick}
            >
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-gray-700 transition-colors">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* 记录症状卡片 */}
          {symptomsCards.map((card, index) => (
            <Card
              key={index}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 overflow-hidden`}
              onClick={card.onClick}
            >
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-gray-700 transition-colors">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
