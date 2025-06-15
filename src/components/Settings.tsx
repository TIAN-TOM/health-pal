
import React, { useState } from 'react';
import { ArrowLeft, Phone, Plus, Trash2, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  onBack: () => void;
}

interface Contact {
  name: string;
  phone: string;
  avatar: string;
}

const Settings = ({ onBack }: SettingsProps) => {
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '老伴', phone: '138****8888', avatar: '👵' },
    { name: '儿子', phone: '139****9999', avatar: '👨' },
    { name: '女儿', phone: '136****6666', avatar: '👩' }
  ]);
  
  const [medications, setMedications] = useState<string[]>([
    '倍他司汀', '地西泮', '异丙嗪', '利尿剂', '维生素B'
  ]);
  
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const { toast } = useToast();

  const addContact = () => {
    if (!newContactName || !newContactPhone) {
      toast({
        title: "请填写完整信息",
        description: "请输入联系人姓名和电话",
        variant: "destructive"
      });
      return;
    }

    if (contacts.length >= 3) {
      toast({
        title: "联系人已满",
        description: "最多只能添加3个紧急联系人",
        variant: "destructive"
      });
      return;
    }

    const newContact: Contact = {
      name: newContactName,
      phone: newContactPhone,
      avatar: '👤'
    };

    setContacts([...contacts, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    
    toast({
      title: "添加成功",
      description: "紧急联系人已添加",
    });
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    toast({
      title: "删除成功",
      description: "联系人已删除",
    });
  };

  const addMedication = () => {
    if (!newMedication) {
      toast({
        title: "请输入药物名称",
        variant: "destructive"
      });
      return;
    }

    if (medications.includes(newMedication)) {
      toast({
        title: "药物已存在",
        variant: "destructive"
      });
      return;
    }

    setMedications([...medications, newMedication]);
    setNewMedication('');
    
    toast({
      title: "添加成功",
      description: "常用药物已添加",
    });
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    toast({
      title: "删除成功",
      description: "药物已删除",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
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

      <div className="max-w-md mx-auto space-y-6">
        {/* 紧急联系人设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              紧急联系人设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 现有联系人列表 */}
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{contact.avatar}</span>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeContact(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* 添加新联系人 */}
            {contacts.length < 3 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-gray-700">添加新联系人</h4>
                <Input
                  placeholder="联系人姓名"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="text-lg py-3"
                />
                <Input
                  placeholder="手机号码"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="text-lg py-3"
                />
                <Button
                  onClick={addContact}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加联系人
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 常用药物设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <Pill className="mr-2 h-5 w-5" />
              常用药物设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 现有药物列表 */}
            <div className="space-y-2">
              {medications.map((medication, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{medication}</span>
                  <Button
                    onClick={() => removeMedication(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* 添加新药物 */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-gray-700">添加新药物</h4>
              <Input
                placeholder="药物名称"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                className="text-lg py-3"
              />
              <Button
                onClick={addMedication}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加药物
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium text-gray-800 mb-3">💡 设置说明</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 紧急联系人将显示在紧急模式中，方便一键拨打</li>
              <li>• 常用药物将出现在用药记录页面中</li>
              <li>• 所有设置会自动保存</li>
              <li>• 建议让家人帮助初次设置</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
