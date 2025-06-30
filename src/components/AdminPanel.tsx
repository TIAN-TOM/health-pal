
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Megaphone, Users, BarChart3, Activity, Database, Settings2, BookOpen, Award } from 'lucide-react';
import AdminNotifications from '@/components/AdminNotifications';
import AnnouncementManagement from '@/components/AnnouncementManagement';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminEducationManagement from '@/components/AdminEducationManagement';
import AdminPointsManagement from './admin/AdminPointsManagement';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useUserManagement } from '@/hooks/useUserManagement';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [currentTab, setCurrentTab] = useState('stats');
  const { users, loading: usersLoading } = useUserManagement();
  const { stats, refreshStats } = useAdminStats();

  const tabs = [
    { id: 'overview', label: '系统概览', icon: BarChart3 },
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'notifications', label: '通知管理', icon: Bell },
    { id: 'announcements', label: '公告管理', icon: Megaphone },
    { id: 'education', label: '科普管理', icon: BookOpen },
    { id: 'data', label: '数据管理', icon: Database },
    { id: 'system', label: '系统设置', icon: Settings2 },
    { id: 'points', label: '积分管理', icon: Award }
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'users':
        return <AdminUserManagement />;
      case 'notifications':
        return <AdminNotifications />;
      case 'announcements':
        return <AnnouncementManagement />;
      case 'education':
        return <AdminEducationManagement />;
      case 'points':
        return <AdminPointsManagement users={users} />;
      case 'data':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  数据统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">总记录数</span>
                    <span className="font-medium text-2xl text-blue-600">
                      {stats.loading ? '--' : (stats.symptomRecords + stats.lifestyleRecords)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">症状记录</span>
                    <span className="font-medium text-xl text-red-600">
                      {stats.loading ? '--' : stats.symptomRecords}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">生活记录</span>
                    <span className="font-medium text-xl text-green-600">
                      {stats.loading ? '--' : stats.lifestyleRecords}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">今日打卡</span>
                    <span className="font-medium text-xl text-orange-600">
                      {stats.loading ? '--' : stats.todayCheckins}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>数据管理操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={refreshStats}>
                    <Database className="h-4 w-4 mr-2" />
                    刷新统计数据
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    生成报告
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    数据分析
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'system':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings2 className="h-5 w-5 mr-2" />
                  系统设置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">系统状态</span>
                    <span className="font-medium text-green-600">正常运行</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">数据库状态</span>
                    <span className="font-medium text-green-600">连接正常</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">最后维护时间</span>
                    <span className="font-medium text-gray-600">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>系统操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings2 className="h-4 w-4 mr-2" />
                    应用配置
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    系统日志
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    数据库维护
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  用户统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>总用户数</span>
                    <span className="font-medium text-2xl text-blue-600">
                      {stats.loading ? '--' : stats.totalUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>活跃用户</span>
                    <span className="font-medium text-xl text-green-600">
                      {stats.loading ? '--' : stats.activeUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>新注册用户</span>
                    <span className="font-medium text-lg text-orange-600">
                      {stats.loading ? '--' : stats.newUsers}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  数据概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>今日打卡</span>
                    <span className="font-medium text-2xl text-green-600">
                      {stats.loading ? '--' : stats.todayCheckins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>症状记录</span>
                    <span className="font-medium text-xl text-red-600">
                      {stats.loading ? '--' : stats.symptomRecords}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>生活记录</span>
                    <span className="font-medium text-lg text-blue-600">
                      {stats.loading ? '--' : stats.lifestyleRecords}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings2 className="h-5 w-5 mr-2" />
                  系统状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>服务状态</span>
                    <span className="font-medium text-green-600">正常</span>
                  </div>
                  <div className="flex justify-between">
                    <span>数据库</span>
                    <span className="font-medium text-green-600">连接</span>
                  </div>
                  <div className="flex justify-between">
                    <span>存储空间</span>
                    <span className="font-medium text-blue-600">充足</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  快速操作
                  <Button onClick={refreshStats} variant="outline" size="sm">
                    刷新数据
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => setCurrentTab('users')}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">用户管理</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => setCurrentTab('notifications')}
                  >
                    <Bell className="h-6 w-6 mb-2" />
                    <span className="text-sm">通知管理</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => setCurrentTab('announcements')}
                  >
                    <Megaphone className="h-6 w-6 mb-2" />
                    <span className="text-sm">公告管理</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => setCurrentTab('education')}
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span className="text-sm">科普管理</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => setCurrentTab('data')}
                  >
                    <Database className="h-6 w-6 mb-2" />
                    <span className="text-sm">数据管理</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 统一返回按钮位置 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">管理员面板</h1>
          <div className="w-16"></div> {/* 占位符保持居中 */}
        </div>

        {/* 标签页 */}
        <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  currentTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 内容区域 */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
