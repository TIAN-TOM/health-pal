
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, Activity, TrendingUp, Mail, Phone, Shield, Ban, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminUserDetails } from '@/hooks/useAdminUserDetails';
import { format } from 'date-fns';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  auth_id: string;
}

interface EnhancedUserDetailViewProps {
  user: UserWithProfile;
  onBack: () => void;
}

const EnhancedUserDetailView = ({ user, onBack }: EnhancedUserDetailViewProps) => {
  const { loading, getUserDetailedInfo, resetUserPassword, suspendUser } = useAdminUserDetails();
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    loadUserDetails();
  }, [user.id]);

  const loadUserDetails = async () => {
    const details = await getUserDetailedInfo(user.id);
    setUserDetails(details);
  };

  const handleResetPassword = async () => {
    if (confirm(`确定要为用户 ${user.email} 重置密码吗？`)) {
      await resetUserPassword(user.id, user.email);
    }
  };

  const handleSuspendUser = async () => {
    if (confirm(`确定要暂停用户 ${user.email} 的账号吗？`)) {
      await suspendUser(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载用户详情中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回用户列表
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">用户详情</h1>
          <div className="w-20"></div>
        </div>

        {/* 用户基本信息卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-6 w-6 mr-2" />
                {user.full_name || '未设置姓名'}
              </div>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">邮箱地址</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">注册时间</p>
                <p className="font-medium">{format(new Date(user.created_at), 'yyyy-MM-dd HH:mm')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">最后更新</p>
                <p className="font-medium">{format(new Date(user.updated_at), 'yyyy-MM-dd HH:mm')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 管理员操作 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              管理员操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleResetPassword} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                重置密码
              </Button>
              <Button onClick={handleSuspendUser} variant="destructive">
                <Ban className="h-4 w-4 mr-2" />
                暂停账号
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                发送邮件
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 详细信息标签页 */}
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">数据统计</TabsTrigger>
            <TabsTrigger value="checkins">打卡记录</TabsTrigger>
            <TabsTrigger value="preferences">偏好设置</TabsTrigger>
            <TabsTrigger value="activity">活动日志</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {userDetails?.stats?.symptomRecords || 0}
                    </p>
                    <p className="text-sm text-gray-600">症状记录</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {userDetails?.stats?.lifestyleRecords || 0}
                    </p>
                    <p className="text-sm text-gray-600">生活记录</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {userDetails?.stats?.totalCheckins || 0}
                    </p>
                    <p className="text-sm text-gray-600">总打卡数</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {userDetails?.stats?.medicationRecords || 0}
                    </p>
                    <p className="text-sm text-gray-600">用药记录</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checkins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  最近打卡记录
                  <Badge variant="outline">
                    共 {userDetails?.checkins?.length || 0} 条记录
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userDetails?.checkins?.length > 0 ? (
                  <div className="space-y-3">
                     {userDetails.checkins.slice(0, 10).map((checkin: any) => (
                       <div key={checkin.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 hover:shadow-md transition-shadow">
                         <div className="flex items-start justify-between">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-2">
                               <Calendar className="h-4 w-4 text-green-600" />
                               <p className="font-semibold text-gray-800">
                                 {format(new Date(checkin.checkin_date), 'yyyy年MM月dd日')}
                               </p>
                               <Badge variant="secondary" className="text-xs">
                                 {format(new Date(checkin.created_at), 'HH:mm')} 打卡
                               </Badge>
                             </div>
                             
                             {checkin.mood_score && (
                               <div className="flex items-center gap-2 mb-2">
                                 <span className="text-sm text-gray-600">心情评分:</span>
                                 <div className="flex items-center">
                                   {Array.from({ length: 5 }).map((_, i) => (
                                     <span key={i} className={`text-lg ${i < checkin.mood_score ? 'text-yellow-400' : 'text-gray-300'}`}>
                                       ⭐
                                     </span>
                                   ))}
                                   <span className="ml-2 text-sm font-medium text-blue-600">
                                     {checkin.mood_score}/5
                                   </span>
                                 </div>
                               </div>
                             )}
                             
                             {checkin.note && checkin.note.trim() ? (
                               <div className="mt-3 p-3 bg-white rounded-md border border-green-200 shadow-sm">
                                 <div className="flex items-center gap-2 mb-2">
                                   <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">今日感想</span>
                                 </div>
                                 <p className="text-sm text-gray-700 leading-relaxed">"{checkin.note}"</p>
                               </div>
                             ) : (
                               <p className="text-xs text-gray-400 italic mt-2">该用户当日未填写感想</p>
                             )}
                             
                             {checkin.photo_url && (
                               <div className="mt-2">
                                 <p className="text-xs text-blue-600">📷 包含照片</p>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">该用户暂无打卡记录</p>
                    <p className="text-gray-400 text-sm mt-2">用户开始使用打卡功能后，记录将显示在这里</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>用户偏好设置</CardTitle>
              </CardHeader>
              <CardContent>
                {userDetails?.preferences ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">性别</p>
                      <p className="font-medium">
                        {userDetails.preferences.gender === 'male' ? '男' : 
                         userDetails.preferences.gender === 'female' ? '女' : 
                         userDetails.preferences.gender === 'other' ? '其他' : 
                         userDetails.preferences.gender === 'prefer_not_to_say' ? '不便透露' : '未设置'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">年龄</p>
                      <p className="font-medium">{userDetails.preferences.age || '未设置'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">身高</p>
                      <p className="font-medium">{userDetails.preferences.height ? `${userDetails.preferences.height}cm` : '未设置'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">体重</p>
                      <p className="font-medium">{userDetails.preferences.weight ? `${userDetails.preferences.weight}kg` : '未设置'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">紧急联系人</p>
                      <p className="font-medium">{userDetails.preferences.emergency_contact_name || '未设置'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">紧急联系电话</p>
                      <p className="font-medium">{userDetails.preferences.emergency_contact_phone || '未设置'}</p>
                    </div>
                    {userDetails.preferences.medical_history?.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 mb-2">病史</p>
                        <div className="flex flex-wrap gap-2">
                          {userDetails.preferences.medical_history.map((history: string, index: number) => (
                            <Badge key={index} variant="secondary">{history}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {userDetails.preferences.allergies?.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 mb-2">过敏史</p>
                        <div className="flex flex-wrap gap-2">
                          {userDetails.preferences.allergies.map((allergy: string, index: number) => (
                            <Badge key={index} variant="destructive">{allergy}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">用户尚未设置偏好信息</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>活动日志</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">活动日志功能开发中...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedUserDetailView;
