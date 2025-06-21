import React from 'react';
import { ArrowLeft, Settings as SettingsIcon, Shield, Phone, FileText, GraduationCap, Pill, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface SettingsProps {
  onBack: () => void;
  onAdminPanel?: () => void;
  onEmergencyContacts: () => void;
  onMedicalRecords: () => void;
  onEducation: () => void;
  onMedicationManagement: () => void;
  onProfileEdit: () => void;
}

const Settings = ({ 
  onBack, 
  onAdminPanel, 
  onEmergencyContacts, 
  onMedicalRecords, 
  onEducation,
  onMedicationManagement,
  onProfileEdit
}: SettingsProps) => {
  const { user, userRole } = useAuth();

  const handleContactDeveloper = () => {
    const email = 'tomtianys@163.com';
    const subject = '梅尼埃症生活伴侣 - 用户反馈';
    const body = '您好，我想对应用提供以下反馈：\n\n（请在此处描述您的问题或建议）';
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 返回按钮 */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">设置</h1>
        </div>

        <div className="space-y-4">
          {/* 个人设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                个人设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={onProfileEdit}
                variant="outline"
                className="w-full justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                编辑个人资料
              </Button>
            </CardContent>
          </Card>

          {/* 健康管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                健康管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={onMedicationManagement}
                variant="outline"
                className="w-full justify-start"
              >
                <Pill className="h-4 w-4 mr-2" />
                常用药物管理
              </Button>
              
              <Button
                onClick={onMedicalRecords}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                就医记录管理
              </Button>
            </CardContent>
          </Card>

          {/* 安全与联系 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                安全与联系
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={onEmergencyContacts}
                variant="outline"
                className="w-full justify-start"
              >
                <Phone className="h-4 w-4 mr-2" />
                紧急联系人管理
              </Button>
            </CardContent>
          </Card>

          {/* 学习资源 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                学习资源
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={onEducation}
                variant="outline"
                className="w-full justify-start"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                健康教育中心
              </Button>
            </CardContent>
          </Card>

          {/* 管理员功能 */}
          {userRole === 'admin' && onAdminPanel && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  管理员
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={onAdminPanel}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  管理员面板
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 联系开发者 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                反馈与支持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleContactDeveloper}
                variant="outline"
                className="w-full justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                联系开发者反馈
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                如有问题或建议，请发送邮件至 tomtianys@163.com
              </p>
            </CardContent>
          </Card>

          {/* 用户信息 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-gray-500">
                <p>当前用户: {user?.email}</p>
                <p className="mt-1">角色: {userRole === 'admin' ? '管理员' : '普通用户'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
