
import React, { useState } from 'react';
import { MessageSquare, MapPin, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, generateEmergencyMessage, openEmergencySMS, type LocationData } from '@/services/smsService';
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

    // 用单条多收件人 sms: 链接一次性唤起短信应用（连续给 location.href 赋值只会生效一次）。
    const opened = openEmergencySMS(contacts, message, location || undefined);

    if (opened) {
      toast({
        title: "已打开短信应用",
        description: `已为您预填好发送给 ${contacts.length} 位联系人的求助短信，请在短信应用中点击发送`
      });
    } else {
      toast({
        title: "无法打开短信应用",
        description: `请手动发送求助短信给：${contacts.map((c) => `${c.name} ${c.phone}`).join('、')}`,
        variant: "destructive"
      });
    }
    setIsSending(false);
  };

  const handleSendToContact = (contact: Contact) => {
    setIsSending(true);
    const message = generateEmergencyMessage(userName, location || undefined);

    const opened = openEmergencySMS([contact], message, location || undefined);

    if (opened) {
      toast({
        title: "已打开短信应用",
        description: `已为您预填好发送给${contact.name}的求助短信，请点击发送`
      });
    } else {
      toast({
        title: "无法打开短信应用",
        description: `请手动拨打或发短信给 ${contact.name}：${contact.phone}`,
        variant: "destructive"
      });
    }
    setIsSending(false);
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
          <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
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

        <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded">
          💡 提示：点击发送后会自动打开短信应用，消息内容已预填好，您只需点击发送即可
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencySMS;
