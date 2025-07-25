
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { familyCalendarService, type FamilyCalendarEvent, EVENT_COLORS } from '@/services/familyCalendarService';

interface FamilyCalendarProps {
  onBack: () => void;
}

const FamilyCalendar = ({ onBack }: FamilyCalendarProps) => {
  const [events, setEvents] = useState<FamilyCalendarEvent[]>([]);
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
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await familyCalendarService.getFamilyCalendarEvents();
      setEvents(data);
    } catch (error) {
      console.error('加载日历事件失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载日历事件",
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
      loadEvents();
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
      loadEvents();
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime) return '';
    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  const colorOptions = EVENT_COLORS.map((color, index) => ({
    value: color,
    label: `颜色 ${index + 1}`
  }));

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
          <h1 className="text-xl font-bold text-gray-800">家庭日历</h1>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>

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
                    {colorOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: option.value })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === option.value ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: option.value }}
                        title={option.label}
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
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="font-medium">{event.title}</span>
                      {event.is_all_day && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          全天
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {event.description && (
                        <div>{event.description}</div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(event.event_date)}
                      </div>
                      {!event.is_all_day && (event.start_time || event.end_time) && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeRange(event.start_time, event.end_time)}
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
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无日历事件
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyCalendar;
