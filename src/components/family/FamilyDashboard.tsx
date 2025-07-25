import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Calculator, Calendar, Bell, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { familyExpensesService, type ExpenseStats } from '@/services/familyExpensesService';
import { familyRemindersService, type FamilyReminder } from '@/services/familyRemindersService';
import { familyCalendarService, type FamilyCalendarEvent } from '@/services/familyCalendarService';

interface FamilyDashboardProps {
  onBack: () => void;
  onNavigateToMembers: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToReminders: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToMessages: () => void;
  onNavigateToStats: () => void;
}

const FamilyDashboard = ({
  onBack,
  onNavigateToMembers,
  onNavigateToExpenses,
  onNavigateToReminders,
  onNavigateToCalendar,
  onNavigateToMessages,
  onNavigateToStats
}: FamilyDashboardProps) => {
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [todayReminders, setTodayReminders] = useState<FamilyReminder[]>([]);
  const [todayEvents, setTodayEvents] = useState<FamilyCalendarEvent[]>([]);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, reminders, events, count] = await Promise.all([
        familyExpensesService.getExpenseStats(),
        familyRemindersService.getTodayReminders(),
        familyCalendarService.getTodayEvents(),
        familyRemindersService.getIncompleteCount()
      ]);

      setExpenseStats(stats);
      setTodayReminders(reminders);
      setTodayEvents(events);
      setIncompleteCount(count);
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
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return {
      date: now.getDate(),
      month: now.toLocaleDateString('zh-CN', { month: 'long' }),
      weekday: now.toLocaleDateString('zh-CN', { weekday: 'long' })
    };
  };

  const currentDate = getCurrentDate();

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
          <h1 className="text-xl font-bold text-gray-800">温馨的家</h1>
        </div>

        {/* 日期显示 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{currentDate.date}</div>
              <div className="text-sm text-gray-600">{currentDate.month} • {currentDate.weekday}</div>
            </div>
          </CardContent>
        </Card>

        {/* 快捷操作网格 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToExpenses}>
            <CardContent className="p-4 text-center">
              <Calculator className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">记账</div>
              {expenseStats && (
                <div className="text-xs text-gray-500 mt-1">
                  今日: {formatCurrency(expenseStats.totalToday)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToReminders}>
            <CardContent className="p-4 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium">提醒</div>
              {incompleteCount > 0 && (
                <Badge variant="destructive" className="text-xs mt-1">
                  {incompleteCount}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToCalendar}>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">日历</div>
              {todayEvents.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  今日 {todayEvents.length} 个事件
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToStats}>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">统计</div>
              {expenseStats && (
                <div className="text-xs text-gray-500 mt-1">
                  本月: {formatCurrency(expenseStats.totalThisMonth)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 家庭成员管理 */}
        <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToMembers}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              家庭成员
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600">管理家庭成员信息</p>
          </CardContent>
        </Card>

        {/* 今日待办 */}
        {todayReminders.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">今日待办</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {todayReminders.slice(0, 3).map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{reminder.title}</div>
                      {reminder.assigned_to && (
                        <div className="text-xs text-gray-500">负责人: {reminder.assigned_to}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(reminder.reminder_date).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                {todayReminders.length > 3 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={onNavigateToReminders}>
                      查看全部 {todayReminders.length} 个待办
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 今日事件 */}
        {todayEvents.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">今日安排</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {todayEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: event.color }}
                      />
                      <div>
                        <div className="text-sm font-medium">{event.title}</div>
                        {event.participants && event.participants.length > 0 && (
                          <div className="text-xs text-gray-500">
                            参与者: {event.participants.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    {!event.is_all_day && event.start_time && (
                      <div className="text-xs text-gray-400">{event.start_time}</div>
                    )}
                  </div>
                ))}
                {todayEvents.length > 3 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={onNavigateToCalendar}>
                      查看全部 {todayEvents.length} 个事件
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 消息中心 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToMessages}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
              消息中心
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600">家庭成员交流沟通</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyDashboard;