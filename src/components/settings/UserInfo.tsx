
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface UserInfoProps {
  userEmail?: string;
  userRole: string;
}

const UserInfo = ({ userEmail, userRole }: UserInfoProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-sm text-gray-500">
          <p>当前用户: {userEmail}</p>
          <p className="mt-1">角色: {userRole === 'admin' ? '管理员' : '普通用户'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfo;
