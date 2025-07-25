
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { familyExpensesService, type ExpenseStats } from '@/services/familyExpensesService';
import { familyRemindersService } from '@/services/familyRemindersService';
import { familyCalendarService } from '@/services/familyCalendarService';

interface FamilyStatsProps {
  onBack: () => void;
}

const FamilyStats = ({ onBack }: FamilyStatsProps) => {
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [reminderStats, setReminderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [calendarStats, setCalendarStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    todayEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // 加载支出统计
      const expenseData = await familyExpensesService.getExpenseStats();
      setExpenseStats(expenseData);

      // 加载提醒统计
      const reminders = await familyRemindersService.getFamilyReminders();
      const completed = reminders.filter(r => r.is_completed).length;
      setReminderStats({
        total: reminders.length,
        completed,
        pending: reminders.length - completed
      });

      // 加载日历统计
      const events = await familyCalendarService.getFamilyCalendarEvents();
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = events.filter(e => e.event_date === today).length;
      const upcomingEvents = events.filter(e => e.event_date > today).length;
      
      setCalendarStats({
        totalEvents: events.length,
        upcomingEvents,
        todayEvents
      });

    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
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
          <h1 className="text-xl font-bold text-gray-800">家庭统计</h1>
          <div className="w-16" /> {/* 占位符保持居中 */}
        </div>

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">支出统计</TabsTrigger>
            <TabsTrigger value="reminders">提醒统计</TabsTrigger>
            <TabsTrigger value="calendar">日历统计</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    支出统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseStats && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(expenseStats.totalToday)}
                        </div>
                        <div className="text-sm text-gray-600">今日支出</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(expenseStats.totalThisMonth)}
                        </div>
                        <div className="text-sm text-gray-600">本月支出</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(expenseStats.totalThisYear)}
                        </div>
                        <div className="text-sm text-gray-600">今年支出</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {expenseStats && expenseStats.categoryStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">分类统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {expenseStats.categoryStats.map((category) => (
                        <div key={category.category} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category.category}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold">{formatCurrency(category.amount)}</div>
                            <div className="text-xs text-gray-500">
                              {formatPercentage(category.amount, expenseStats.totalThisMonth)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-orange-600" />
                  提醒统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reminderStats.total}
                    </div>
                    <div className="text-sm text-gray-600">总提醒</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {reminderStats.completed}
                    </div>
                    <div className="text-sm text-gray-600">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {reminderStats.pending}
                    </div>
                    <div className="text-sm text-gray-600">待完成</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-700">
                      完成率: {formatPercentage(reminderStats.completed, reminderStats.total)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  日历统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {calendarStats.totalEvents}
                    </div>
                    <div className="text-sm text-gray-600">总事件</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {calendarStats.todayEvents}
                    </div>
                    <div className="text-sm text-gray-600">今日事件</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {calendarStats.upcomingEvents}
                    </div>
                    <div className="text-sm text-gray-600">即将到来</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FamilyStats;
