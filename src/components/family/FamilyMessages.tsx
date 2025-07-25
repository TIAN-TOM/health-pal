
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface FamilyMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface FamilyMessagesProps {
  onBack: () => void;
}

const FamilyMessages = ({ onBack }: FamilyMessagesProps) => {
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 模拟消息数据
  useEffect(() => {
    const mockMessages: FamilyMessage[] = [
      {
        id: '1',
        sender: '妈妈',
        content: '今天晚上吃什么？',
        timestamp: '2025-01-25 18:00',
        isCurrentUser: false
      },
      {
        id: '2',
        sender: '我',
        content: '做点简单的吧，西红柿鸡蛋面怎么样？',
        timestamp: '2025-01-25 18:05',
        isCurrentUser: true
      },
      {
        id: '3',
        sender: '爸爸',
        content: '听起来不错！我下班就回家',
        timestamp: '2025-01-25 18:10',
        isCurrentUser: false
      }
    ];
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const message: FamilyMessage = {
        id: Date.now().toString(),
        sender: '我',
        content: newMessage,
        timestamp: new Date().toLocaleString('zh-CN'),
        isCurrentUser: true
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      toast({
        title: "发送成功",
        description: "消息已发送",
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      toast({
        title: "发送失败",
        description: "无法发送消息",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">家庭消息</h1>
          <div className="w-16" /> {/* 占位符保持居中 */}
        </div>

        {/* 消息区域 */}
        <Card className="mb-4" style={{ height: 'calc(100vh - 200px)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
              家庭群聊
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col h-full">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {!message.isCurrentUser && (
                        <div className="text-xs font-medium mb-1 opacity-70">
                          {message.sender}
                        </div>
                      )}
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 opacity-70 ${
                        message.isCurrentUser ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 输入区域 */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="输入消息..."
                className="flex-1"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 功能说明 */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>这里是家庭成员交流的地方</p>
          <p>未来将支持实时消息推送</p>
        </div>
      </div>
    </div>
  );
};

export default FamilyMessages;
