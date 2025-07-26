
import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Bell, Calendar, Users, MessageCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { familyExpensesService, type ExpenseStats } from '@/services/familyExpensesService';
import { familyRemindersService } from '@/services/familyRemindersService';
import { familyCalendarService } from '@/services/familyCalendarService';

interface FamilyDashboardProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const FamilyDashboard = ({ onBack, onNavigate }: FamilyDashboardProps) => {
  const [stats, setStats] = useState<{
    expenses: ExpenseStats | null;
    reminders: { total: number; pending: number };
    events: { today: number; upcoming: number };
  }>({
    expenses: null,
    reminders: { total: 0, pending: 0 },
    events: { today: 0, upcoming: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // 加载支出统计
      const expenseStats = await familyExpensesService.getExpenseStats();
      
      // 加载提醒统计
      const reminders = await familyRemindersService.getFamilyReminders();
      const pendingReminders = reminders.filter(r => !r.is_completed).length;
      
      // 加载日历统计
      const todayEvents = await familyCalendarService.getTodayEvents();
      const allEvents = await familyCalendarService.getFamilyCalendarEvents();
      const today = new Date().toISOString().split('T')[0];
      const upcomingEvents = allEvents.filter(e => e.event_date > today).length;
      
      setStats({
        expenses: expenseStats,
        reminders: { total: reminders.length, pending: pendingReminders },
        events: { today: todayEvents.length, upcoming: upcomingEvents }
      });
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const familyFeatures = [
    {
      title: '家庭记账',
      description: '记录家庭收支',
      icon: DollarSign,
      color: 'bg-blue-500',
      stats: stats.expenses ? formatCurrency(stats.expenses.totalThisMonth) : '加载中...',
      page: 'family-expenses'
    },
    {
      title: '家庭提醒',
      description: '管理家庭待办事项',
      icon: Bell,
      color: 'bg-orange-500',
      stats: `${stats.reminders.pending}/${stats.reminders.total}`,
      page: 'family-reminders'
    },
    {
      title: '家庭日历',
      description: '安排家庭活动',
      icon: Calendar,
      color: 'bg-green-500',
      stats: `今日${stats.events.today}个`,
      page: 'family-calendar'
    },
    {
      title: '家庭成员',
      description: '管理家庭成员信息',
      icon: Users,
      color: 'bg-purple-500',
      stats: '管理成员',
      page: 'family-members'
    },
    {
      title: '家庭消息',
      description: '家庭内部沟通',
      icon: MessageCircle,
      color: 'bg-pink-500',
      stats: '即时通讯',
      page: 'family-messages'
    },
    {
      title: '统计报表',
      description: '查看家庭数据统计',
      icon: BarChart3,
      color: 'bg-indigo-500',
      stats: '数据分析',
      page: 'family-stats'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">家庭管理</h1>
          <div className="w-16" /> {/* 占位符保持居中 */}
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-2 gap-4">
          {familyFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.page} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => {
                  console.log('点击家庭功能:', feature.page);
                  onNavigate(feature.page);
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                  <div className="text-sm font-bold text-blue-600">{feature.stats}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 快速统计概览 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">今日概览</CardTitle>
            <CardDescription>家庭活动统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.expenses ? formatCurrency(stats.expenses.totalToday) : '¥0.00'}
                </div>
                <div className="text-sm text-gray-600">今日支出</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.reminders.pending}
                </div>
                <div className="text-sm text-gray-600">待办事项</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.events.today}
                </div>
                <div className="text-sm text-gray-600">今日活动</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用提示 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>这里是您的家庭管理中心</p>
          <p>点击上方功能卡片开始使用</p>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
