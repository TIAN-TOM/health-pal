
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Megaphone, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Announcement = Tables<'announcements'>;

// 获取正确的北京时间ISO字符串
const getBeijingTimeISO = () => {
  const now = new Date();
  const beijingTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
  return beijingTime.toISOString();
};

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "表单验证失败",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('用户未登录');

      const beijingTime = getBeijingTimeISO();

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            content: formData.content,
            is_active: formData.is_active,
            updated_at: beijingTime
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({
          title: "更新成功",
          description: "公告已更新"
        });
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: formData.title,
            content: formData.content,
            author_id: user.id,
            is_active: formData.is_active,
            created_at: beijingTime,
            updated_at: beijingTime
          });

        if (error) throw error;
        toast({
          title: "发布成功",
          description: "新公告已发布"
        });
      }

      setFormData({ title: '', content: '', is_active: true });
      setShowForm(false);
      setEditingId(null);
      loadAnnouncements();
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      is_active: announcement.is_active
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条公告吗？')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "删除成功",
        description: "公告已删除"
      });
      loadAnnouncements();
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const beijingTime = getBeijingTimeISO();
      
      const { error } = await supabase
        .from('announcements')
        .update({ 
          is_active: !currentStatus,
          updated_at: beijingTime
        })
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "状态更新成功",
        description: !currentStatus ? "公告已启用" : "公告已停用"
      });
      loadAnnouncements();
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <Megaphone className="h-5 w-5 mr-2" />
          公告管理
        </h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ title: '', content: '', is_active: true });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? '取消' : '发布公告'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? '编辑公告' : '发布新公告'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">标题</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入公告标题"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">内容</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="输入公告内容"
                  rows={5}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm">立即发布</label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? '处理中...' : (editingId ? '更新' : '发布')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ title: '', content: '', is_active: true });
                  }}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{announcement.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {announcement.is_active ? '已发布' : '已停用'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500">
                    发布时间: {new Date(announcement.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                    {announcement.updated_at !== announcement.created_at && (
                      <span> · 更新时间: {new Date(announcement.updated_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(announcement.id, announcement.is_active)}
                  >
                    {announcement.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无公告
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;
