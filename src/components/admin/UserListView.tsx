
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeInfo, Edit, Trash2 } from 'lucide-react';

type UserRole = 'admin' | 'user';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface UserListViewProps {
  users: UserWithProfile[];
  loading: boolean;
  searchQuery: string;
  selectedRole: string;
  onSearch: (query: string) => void;
  onRoleSelect: (role: string) => void;
  onViewUser: (user: UserWithProfile) => void;
  onEditRole: (user: UserWithProfile) => void;
  onDeleteUser: (user: UserWithProfile) => void;
  onRefresh: () => void;
}

const UserListView = ({
  users,
  loading,
  searchQuery,
  selectedRole,
  onSearch,
  onRoleSelect,
  onViewUser,
  onEditRole,
  onDeleteUser,
  onRefresh
}: UserListViewProps) => {
  const formatBeijingTime = (dateString: string) => {
    try {
      if (!dateString) {
        return '未知时间';
      }
      
      // 直接创建Date对象，然后转换为北京时间显示
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '时间格式错误';
      }
      
      // 使用toLocaleString直接获取北京时间
      const beijingTimeString = date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      return beijingTimeString.replace(/\//g, '年').replace(/,/, '日 ') + '分';
    } catch (error) {
      console.error('日期格式化失败:', error, '原始日期:', dateString);
      return '时间格式错误';
    }
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = selectedRole === 'all' ? true : user.role === selectedRole;
    return searchMatch && roleMatch;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">用户管理</h2>
        <Button onClick={onRefresh} variant="outline">
          刷新用户列表
        </Button>
      </div>

      <div className="flex space-x-4">
        <Input
          type="search"
          placeholder="搜索用户邮箱或姓名..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Select value={selectedRole} onValueChange={onRoleSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="所有角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有角色</SelectItem>
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
                    onClick={() => onViewUser(user)}
                  >
                    <BadgeInfo className="h-4 w-4 mr-2" />
                    查看详情
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditRole(user)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    编辑角色
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteUser(user)}
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

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          {users.length === 0 ? '暂无用户数据' : '没有找到匹配的用户'}
        </div>
      )}
    </div>
  );
};

export default UserListView;
