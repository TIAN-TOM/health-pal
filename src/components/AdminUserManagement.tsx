
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Mail, BadgeInfo, Edit, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'profiles'>;

interface UserWithProfile extends UserProfile {
  email: string;
  id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRole, setNewRole] = useState('');
  const { toast } = useToast();
  const [userCheckins, setUserCheckins] = useState<{ [userId: string]: any[] }>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      const userIDs = usersData.users.map(user => user.id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIDs);

      if (profilesError) throw profilesError;

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const usersWithProfile = usersData.users.map(user => {
        const profile = profilesMap.get(user.id) || {};
        return {
          id: user.id,
          email: user.email || 'N/A',
          full_name: profile.full_name || '未设置',
          role: user.app_metadata?.role || 'user',
          created_at: user.created_at,
          updated_at: user.updated_at,
          ...profile,
        };
      });

      setUsers(usersWithProfile);
    } catch (error: any) {
      toast({
        title: "加载用户失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserCheckins = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setUserCheckins(prev => ({ ...prev, [userId]: data || [] }));
    } catch (error: any) {
      console.error('加载用户打卡记录失败:', error);
      toast({
        title: "加载打卡记录失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = selectedRole ? user.role === selectedRole : true;
    return searchMatch && roleMatch;
  });

  const handleEditRole = (user: UserWithProfile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditingRole(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.admin.updateUserById(selectedUser.id, {
        app_metadata: { role: newRole }
      });

      if (error) throw error;

      // Optimistically update the user's role in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "角色更新成功",
        description: `用户 ${selectedUser.email} 的角色已更新为 ${newRole}`
      });
    } catch (error: any) {
      toast({
        title: "角色更新失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsEditingRole(false);
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: UserWithProfile) => {
    if (!confirm(`确定要删除用户 ${user.email} 吗？`)) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) throw error;

      // Optimistically update the user list
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));

      toast({
        title: "删除用户成功",
        description: `用户 ${user.email} 已被删除`
      });
    } catch (error: any) {
      toast({
        title: "删除用户失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user: UserWithProfile) => {
    setSelectedUser(user);
    setCurrentView('detail');
    
    // 同时加载用户的打卡记录
    await loadUserCheckins(user.id);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  const formatBeijingTime = (dateString: string) => {
    const date = new Date(dateString + '+08:00');
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (currentView === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">用户管理</h2>
        </div>

        <div className="flex space-x-4">
          <Input
            type="search"
            placeholder="搜索用户邮箱或姓名..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <Select value={selectedRole} onValueChange={handleRoleSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="所有角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">所有角色</SelectItem>
              <SelectItem value="user">普通用户</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{user.full_name}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-gray-500">角色: {user.role}</p>
                    <p className="text-gray-500">
                      注册时间: {formatBeijingTime(user.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewUser(user)}
                    >
                      <BadgeInfo className="h-4 w-4 mr-2" />
                      查看详情
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditRole(user)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      编辑角色
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isEditingRole && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-4 w-full max-w-md h-full">
              <Card className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <CardHeader className="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    编辑角色 - {selectedUser.email}
                  </CardTitle>
                  <Button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setIsEditingRole(false)}
                    variant="ghost"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">选择角色</label>
                    <Select value={newRole} onValueChange={(value) => setNewRole(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">普通用户</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                  <Button
                    onClick={handleSaveRole}
                    disabled={loading}
                  >
                    保存
                  </Button>
                  <Button
                    onClick={() => setIsEditingRole(false)}
                    variant="ghost"
                  >
                    取消
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'detail' && selectedUser) {
    const checkins = userCheckins[selectedUser.id] || [];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            <Button variant="ghost" size="sm" onClick={handleBackToList} className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-1"><path fillRule="evenodd" d="M9.793 3.293a1 1 0 011.414 0l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-6.293-6.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              返回
            </Button>
            用户详情
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-gray-600 text-sm">姓名</p>
                <p className="font-medium">{selectedUser.full_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">邮箱</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">角色</p>
                <p className="font-medium">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">注册时间</p>
                <p className="font-medium">{formatBeijingTime(selectedUser.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 打卡记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              打卡记录 (最近30天)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkins.length > 0 ? (
              <div className="space-y-3">
                {checkins.map((checkin) => (
                  <div key={checkin.id} className="border-l-4 border-l-green-500 pl-4 py-2 bg-green-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {checkin.checkin_date} - 心情评分: {checkin.mood_score}/5
                        </p>
                        {checkin.note && (
                          <p className="text-sm text-gray-600 mt-1">备注: {checkin.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatBeijingTime(checkin.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无打卡记录</p>
            )}
          </CardContent>
        </Card>

        {/* 梅尼埃记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-2"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17.93A1 1 0 0112 17h-2a1 1 0 01-.93-.93l.83-.83a4 4 0 007.46 0l.83.83zM17 10a1 1 0 00-1 1h-1a1 1 0 100 2h1a1 1 0 001-1v-1zm-9 0a1 1 0 00-1 1v1a1 1 0 100 2v-1a1 1 0 001-1h1a1 1 0 100-2H8z" /></svg>
              梅尼埃记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-4">暂无梅尼埃记录</p>
          </CardContent>
        </Card>

        {/* 医疗记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-2"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 4.586L15.414 8A2 2 0 0116 9.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
              医疗记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-4">暂无医疗记录</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AdminUserManagement;
