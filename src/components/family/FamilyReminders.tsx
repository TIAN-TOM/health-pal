
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit, Trash2, Clock, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { familyRemindersService, type FamilyReminder, type FamilyReminderInput } from '@/services/familyRemindersService';

interface FamilyRemindersProps {
  onBack: () => void;
}

const FamilyReminders = ({ onBack }: FamilyRemindersProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<FamilyReminder | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_date: '',
    assigned_to: '',
    is_recurring: false,
    recurring_pattern: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders = [], isPending, isError, refetch } = useQuery({
    queryKey: ['family-reminders'],
    queryFn: () => familyRemindersService.getFamilyReminders(),
  });

  const saveMutation = useMutation({
    mutationFn: (vars: { id?: string; data: FamilyReminderInput }) =>
      vars.id
        ? familyRemindersService.updateFamilyReminder(vars.id, vars.data)
        : familyRemindersService.addFamilyReminder(vars.data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['family-reminders'] });
      toast(vars.id
        ? { title: "更新成功", description: "提醒已更新" }
        : { title: "添加成功", description: "提醒已添加" });
      resetForm();
    },
    onError: (error) => {
      console.error('保存提醒失败:', error);
      toast({ title: "保存失败", description: "无法保存提醒", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => familyRemindersService.deleteFamilyReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-reminders'] });
      toast({ title: "删除成功", description: "提醒已删除" });
    },
    onError: (error) => {
      console.error('删除提醒失败:', error);
      toast({ title: "删除失败", description: "无法删除提醒", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (vars: { id: string; isCompleted: boolean }) =>
      familyRemindersService.toggleReminderComplete(vars.id, vars.isCompleted),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['family-reminders'] });
      toast({
        title: vars.isCompleted ? "已完成" : "已取消完成",
        description: vars.isCompleted ? "提醒已标记为完成" : "提醒已标记为未完成",
      });
    },
    onError: (error) => {
      console.error('更新提醒状态失败:', error);
      toast({ title: "操作失败", description: "无法更新提醒状态", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reminderData: FamilyReminderInput = {
      title: formData.title,
      description: formData.description,
      reminder_date: formData.reminder_date,
      assigned_to: formData.assigned_to,
      is_recurring: formData.is_recurring,
      // 必须传 null 而非 undefined：supabase 的 update 会忽略 undefined 字段，
      // 否则取消重复提醒后数据库中会残留旧的 recurring_pattern
      recurring_pattern: formData.is_recurring ? formData.recurring_pattern || null : null,
      is_completed: false
    };
    saveMutation.mutate({ id: editingReminder?.id, data: reminderData });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    toggleMutation.mutate({ id, isCompleted });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminder_date: '',
      assigned_to: '',
      is_recurring: false,
      recurring_pattern: ''
    });
    setShowAddForm(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder: FamilyReminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      reminder_date: reminder.reminder_date,
      assigned_to: reminder.assigned_to || '',
      is_recurring: reminder.is_recurring,
      recurring_pattern: reminder.recurring_pattern || ''
    });
    setEditingReminder(reminder);
    setShowAddForm(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4" role="alert">
          <p className="text-gray-600">加载提醒列表失败，请检查网络后重试</p>
          <Button variant="outline" onClick={() => refetch()}>
            重新加载
          </Button>
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
          <h1 className="text-xl font-bold text-gray-800">家庭提醒</h1>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingReminder ? '编辑提醒' : '添加提醒'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="请输入提醒标题"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入提醒描述（可选）"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="reminder_date">日期</Label>
                  <Input
                    id="reminder_date"
                    type="date"
                    value={formData.reminder_date}
                    onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assigned_to">负责人</Label>
                  <Input
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="请输入负责人（可选）"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                  />
                  <Label htmlFor="is_recurring">重复提醒</Label>
                </div>
                {formData.is_recurring && (
                  <div>
                    <Label htmlFor="recurring_pattern">重复模式</Label>
                    <Input
                      id="recurring_pattern"
                      value={formData.recurring_pattern}
                      onChange={(e) => setFormData({ ...formData, recurring_pattern: e.target.value })}
                      placeholder="例如：每周、每月"
                    />
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    {editingReminder ? '更新' : '添加'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 提醒列表 */}
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={reminder.is_completed ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleComplete(reminder.id, !reminder.is_completed)}
                        aria-label={reminder.is_completed ? '标记为未完成' : '标记为已完成'}
                        className={reminder.is_completed ? 'text-green-600' : 'text-gray-400'}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <span className={`font-medium ${reminder.is_completed ? 'line-through text-gray-500' : ''}`}>
                        {reminder.title}
                      </span>
                      {reminder.is_recurring && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          重复
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {reminder.description && (
                        <div>{reminder.description}</div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(reminder.reminder_date)}
                      </div>
                      {reminder.assigned_to && (
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {reminder.assigned_to}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(reminder)}
                      aria-label="编辑提醒"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(reminder.id)}
                      aria-label="删除提醒"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {reminders.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              暂无提醒
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyReminders;
