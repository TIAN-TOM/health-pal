
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
} from '@/services/adminNotificationService';

const AdminNotifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: getAdminNotifications,
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;
  const unreadIds = notifications
    .filter(notif => !notif.is_read)
    .map(notif => notif.id);

  const markReadMutation = useMutation({
    mutationFn: markAdminNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAdminNotificationsRead(unreadIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "操作成功",
        description: "所有通知已标记为已读"
      });
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // 格式化为北京时间
  const formatBeijingTime = (dateString: string) => {
    try {
      if (!dateString) {
        return '未知时间';
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '时间格式错误';
      }
      
      return date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('日期格式化失败:', error, '原始日期:', dateString);
      return '时间格式错误';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          管理员通知
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllReadMutation.mutate()}
            variant="outline"
            size="sm"
            disabled={markAllReadMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            全部已读
          </Button>
        )}
      </div>

      {isPending ? (
        <div className="text-center py-8">
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-8 space-y-3" role="alert">
          <p className="text-gray-600">通知加载失败，请检查网络后重试</p>
          <Button variant="outline" onClick={() => refetch()}>
            重新加载
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${notification.is_read ? 'bg-gray-50' : 'bg-white border-blue-200'}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getNotificationIcon(notification.type)}
                      <h3 className={`font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatBeijingTime(notification.created_at)} (北京时间)
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReadMutation.mutate(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              暂无通知
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
