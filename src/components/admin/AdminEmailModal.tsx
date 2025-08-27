import React, { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AdminEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  onSend: (subject: string, message: string) => Promise<boolean>;
  loading: boolean;
}

const AdminEmailModal = ({ 
  isOpen, 
  onClose, 
  userEmail, 
  userName, 
  onSend, 
  loading 
}: AdminEmailModalProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      return;
    }

    const success = await onSend(subject, message);
    if (success) {
      setSubject('');
      setMessage('');
      onClose();
    }
  };

  const handleClose = () => {
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Mail className="h-6 w-6 mr-2 text-blue-600" />
            发送邮件给用户
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 收件人信息 */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">收件人</p>
                <p className="font-semibold text-gray-900">
                  {userName || '未设置姓名'} ({userEmail})
                </p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          {/* 邮件主题 */}
          <div className="space-y-2">
            <Label htmlFor="email-subject" className="text-sm font-medium">
              邮件主题 *
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="请输入邮件主题..."
              maxLength={100}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              {subject.length}/100 字符
            </p>
          </div>

          {/* 邮件内容 */}
          <div className="space-y-2">
            <Label htmlFor="email-message" className="text-sm font-medium">
              邮件内容 *
            </Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="请输入邮件内容..."
              rows={8}
              maxLength={2000}
              className="w-full resize-none"
            />
            <p className="text-xs text-gray-500">
              {message.length}/2000 字符
            </p>
          </div>

          {/* 温馨提示 */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>温馨提示：</strong>
              请确保邮件内容专业、礼貌。邮件将以系统管理员身份发送，用户无法直接回复。
            </p>
          </div>

          {/* 按钮区域 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !subject.trim() || !message.trim()}
              className="flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? '发送中...' : '发送邮件'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEmailModal;