import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAllFeedbackWithProfiles,
  updateFeedbackStatus as updateFeedbackStatusService,
  type AdminFeedback,
} from '@/services/feedbackService';

const AdminFeedbackManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedbackList = [], isPending, isError, refetch } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: getAllFeedbackWithProfiles,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateFeedbackStatusService(id, status),
    onSuccess: (_data, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast({
        title: "状态更新成功",
        description: `反馈状态已更新为${getStatusText(status)}`
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: "destructive"
      });
    },
  });

  const updateFeedbackStatus = (feedbackId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: feedbackId, status: newStatus });
  };

  const getFeedbackTypeText = (type: string) => {
    switch (type) {
      case 'bug': return '错误报告';
      case 'suggestion': return '功能建议';
      case 'complaint': return '投诉';
      case 'other': return '其他';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'in_progress': return '处理中';
      case 'resolved': return '已解决';
      case 'closed': return '已关闭';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'resolved': return 'success';
      case 'closed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'in_progress': return <AlertCircle className="h-3 w-3" />;
      case 'resolved': return <CheckCircle className="h-3 w-3" />;
      case 'closed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredFeedback = feedbackList.filter(feedback => {
    const statusMatch = selectedStatus === 'all' || feedback.status === selectedStatus;
    const typeMatch = selectedType === 'all' || feedback.feedback_type === selectedType;
    return statusMatch && typeMatch;
  });

  const getStats = () => {
    const total = feedbackList.length;
    const pending = feedbackList.filter(f => f.status === 'pending').length;
    const inProgress = feedbackList.filter(f => f.status === 'in_progress').length;
    const resolved = feedbackList.filter(f => f.status === 'resolved').length;
    return { total, pending, inProgress, resolved };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            用户反馈管理
          </h2>
          <p className="text-sm text-gray-600">管理和处理用户反馈</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">总反馈数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">待处理</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">处理中</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">已解决</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">状态:</span>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="in_progress">处理中</SelectItem>
              <SelectItem value="resolved">已解决</SelectItem>
              <SelectItem value="closed">已关闭</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">类型:</span>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="bug">错误报告</SelectItem>
              <SelectItem value="suggestion">功能建议</SelectItem>
              <SelectItem value="complaint">投诉</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 反馈列表 */}
      <Card>
        <CardHeader>
          <CardTitle>反馈列表 ({filteredFeedback.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8 space-y-3" role="alert">
              <p className="text-gray-600">反馈加载失败，请检查网络后重试</p>
              <Button variant="outline" onClick={() => refetch()}>
                重新加载
              </Button>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              暂无符合条件的反馈
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="border rounded-lg p-4 space-y-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">
                          {getFeedbackTypeText(feedback.feedback_type)}
                        </Badge>
                        <Badge variant={getStatusColor(feedback.status) as any}>
                          {getStatusIcon(feedback.status)}
                          <span className="ml-1">{getStatusText(feedback.status)}</span>
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900">{feedback.title}</h3>
                      <p className="text-sm text-gray-600">{feedback.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          用户: {feedback.profiles?.full_name || feedback.profiles?.email || '未知用户'}
                        </span>
                        {feedback.contact_info && (
                          <span>联系方式: {feedback.contact_info}</span>
                        )}
                        <span>
                          提交时间: {new Date(feedback.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {feedback.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFeedbackStatus(feedback.id, 'in_progress')}
                        >
                          开始处理
                        </Button>
                      )}
                      {feedback.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateFeedbackStatus(feedback.id, 'resolved')}
                        >
                          标记解决
                        </Button>
                      )}
                      {feedback.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateFeedbackStatus(feedback.id, 'closed')}
                        >
                          关闭
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedbackManagement;