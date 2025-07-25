
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, DollarSign, Bell, Calendar, BarChart3, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { familyExpensesService, type ExpenseStats } from '@/services/familyExpensesService';
import { familyRemindersService, type FamilyReminder } from '@/services/familyRemindersService';
import { familyCalendarService, type FamilyCalendarEvent } from '@/services/familyCalendarService';

interface FamilyDashboardProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const FamilyDashboard = ({ onBack, onNavigate }: FamilyDashboardProps) => {
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [todayReminders, setTodayReminders] = useState<FamilyReminder[]>([]);
  const [todayEvents, setTodayEvents] = useState<FamilyCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 加载支出统计
      const expenseData = await familyExpensesService.getExpenseStats();
      setExpenseStats(expenseData);

      // 加载今日提醒
      const reminders = await familyRemindersService.getTodayReminders();
      setTodayReminders(reminders);

      // 加载今日事件
      const events = await familyCalendarService.getTodayEvents();
      setTodayEvents(events);

    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const functionCards = [
    {
      title: '家庭记账',
      icon: DollarSign,
      color: 'bg-blue-500',
      page: 'familyExpenses',
      description: '记录家庭收支'
    },
    {
      title: '家庭提醒',
      icon: Bell,
      color: 'bg-orange-500',
      page: 'familyReminders',
      description: '管理家庭待办事项'
    },
    {
      title: '家庭日历',
      icon: Calendar,
      color: 'bg-green-500',
      page: 'familyCalendar',
      description: '安排家庭活动'
    },
    {
      title: '家庭成员',
      icon: Users,
      color: 'bg-purple-500',
      page: 'familyMembers',
      description: '管理家庭成员信息'
    },
    {
      title: '家庭消息',
      icon: MessageCircle,
      color: 'bg-pink-500',
      page: 'familyMessages',
      description: '家庭内部沟通'
    },
    {
      title: '统计报表',
      icon: BarChart3,
      color: 'bg-indigo-500',
      page: 'familyStats',
      description: '查看家庭数据统计'
    }
  ];

  const handleCardClick = (page: string) => {
    console.log('点击功能卡片:', page);
    onNavigate(page);
  };

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

        {/* 快速统计 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {expenseStats && (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(expenseStats.totalToday)}
                  </div>
                  <div className="text-sm text-gray-600">今日支出</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(expenseStats.totalThisMonth)}
                  </div>
                  <div className="text-sm text-gray-600">本月支出</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {functionCards.map((card) => (
            <Card 
              key={card.page} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick(card.page)}
            >
              <CardContent className="p-4 text-center">
                <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1">{card.title}</h3>
                <p className="text-xs text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 今日提醒 */}
        {todayReminders.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2 text-orange-600" />
                今日提醒
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayReminders.slice(0, 3).map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{reminder.title}</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(reminder.reminder_date)}
                      </div>
                    </div>
                    <div className="text-orange-600">
                      <Bell className="h-4 w-4" />
                    </div>
                  </div>
                ))}
                {todayReminders.length > 3 && (
                  <div className="text-center text-sm text-gray-500">
                    还有 {todayReminders.length - 3} 个提醒...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 今日事件 */}
        {todayEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                今日事件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {event.is_all_day ? '全天' : `${event.start_time || ''} - ${event.end_time || ''}`}
                      </div>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: event.color }}
                    />
                  </div>
                ))}
                {todayEvents.length > 3 && (
                  <div className="text-center text-sm text-gray-500">
                    还有 {todayEvents.length - 3} 个事件...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态 */}
        {todayReminders.length === 0 && todayEvents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">今天暂无提醒和事件</p>
              <p className="text-sm text-gray-400 mt-2">点击上方功能卡片开始管理家庭事务</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;
