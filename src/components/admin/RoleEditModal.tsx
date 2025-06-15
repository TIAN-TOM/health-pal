
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type UserRole = 'admin' | 'user';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface RoleEditModalProps {
  isOpen: boolean;
  user: UserWithProfile | null;
  newRole: UserRole;
  loading: boolean;
  onClose: () => void;
  onRoleChange: (role: UserRole) => void;
  onSave: () => void;
}

const RoleEditModal = ({
  isOpen,
  user,
  newRole,
  loading,
  onClose,
  onRoleChange,
  onSave
}: RoleEditModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative p-4 w-full max-w-md h-full">
        <Card className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <CardHeader className="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              编辑角色 - {user.email}
            </CardTitle>
            <Button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onClose}
              variant="ghost"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">选择角色</label>
              <Select value={newRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
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
              onClick={onSave}
              disabled={loading}
            >
              保存
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
            >
              取消
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoleEditModal;
