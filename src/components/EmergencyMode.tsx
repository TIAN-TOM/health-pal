
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Contact, getContacts } from '@/services/contactsService';
import { useAuth } from '@/hooks/useAuth';
import EmergencySMS from '@/components/EmergencySMS';

interface EmergencyModeProps {
  onBack: () => void;
  onNavigateToContacts?: () => void;
}

const EmergencyMode = ({ onBack, onNavigateToContacts }: EmergencyModeProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile, user } = useAuth();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const contactsData = await getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('加载联系人失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string, name: string) => {
    console.log(`正在呼叫 ${name}: ${phone}`);
    
    // 尝试直接拨打电话
    if (typeof window !== 'undefined') {
      try {
        window.location.href = `tel:${phone}`;
      } catch (error) {
        // 如果无法拨打电话，显示提示
        toast({
          title: "呼叫请求",
          description: `请手动拨打 ${name} 的电话: ${phone}`,
        });
      }
    }
  };

  const handleNavigateToContacts = () => {
    if (onNavigateToContacts) {
      onNavigateToContacts();
    } else {
      // 如果没有提供导航函数，则返回主页
      onBack();
    }
  };

  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix;
    }
    return '用户';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回
        </Button>
      </div>

      {/* 应急指南 */}
      <Card className="mb-8 bg-white shadow-lg">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center">
            <Heart className="mr-2 h-6 w-6 text-red-500" />
            紧急应对指南
          </h2>
          <div className="space-y-4 text-xl leading-relaxed">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-3xl mr-4 text-blue-600 font-bold">1.</span>
              <span className="text-gray-800">立即坐下或躺好，不要站立</span>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <span className="text-3xl mr-4 text-green-600 font-bold">2.</span>
              <span className="text-gray-800">眼睛盯着一个固定点</span>
            </div>
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-3xl mr-4 text-purple-600 font-bold">3.</span>
              <span className="text-gray-800">慢慢深呼吸，保持冷静</span>
            </div>
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <span className="text-3xl mr-4 text-yellow-600 font-bold">4.</span>
              <span className="text-gray-800">如需帮助，点击下方呼叫或发送短信</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 紧急联系人 */}
      <Card className="mb-6 bg-white shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
            呼叫家人
          </h3>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">加载联系人中...</div>
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <Button
                  key={contact.id || index}
                  onClick={() => handleCall(contact.phone, contact.name)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-6 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center justify-center">
                    <span className="text-2xl mr-3">{contact.avatar}</span>
                    <Phone className="mr-3 h-5 w-5" />
                    <div className="text-center">
                      <div>呼叫{contact.name}</div>
                      <div className="text-sm opacity-90">{contact.phone}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600 mb-4">还没有设置紧急联系人</div>
              <Button
                onClick={handleNavigateToContacts}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                去设置联系人
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 紧急短信功能 */}
      {!isLoading && contacts.length > 0 && (
        <EmergencySMS contacts={contacts} userName={getUserDisplayName()} />
      )}
    </div>
  );
};

export default EmergencyMode;
