
import React from 'react';
import { Heart, Menu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserWelcomeProps {
  userDisplayName: string;
  userRole: 'admin' | 'user' | null;
  onSettingsClick: () => void;
}

const UserWelcome = ({ userDisplayName, userRole, onSettingsClick }: UserWelcomeProps) => {
  // 随机选择显示"欢迎回来"或"记录症状，守护健康"
  const shouldShowWelcomeBack = Math.random() > 0.5;

  return (
    <div className="text-center mb-8">
      <div className="flex justify-between items-center mb-4 min-h-[48px]">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center leading-tight">
          <Heart className="mr-2 h-6 w-6 text-blue-600 flex-shrink-0" />
          <span className="leading-normal">梅尼埃症生活伴侣</span>
        </h1>
        <div className="flex items-center space-x-2">
          {userRole === 'admin' && (
            <div className="flex items-center text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              <Shield className="h-3 w-3 mr-1" />
              管理员
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSettingsClick}
            className="text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-2 h-auto"
          >
            <Menu className="h-4 w-4 mr-1" />
            <span className="text-sm">设置</span>
          </Button>
        </div>
      </div>
      
      {shouldShowWelcomeBack ? (
        <div className="text-gray-600 text-lg leading-relaxed">
          欢迎回来，{userDisplayName}
        </div>
      ) : (
        <p className="text-gray-600 text-lg leading-relaxed">
          记录症状，守护健康
        </p>
      )}
    </div>
  );
};

export default UserWelcome;
