
import React, { useState } from 'react';
import { MessageSquare, MapPin, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, generateEmergencyMessage, sendEmergencySMS, type LocationData } from '@/services/smsService';
import type { Contact } from '@/services/contactsService';

interface EmergencySMSProps {
  contacts: Contact[];
  userName: string;
}

const EmergencySMS = ({ contacts, userName }: EmergencySMSProps) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const { toast } = useToast();

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      setLocation(locationData);
      toast({
        title: "位置获取成功",
        description: `精度: ${Math.round(locationData.accuracy)}米`
      });
    } catch (error) {
      console.error('获取位置失败:', error);
      toast({
        title: "位置获取失败",
        description: "将发送不包含位置信息的求助短信",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSendToAll = async () => {
    if (contacts.length === 0) {
      toast({
        title: "没有紧急联系人",
        description: "请先添加紧急联系人",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    const message = generateEmergencyMessage(userName, location || undefined);
    let successCount = 0;

    try {
      for (const contact of contacts) {
        try {
          await sendEmergencySMS(contact, message, location || undefined);
          successCount++;
        } catch (error) {
          console.error(`发送给${contact.name}失败:`, error);
        }
      }

      if (successCount > 0) {
        toast({
          title: "求助信息已发送",
          description: `成功发送给 ${successCount} 位联系人`
        });
      } else {
        toast({
          title: "发送失败",
          description: "所有联系人都发送失败，请检查网络连接",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToContact = async (contact: Contact) => {
    setIsSending(true);
    const message = generateEmergencyMessage(userName, location || undefined);

    try {
      await sendEmergencySMS(contact, message, location || undefined);
      toast({
        title: "求助信息已发送",
        description: `已发送给${contact.name}`
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <MessageSquare className="h-5 w-5 mr-2" />
          一键求助短信
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 位置获取 */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm">
              {location ? '位置已获取' : '获取当前位置'}
            </span>
          </div>
          <Button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            size="sm"
            variant="outline"
          >
            {isGettingLocation ? '定位中...' : location ? '重新定位' : '获取位置'}
          </Button>
        </div>

        {location && (
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <Clock className="h-3 w-3 inline mr-1" />
            位置精度: {Math.round(location.accuracy)}米 | 
            获取时间: {new Date(location.timestamp).toLocaleTimeString('zh-CN')}
          </div>
        )}

        {/* 一键发送给所有人 */}
        <Button
          onClick={handleSendToAll}
          disabled={isSending || contacts.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? '发送中...' : `一键发送给所有联系人 (${contacts.length}人)`}
        </Button>

        {/* 单独发送 */}
        {contacts.length > 1 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 font-medium">或单独发送给：</div>
            {contacts.map((contact) => (
              <Button
                key={contact.id}
                onClick={() => handleSendToContact(contact)}
                disabled={isSending}
                variant="outline"
                className="w-full justify-start"
              >
                <span className="text-lg mr-2">{contact.avatar}</span>
                发送给 {contact.name}
              </Button>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded">
          💡 提示：点击发送后会自动打开短信应用，消息内容已预填好，您只需点击发送即可
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencySMS;
