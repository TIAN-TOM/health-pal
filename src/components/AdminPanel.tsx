
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, FileText, Megaphone, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  onBack: () => void;
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_checkin?: string;
  total_records?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  published: boolean;
  created_at: string;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      onBack();
      return;
    }
    fetchAdminData();
  }, [userRole]);

  const fetchAdminData = async () => {
    try {
      // 获取用户数据
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 获取公告数据
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(usersData || []);
      setAnnouncements(announcementsData || []);
    } catch (error) {
      console.error('获取管理员数据失败:', error);
      toast({
        title: '错误',
        description: '获取数据失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: '错误',
        description: '请填写标题和内容',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          priority: newAnnouncement.priority,
          published: true
        });

      if (error) throw error;

      toast({
        title: '成功',
        description: '公告发布成功'
      });

      setNewAnnouncement({ title: '', content: '', priority: 'normal' });
      fetchAdminData();
    } catch (error) {
      console.error('发布公告失败:', error);
      toast({
        title: '错误',
        description: '发布公告失败',
        variant: 'destructive'
      });
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">管理员面板</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="announcements">公告管理</TabsTrigger>
            <TabsTrigger value="education">科普管理</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  用户数据
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800">总用户数</h3>
                      <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800">今日新增</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {users.filter(user => 
                          new Date(user.created_at).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-800">本周新增</h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        {users.filter(user => {
                          const userDate = new Date(user.created_at);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return userDate >= weekAgo;
                        }).length}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left">用户ID</th>
                          <th className="border border-gray-300 p-2 text-left">邮箱</th>
                          <th className="border border-gray-300 p-2 text-left">姓名</th>
                          <th className="border border-gray-300 p-2 text-left">注册时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 text-xs">{user.id.slice(0, 8)}...</td>
                            <td className="border border-gray-300 p-2">{user.email}</td>
                            <td className="border border-gray-300 p-2">{user.full_name || '未设置'}</td>
                            <td className="border border-gray-300 p-2">
                              {new Date(user.created_at).toLocaleDateString('zh-CN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Megaphone className="h-5 w-5 mr-2" />
                    发布新公告
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">标题</label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="输入公告标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">内容</label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md h-32"
                      placeholder="输入公告内容"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">优先级</label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement(prev => ({ 
                        ...prev, 
                        priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent'
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">低</option>
                      <option value="normal">普通</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>
                  <Button onClick={createAnnouncement} className="w-full">
                    发布公告
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>已发布公告</CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">暂无公告</p>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              announcement.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                              announcement.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                              announcement.priority === 'normal' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {announcement.priority === 'urgent' ? '紧急' :
                               announcement.priority === 'high' ? '高' :
                               announcement.priority === 'normal' ? '普通' : '低'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{announcement.content}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(announcement.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  科普文章管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">
                  科普文章管理功能正在开发中...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
