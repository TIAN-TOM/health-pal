import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Trash2, Edit2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllCountdownEvents,
  createCountdownEvent,
  updateCountdownEvent,
  deleteCountdownEvent,
  CountdownEvent
} from '@/services/countdownService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CountdownManagement = () => {
  const [countdowns, setCountdowns] = useState<CountdownEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<CountdownEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    target_date: '',
    description: '',
    is_active: true,
    background_image: '',
    theme_color: 'purple',
  });

  useEffect(() => {
    loadCountdowns();
  }, []);

  const loadCountdowns = async () => {
    try {
      const data = await getAllCountdownEvents();
      setCountdowns(data);
    } catch (error) {
      toast.error('加载倒数日失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (countdown?: CountdownEvent) => {
    if (countdown) {
      setEditingCountdown(countdown);
      const dateStr = countdown.target_date.split('T')[0];
      
      setFormData({
        title: countdown.title,
        target_date: dateStr,
        description: countdown.description || '',
        is_active: countdown.is_active,
        background_image: (countdown as any).background_image || '',
        theme_color: (countdown as any).theme_color || 'purple',
      });
    } else {
      setEditingCountdown(null);
      setFormData({
        title: '',
        target_date: '',
        description: '',
        is_active: true,
        background_image: '',
        theme_color: 'purple',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingCountdown(null);
    setFormData({
      title: '',
      target_date: '',
      description: '',
      is_active: true,
      background_image: '',
      theme_color: 'purple',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.target_date) {
      toast.error('请填写标题和目标日期');
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        target_date: formData.target_date,
        description: formData.description,
        is_active: formData.is_active,
        background_image: formData.background_image || null,
        theme_color: formData.theme_color,
      };

      if (editingCountdown) {
        await updateCountdownEvent(editingCountdown.id, submitData);
        toast.success('倒数日更新成功');
      } else {
        await createCountdownEvent(submitData);
        toast.success('倒数日创建成功');
      }
      handleCloseDialog();
      loadCountdowns();
    } catch (error) {
      toast.error(editingCountdown ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个倒数日吗？')) return;

    try {
      await deleteCountdownEvent(id);
      toast.success('删除成功');
      loadCountdowns();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const themeColors = [
    { value: 'purple', label: '紫色', gradient: 'from-purple-100 via-violet-100 to-indigo-100' },
    { value: 'blue', label: '蓝色', gradient: 'from-blue-100 via-cyan-100 to-sky-100' },
    { value: 'pink', label: '粉色', gradient: 'from-rose-100 via-pink-100 to-fuchsia-100' },
    { value: 'orange', label: '橙色', gradient: 'from-orange-100 via-amber-100 to-yellow-100' },
    { value: 'green', label: '绿色', gradient: 'from-emerald-100 via-green-100 to-teal-100' },
    { value: 'red', label: '红色', gradient: 'from-red-100 via-rose-100 to-pink-100' },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">加载中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              倒数日管理
            </CardTitle>
            <Button onClick={() => handleOpenDialog()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              添加倒数日
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {countdowns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无倒数日</p>
              <p className="text-sm mt-2">点击"添加倒数日"创建第一个倒数日</p>
            </div>
          ) : (
            <div className="space-y-4">
              {countdowns.map((countdown) => (
                <div
                  key={countdown.id}
                  className="border rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{countdown.title}</h3>
                      {countdown.is_active && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          激活中
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      目标日期: {formatDate(countdown.target_date)}
                    </p>
                    {countdown.description && (
                      <p className="text-sm text-gray-500">{countdown.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(countdown)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(countdown.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCountdown ? '编辑倒数日' : '添加倒数日'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：春节、生日、纪念日"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_date">目标日期 *</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme_color">主题颜色</Label>
              <Select
                value={formData.theme_color}
                onValueChange={(value) => setFormData({ ...formData, theme_color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themeColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded bg-gradient-to-r ${color.gradient}`}></div>
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="background_image">背景图片URL（可选）</Label>
              <Input
                id="background_image"
                value={formData.background_image}
                onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500">输入图片URL以设置自定义背景</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="添加一些说明..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">是否激活显示</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingCountdown ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CountdownManagement;
