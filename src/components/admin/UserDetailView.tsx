
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type UserRole = 'admin' | 'user';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface CheckinRecord {
  id: string;
  checkin_date: string;
  mood_score: number;
  note: string | null;
  created_at: string;
}

interface UserDetailViewProps {
  user: UserWithProfile;
  checkins: CheckinRecord[];
  onBack: () => void;
}

const UserDetailView = ({ user, checkins, onBack }: UserDetailViewProps) => {
  const formatBeijingTime = (dateString: string) => {
    try {
      if (!dateString) {
        return '未知时间';
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '时间格式错误';
      }
      
      const beijingTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
      
      return format(beijingTime, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch (error) {
      console.error('日期格式化失败:', error, '原始日期:', dateString);
      return '时间格式错误';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-1">
              <path fillRule="evenodd" d="M9.793 3.293a1 1 0 011.414 0l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-6.293-6.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
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
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">邮箱</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">角色</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">注册时间</p>
              <p className="font-medium">{formatBeijingTime(user.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-2">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17.93A1 1 0 0112 17h-2a1 1 0 01-.93-.93l.83-.83a4 4 0 007.46 0l.83.83zM17 10a1 1 0 00-1 1h-1a1 1 0 100 2h1a1 1 0 001-1v-1zm-9 0a1 1 0 00-1 1v1a1 1 0 100 2v-1a1 1 0 001-1h1a1 1 0 100-2H8z" />
            </svg>
            梅尼埃记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">暂无梅尼埃记录</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-2">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 4.586L15.414 8A2 2 0 0116 9.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            医疗记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">暂无医疗记录</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailView;
