
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Megaphone, Users, BarChart3 } from 'lucide-react';
import AdminNotifications from '@/components/AdminNotifications';
import AnnouncementManagement from '@/components/AnnouncementManagement';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '概览', icon: BarChart3 },
    { id: 'notifications', label: '通知管理', icon: Bell },
    { id: 'announcements', label: '公告管理', icon: Megaphone },
    { id: 'users', label: '用户管理', icon: Users }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <AdminNotifications />;
      case 'announcements':
        return <AnnouncementManagement />;
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">用户管理功能开发中...</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>系统概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>活跃用户</span>
                    <span className="font-medium">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span>今日打卡</span>
                    <span className="font-medium">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span>症状记录</span>
                    <span className="font-medium">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    查看通知
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('announcements')}
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    发布公告
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    用户管理
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* 头部 */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 ml-4">管理员面板</h1>
        </div>

        {/* 标签页 */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
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
