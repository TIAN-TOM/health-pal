
import React from 'react';
import { ArrowLeft, User, Shield, LogOut, Settings2, Phone, FileText, Pill, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface SettingsProps {
  onBack: () => void;
  onAdminPanel?: () => void;
  onEmergencyContacts?: () => void;
  onMedicalRecords?: () => void;
  onEducation?: () => void;
  onMedicationManagement?: () => void;
  onProfileEdit?: () => void;
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
  const { userProfile, userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
          <h1 className="text-xl font-bold">设置</h1>
          <div className="w-16"></div> {/* 占位符保持居中 */}
        </div>

        {/* 管理员面板 */}
        {userRole === 'admin' && onAdminPanel && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings2 className="h-5 w-5 mr-2" />
                管理员功能
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={onAdminPanel}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                进入管理员面板
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 用户信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                用户信息
              </div>
              {onProfileEdit && (
                <Button
                  onClick={onProfileEdit}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  编辑
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">姓名</label>
              <p className="text-gray-900">{userProfile?.full_name || '未设置'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">邮箱</label>
              <p className="text-gray-900">{userProfile?.email || '未设置'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">用户角色</label>
              <div className="flex items-center">
                {userRole === 'admin' && (
                  <div className="flex items-center text-orange-600 bg-orange-100 px-2 py-1 rounded text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    管理员
                  </div>
                )}
                {userRole === 'user' && (
                  <span className="text-gray-600 text-sm">普通用户</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>功能管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {onEmergencyContacts && (
              <Button
                onClick={onEmergencyContacts}
                variant="outline"
                className="w-full justify-start"
              >
                <Phone className="h-4 w-4 mr-2" />
                管理紧急联系人
              </Button>
            )}
            
            {onMedicalRecords && (
              <Button
                onClick={onMedicalRecords}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                医疗记录管理
              </Button>
            )}

            {onMedicationManagement && (
              <Button
                onClick={onMedicationManagement}
                variant="outline"
                className="w-full justify-start"
              >
                <Pill className="h-4 w-4 mr-2" />
                常用药物管理
              </Button>
            )}

            {onEducation && (
              <Button
                onClick={onEducation}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                健康科普
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            梅尼埃症生活伴侣 v1.0.0
            <br />
            © 2025 专注于梅尼埃症患者的健康管理
            <br />
            开发者：
            <a 
              href="https://www.linkedin.com/in/yushun-tian-317580257/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 ml-1"
              style={{ textDecoration: 'none' }}
            >
              Yushun Tian
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
