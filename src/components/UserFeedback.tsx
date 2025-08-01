import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback, getUserFeedback, UserFeedback, CreateFeedbackData } from '@/services/feedbackService';

interface UserFeedbackProps {
  onBack: () => void;
}

const UserFeedbackComponent = ({ onBack }: UserFeedbackProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateFeedbackData>({
    feedback_type: 'suggestion',
    title: '',
    content: '',
    contact_info: ''
  });

  useEffect(() => {
    loadFeedbackList();
  }, []);

  const loadFeedbackList = async () => {
    setLoading(true);
    try {
      const feedback = await getUserFeedback();
      setFeedbackList(feedback);
    } catch (error) {
      console.error('加载反馈列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "请填写完整信息",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(formData);
      toast({
        title: "反馈提交成功",
        description: "感谢您的反馈，我们会认真考虑您的建议"
      });
      
      // 重置表单
      setFormData({
        feedback_type: 'suggestion',
        title: '',
        content: '',
        contact_info: ''
      });
      
      // 重新加载反馈列表
      loadFeedbackList();
    } catch (error) {
      toast({
        title: "提交失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewing':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'reviewing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'rejected':
        return '已拒绝';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'reviewing':
        return 'default';
      case 'completed':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getFeedbackTypeText = (type: string) => {
    switch (type) {
      case 'bug':
        return '错误报告';
      case 'suggestion':
        return '功能建议';
      case 'improvement':
        return '改进建议';
      case 'other':
        return '其他';
      default:
        return '其他';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">用户反馈</h1>
        </div>

        <Tabs defaultValue="submit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit">提交反馈</TabsTrigger>
            <TabsTrigger value="history">反馈记录</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  提交反馈
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback_type">反馈类型</Label>
                    <Select
                      value={formData.feedback_type}
                      onValueChange={(value: any) => 
                        setFormData(prev => ({ ...prev, feedback_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择反馈类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">错误报告</SelectItem>
                        <SelectItem value="suggestion">功能建议</SelectItem>
                        <SelectItem value="improvement">改进建议</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">标题</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="请简要描述您的反馈"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">详细内容</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="请详细描述您的反馈或建议..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_info">联系方式（可选）</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                      placeholder="如需回复，请留下邮箱或微信等联系方式"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? '提交中...' : '提交反馈'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>反馈记录</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : feedbackList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无反馈记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbackList.map((feedback) => (
                      <div 
                        key={feedback.id} 
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {getFeedbackTypeText(feedback.feedback_type)}
                              </Badge>
                              <Badge variant={getStatusColor(feedback.status) as any}>
                                {getStatusIcon(feedback.status)}
                                <span className="ml-1">{getStatusText(feedback.status)}</span>
                              </Badge>
                            </div>
                            <h3 className="font-medium text-gray-900">{feedback.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {feedback.content}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          提交时间：{new Date(feedback.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserFeedbackComponent;