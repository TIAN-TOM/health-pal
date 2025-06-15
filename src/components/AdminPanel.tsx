import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Megaphone, BookOpen, Shield, Eye, Trash2, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminPanelProps {
  onBack: () => void;
}

interface UserStats {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_checkin?: string;
  record_count: number;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const { toast } = useToast();

  const fetchUserStats = async () => {
    setIsLoading(true);
    try {
      // 获取所有用户的基本信息
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at');

      if (profilesError) throw profilesError;

      // 获取每个用户的记录统计
      const userStatsPromises = profiles.map(async (profile) => {
        // 获取用户记录数量
        const { count: recordCount } = await supabase
          .from('meniere_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        // 获取最近一次打卡时间
        const { data: lastCheckin } = await supabase
          .from('daily_checkins')
          .select('checkin_date')
          .eq('user_id', profile.id)
          .order('checkin_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...profile,
          record_count: recordCount || 0,
          last_checkin: lastCheckin?.checkin_date
        };
      });

      const stats = await Promise.all(userStatsPromises);
      setUserStats(stats);
    } catch (error) {
      console.error('获取用户统计失败:', error);
      toast({
        title: "获取数据失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUserStats();
    }
  }, [activeTab]);

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">用户管理</h3>
        <Button onClick={fetchUserStats} disabled={isLoading}>
          刷新数据
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userStats.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{user.full_name || '未设置姓名'}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <p>注册时间: {new Date(user.created_at).toLocaleDateString()}</p>
                      <p>记录数量: {user.record_count} 条</p>
                      {user.last_checkin && (
                        <p>最近打卡: {new Date(user.last_checkin).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {userStats.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无用户数据</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-4">
      <AdminNotifications />
    </div>
  );

  const renderAnnouncementsTab = () => (
    <div className="space-y-4">
      <AnnouncementManagement />
    </div>
  );

  const renderArticlesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">文章管理</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加文章
        </Button>
      </div>
      
      <div className="text-center py-8">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-700 mb-2">文章管理功能开发中</h4>
        <p className="text-gray-500">
          即将支持添加和编辑健康科普文章功能
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold flex items-center">
            <Shield className="h-5 w-5 mr-2 text-orange-600" />
            管理员面板
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                用户管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">查看和管理用户数据</p>
              <Button 
                onClick={() => setActiveTab('users')}
                className="w-full"
                variant={activeTab === 'users' ? 'default' : 'outline'}
              >
                查看用户数据
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                系统通知
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">查看系统通知和提醒</p>
              <Button 
                onClick={() => setActiveTab('notifications')}
                className="w-full"
                variant={activeTab === 'notifications' ? 'default' : 'outline'}
              >
                查看通知
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Megaphone className="h-5 w-5 mr-2" />
                公告管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">发布和管理系统公告</p>
              <Button 
                onClick={() => setActiveTab('announcements')}
                className="w-full"
                variant={activeTab === 'announcements' ? 'default' : 'outline'}
              >
                管理公告
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                内容管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">添加和编辑科普文章</p>
              <Button 
                onClick={() => setActiveTab('articles')}
                className="w-full"
                variant={activeTab === 'articles' ? 'default' : 'outline'}
              >
                管理文章
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'announcements' && renderAnnouncementsTab()}
            {activeTab === 'articles' && renderArticlesTab()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
