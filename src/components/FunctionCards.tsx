
import React from 'react';
import { ClipboardList, Activity, Heart, Mic, Gamepad2, Wind, Home, DollarSign, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FunctionCardsProps {
  onNavigate: (page: string, source?: string) => void;
}

const FunctionCards = ({ onNavigate }: FunctionCardsProps) => {
  const functions = [
    {
      id: 'checkin',
      title: '每日签到',
      description: '记录今日状态',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      id: 'record-hub',
      title: '健康记录',
      description: '症状与数据记录',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      id: 'breathing',
      title: '呼吸训练',
      description: '深呼吸放松练习',
      icon: Wind,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    {
      id: 'voice',
      title: '语音记录',
      description: '快速语音输入',
      icon: Mic,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600'
    },
    {
      id: 'familyDashboard',
      title: '家庭管理',
      description: '温馨的家庭管理系统',
      icon: Home,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600'
    },
    {
      id: 'games',
      title: '解压小游戏',
      description: '放松心情',
      icon: Gamepad2,
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-600'
    },
    {
      id: 'exchange-rate',
      title: '实时汇率',
      description: '澳币汇率查询',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      id: 'english',
      title: '每日英语',
      description: '名言·单词·听力',
      icon: BookOpen,
      color: 'from-violet-500 to-violet-600',
      textColor: 'text-violet-600'
    }
  ];

  return (
    <>
      {functions.map(func => (
        <Card 
          key={func.id} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105" 
          onClick={() => onNavigate(func.id, 'home')}
        >
          <CardContent className="p-4 text-center">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${func.color} flex items-center justify-center mx-auto mb-3`}>
              <func.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className={`font-medium ${func.textColor} mb-1`}>{func.title}</h3>
            <p className="text-xs text-gray-600">{func.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default FunctionCards;
