
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Megaphone, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  setAnnouncementActive,
  type Announcement,
  type AnnouncementInput,
} from '@/services/announcementsService';

const AnnouncementManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: announcements = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });

  const saveMutation = useMutation({
    mutationFn: async (vars: { id?: string; input: AnnouncementInput }) => {
      if (vars.id) {
        await updateAnnouncement(vars.id, vars.input);
      } else {
        await createAnnouncement(vars.input);
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast(
        vars.id
          ? { title: "更新成功", description: "公告已更新" }
          : { title: "发布成功", description: "新公告已发布" }
      );
      setFormData({ title: '', content: '', is_active: true });
      setShowForm(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: "删除成功",
        description: "公告已删除"
      });
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) =>
      setAnnouncementActive(id, next),
    onSuccess: (_data, { next }) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: "状态更新成功",
        description: next ? "公告已启用" : "公告已停用"
      });
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "表单验证失败",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }

    saveMutation.mutate({ id: editingId ?? undefined, input: formData });
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

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这条公告吗？')) return;

    deleteMutation.mutate(id);
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, next: !currentStatus });
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
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? '处理中...' : (editingId ? '更新' : '发布')}
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

      {isPending ? (
        <div className="text-center py-8 text-gray-600">加载中...</div>
      ) : isError ? (
        <div className="text-center py-8 space-y-3" role="alert">
          <p className="text-gray-600">公告加载失败，请检查网络后重试</p>
          <Button variant="outline" onClick={() => refetch()}>
            重新加载
          </Button>
        </div>
      ) : (
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
                  <p className="text-xs text-gray-600">
                    发布时间: {new Date(announcement.created_at).toLocaleString('zh-CN', { 
                      timeZone: 'Asia/Shanghai',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })} (北京时间)
                    {announcement.updated_at !== announcement.created_at && (
                      <span> · 更新时间: {new Date(announcement.updated_at).toLocaleString('zh-CN', { 
                        timeZone: 'Asia/Shanghai',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })} (北京时间)</span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(announcement.id, announcement.is_active)}
                    aria-label={announcement.is_active ? '停用公告' : '发布公告'}
                  >
                    {announcement.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                    aria-label="编辑公告"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                    aria-label="删除公告"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            暂无公告
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;
