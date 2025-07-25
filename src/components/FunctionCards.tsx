
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  BookOpen, 
  Brain, 
  Heart, 
  Gamepad2,
  TrendingUp,
  Bell,
  Users,
  DollarSign
} from 'lucide-react';

interface FunctionCard {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  onClick: () => void;
}

interface FunctionCardsProps {
  onNavigate: (page: string) => void;
}

const FunctionCards = ({ onNavigate }: FunctionCardsProps) => {
  const functionCards: FunctionCard[] = [
    {
      id: 'dailyDataHub',
      title: '每日数据',
      icon: Calendar,
      color: 'bg-blue-500',
      description: '记录症状和健康数据',
      onClick: () => onNavigate('dailyDataHub')
    },
    {
      id: 'recordHub',
      title: '记录中心',
      icon: BookOpen,
      color: 'bg-green-500',
      description: '管理各类健康记录',
      onClick: () => onNavigate('recordHub')
    },
    {
      id: 'games',
      title: '休闲游戏',
      icon: Gamepad2,
      color: 'bg-purple-500',
      description: '放松身心的小游戏',
      onClick: () => onNavigate('games')
    },
    {
      id: 'educationCenter',
      title: '健康教育',
      icon: Brain,
      color: 'bg-orange-500',
      description: '学习健康知识',
      onClick: () => onNavigate('educationCenter')
    },
    {
      id: 'familyDashboard',
      title: '家庭管理',
      icon: Users,
      color: 'bg-pink-500',
      description: '管理家庭事务',
      onClick: () => onNavigate('familyDashboard')
    },
    {
      id: 'dailyEnglish',
      title: '每日英语',
      icon: Heart,
      color: 'bg-red-500',
      description: '学习英语提升自己',
      onClick: () => onNavigate('dailyEnglish')
    },
    {
      id: 'dataExport',
      title: '数据导出',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      description: '导出和分析数据',
      onClick: () => onNavigate('dataExport')
    },
    {
      id: 'exchangeRate',
      title: '实时汇率',
      icon: DollarSign,
      color: 'bg-yellow-500',
      description: '澳币兑人民币汇率',
      onClick: () => onNavigate('exchangeRate')
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {functionCards.map((card) => (
        <Card 
          key={card.id} 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          onClick={card.onClick}
        >
          <CardContent className="p-4 text-center">
            <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{card.title}</h3>
            <p className="text-xs text-gray-600">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FunctionCards;
