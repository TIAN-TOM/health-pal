
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminEducationManagement from '@/components/AdminEducationManagement';
import AdminNotifications from '@/components/AdminNotifications';
import AnnouncementManagement from '@/components/AnnouncementManagement';
import EnglishContentManagement from '@/components/admin/EnglishContentManagement';
import AdminPointsManagement from '@/components/admin/AdminPointsManagement';
import AdminFeedbackManagement from '@/components/admin/AdminFeedbackManagement';
import { ArrowLeft, Users, BookOpen, Bell, Megaphone, Globe, Coins, MessageSquare } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">访问受限</h2>
              <p className="text-gray-600">您没有管理员权限</p>
              <Button onClick={onBack} className="mt-4">
                返回
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回主页
          </Button>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            管理员模式
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              系统管理中心
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  通知中心
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  用户管理
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  反馈管理
                </TabsTrigger>
                <TabsTrigger value="points" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  积分管理
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  教育资源
                </TabsTrigger>
                <TabsTrigger value="english" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  英语内容
                </TabsTrigger>
                <TabsTrigger value="announcements" className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  公告管理
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="mt-6">
                <AdminNotifications />
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <AdminUserManagement />
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <AdminFeedbackManagement />
              </TabsContent>

              <TabsContent value="points" className="mt-6">
                <AdminPointsManagement />
              </TabsContent>

              <TabsContent value="education" className="mt-6">
                <AdminEducationManagement />
              </TabsContent>

              <TabsContent value="english" className="mt-6">
                <EnglishContentManagement />
              </TabsContent>

              <TabsContent value="announcements" className="mt-6">
                <AnnouncementManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
