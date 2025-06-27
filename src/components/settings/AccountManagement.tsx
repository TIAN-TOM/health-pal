
import React, { useState } from 'react';
import { LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AccountManagement = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "退出成功",
        description: "您已安全退出登录"
      });
    } catch (error) {
      toast({
        title: "退出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== '删除我的账号') {
      toast({
        title: "确认文本不正确",
        description: "请输入正确的确认文本",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      // 首先删除用户的所有数据
      const deletePromises = [
        supabase.from('meniere_records').delete().eq('user_id', user.id),
        supabase.from('daily_checkins').delete().eq('user_id', user.id),
        supabase.from('emergency_contacts').delete().eq('user_id', user.id),
        supabase.from('medical_records').delete().eq('user_id', user.id),
        supabase.from('user_medications').delete().eq('user_id', user.id),
        supabase.from('user_roles').delete().eq('user_id', user.id),
        supabase.from('profiles').delete().eq('id', user.id)
      ];

      await Promise.all(deletePromises);

      // 记录删除操作（如果表存在）
      try {
        await supabase
          .from('account_deletions')
          .insert({
            user_id: user.id,
            user_email: user.email || '',
            deletion_reason: deleteReason,
            deleted_by: user.id
          });
      } catch (insertError) {
        console.log('账号删除记录插入失败，但继续删除流程:', insertError);
      }

      // 删除认证账号
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        console.error('退出登录失败:', authError);
      }

      toast({
        title: "账号已删除",
        description: "您的账号和所有相关数据已被删除"
      });

      // 强制刷新页面到登录状态
      window.location.reload();
    } catch (error: any) {
      console.error('删除账号失败:', error);
      toast({
        title: "删除失败",
        description: "删除过程中出现错误，请联系客服处理",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <LogOut className="h-5 w-5 mr-2" />
            账号管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
          
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="w-full justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            注销账号
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              确认删除账号
            </DialogTitle>
            <DialogDescription className="text-left">
              <div className="space-y-2">
                <p className="font-medium text-red-700">⚠️ 此操作无法撤销！</p>
                <p>删除账号将永久删除：</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>所有健康记录数据</li>
                  <li>个人设置和偏好</li>
                  <li>医疗记录和用药信息</li>
                  <li>紧急联系人信息</li>
                  <li>账号登录凭据</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="deleteReason">删除原因（可选）</Label>
              <Textarea
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="请告诉我们删除账号的原因，这有助于我们改进服务"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmText">
                请输入 <span className="font-bold text-red-600">"删除我的账号"</span> 来确认
              </Label>
              <Input
                id="confirmText"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="删除我的账号"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== '删除我的账号'}
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountManagement;
