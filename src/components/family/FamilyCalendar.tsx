
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { familyCalendarService, type FamilyCalendarEvent, EVENT_COLORS, TRADITIONAL_FESTIVALS } from '@/services/familyCalendarService';
import { familyMembersService, type FamilyMember } from '@/services/familyMembersService';

interface FamilyCalendarProps {
  onBack: () => void;
  onNavigate?: (page: string, source?: string) => void;
}

const FamilyCalendar = ({ onBack }: FamilyCalendarProps) => {
  const [events, setEvents] = useState<FamilyCalendarEvent[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FamilyCalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    participants: '',
    is_all_day: false,
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const [eventsData, membersData] = await Promise.all([
        familyCalendarService.getMonthEvents(year, month),
        familyMembersService.getFamilyMembers()
      ]);
      
      setEvents(eventsData);
      setMembers(membersData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载日历数据",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        start_time: formData.is_all_day ? null : formData.start_time,
        end_time: formData.is_all_day ? null : formData.end_time,
        participants: formData.participants ? formData.participants.split(',').map(p => p.trim()) : [],
        is_all_day: formData.is_all_day,
        color: formData.color
      };

      if (editingEvent) {
        await familyCalendarService.updateFamilyCalendarEvent(editingEvent.id, eventData);
        toast({
          title: "更新成功",
          description: "日历事件已更新",
        });
      } else {
        await familyCalendarService.addFamilyCalendarEvent(eventData);
        toast({
          title: "添加成功",
          description: "日历事件已添加",
        });
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('保存日历事件失败:', error);
      toast({
        title: "保存失败",
        description: "无法保存日历事件",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await familyCalendarService.deleteFamilyCalendarEvent(id);
      toast({
        title: "删除成功",
        description: "日历事件已删除",
      });
      loadData();
    } catch (error) {
      console.error('删除日历事件失败:', error);
      toast({
        title: "删除失败",
        description: "无法删除日历事件",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      participants: '',
      is_all_day: false,
      color: '#3b82f6'
    });
    setShowAddForm(false);
    setEditingEvent(null);
  };

  const handleEdit = (event: FamilyCalendarEvent) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      participants: event.participants ? event.participants.join(', ') : '',
      is_all_day: event.is_all_day,
      color: event.color
    });
    setEditingEvent(event);
    setShowAddForm(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 添加上个月的日期
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.event_date === dateStr);
  };

  const getBirthdaysForDate = (day: number) => {
    if (!members) return [];
    
    const monthDay = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return members.filter(member => {
      if (!member.birthday) return false;
      const birthday = new Date(member.birthday);
      const birthdayMonthDay = `${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`;
      return birthdayMonthDay === monthDay;
    });
  };

  const getTraditionalFestivalForDate = (day: number) => {
    const monthDay = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return TRADITIONAL_FESTIVALS.find(festival => festival.date === monthDay);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
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
      <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
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
          <h1 className="text-xl font-bold text-gray-800">家庭日历</h1>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={goToToday}
            >
              今天
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加事件
            </Button>
          </div>
        </div>

        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 日历网格 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-24 p-1"></div>;
                }
                
                const dayEvents = getEventsForDate(day);
                const birthdays = getBirthdaysForDate(day);
                const festival = getTraditionalFestivalForDate(day);
                const today = isToday(day);
                
                return (
                  <div
                    key={day}
                    className={`h-24 p-1 border rounded-lg ${
                      today ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${today ? 'text-blue-600' : 'text-gray-800'}`}>
                      {day}
                    </div>
                    
                    {/* 事件显示 */}
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs px-1 py-0.5 rounded truncate cursor-pointer"
                          style={{ backgroundColor: event.color + '20', color: event.color }}
                          onClick={() => handleEdit(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {/* 生日显示 */}
                      {birthdays.slice(0, 1).map((member) => (
                        <div
                          key={member.id}
                          className="text-xs px-1 py-0.5 rounded truncate bg-pink-100 text-pink-600"
                        >
                          🎂 {member.name}
                        </div>
                      ))}
                      
                      {/* 传统节日显示 */}
                      {festival && (
                        <div className="text-xs px-1 py-0.5 rounded truncate bg-red-100 text-red-600">
                          🎉 {festival.name}
                        </div>
                      )}
                      
                      {/* 更多事件指示 */}
                      {(dayEvents.length + birthdays.length > 2) && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length + birthdays.length - 2} 更多
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingEvent ? '编辑事件' : '添加事件'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="请输入事件标题"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入事件描述（可选）"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="event_date">日期</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_all_day"
                    checked={formData.is_all_day}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_all_day: checked })}
                  />
                  <Label htmlFor="is_all_day">全天事件</Label>
                </div>
                
                {!formData.is_all_day && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">开始时间</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">结束时间</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="participants">参与者</Label>
                  <Input
                    id="participants"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    placeholder="请输入参与者，用逗号分隔（可选）"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">颜色</Label>
                  <div className="flex space-x-2 mt-2">
                    {EVENT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    {editingEvent ? '更新' : '添加'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 事件列表 */}
        <Card>
          <CardHeader>
            <CardTitle>本月事件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-600 flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(event.event_date).toLocaleDateString('zh-CN')}
                        </div>
                        {!event.is_all_day && (event.start_time || event.end_time) && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.start_time && event.end_time ? 
                              `${event.start_time} - ${event.end_time}` : 
                              event.start_time || event.end_time
                            }
                          </div>
                        )}
                        {event.participants && event.participants.length > 0 && (
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {event.participants.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  本月暂无事件
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyCalendar;
