
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Megaphone, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">管理功能开发中</h3>
              <p className="text-gray-500">
                完整的管理功能正在开发中，包括用户数据查看、公告发布和文章管理等功能。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
