
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Phone, Pill, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getEmergencyContacts, saveEmergencyContact, deleteEmergencyContact } from '@/services/contactsService';
import { getUserMedications, saveMedication, deleteMedication } from '@/services/medicationsService';
import type { Tables } from '@/integrations/supabase/types';

// 使用数据库表类型
type EmergencyContact = Tables<'emergency_contacts'>;
type UserMedication = Tables<'user_medications'>;

interface SettingsProps {
  onBack: () => void;
}

const Settings = ({ onBack }: SettingsProps) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [medications, setMedications] = useState<UserMedication[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', avatar: '👤' });
  const [newMedication, setNewMedication] = useState({ name: '', frequency: 'daily' });
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const { toast } = useToast();

  const avatarOptions = ['👤', '👨', '👩', '👴', '👵', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🚑', '☎️'];

  useEffect(() => {
    loadContacts();
    loadMedications();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch (error) {
      console.error('加载联系人失败:', error);
    }
  };

  const loadMedications = async () => {
    try {
      const data = await getUserMedications();
      setMedications(data);
    } catch (error) {
      console.error('加载药物失败:', error);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "请填写完整信息",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveEmergencyContact(newContact);
      await loadContacts();
      setNewContact({ name: '', phone: '', avatar: '👤' });
      setShowAddContact(false);
      
      toast({
        title: "添加成功",
        description: "紧急联系人已保存",
      });
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: "保存失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteEmergencyContact(id);
      await loadContacts();
      toast({
        title: "删除成功",
        description: "联系人已删除",
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const handleAddMedication = async () => {
    if (!newMedication.name) {
      toast({
        title: "请输入药物名称",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveMedication(newMedication);
      await loadMedications();
      setNewMedication({ name: '', frequency: 'daily' });
      setShowAddMedication(false);
      
      toast({
        title: "添加成功",
        description: "常用药物已保存",
      });
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: "保存失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await deleteMedication(id);
      await loadMedications();
      toast({
        title: "删除成功",
        description: "药物已删除",
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
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

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              设置
            </CardTitle>
          </CardHeader>
        </Card>

        {/* 紧急联系人管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Phone className="mr-2 h-5 w-5" />
              紧急联系人管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setShowAddContact(!showAddContact)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-5 w-5" />
              添加紧急联系人
            </Button>

            {showAddContact && (
              <Card className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择头像
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {avatarOptions.map((avatar) => (
                      <Button
                        key={avatar}
                        onClick={() => setNewContact({ ...newContact, avatar })}
                        variant={newContact.avatar === avatar ? "default" : "outline"}
                        className="text-2xl p-2 h-12"
                      >
                        {avatar}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    姓名
                  </label>
                  <Input
                    placeholder="如：张医生"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="text-lg py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    电话号码
                  </label>
                  <Input
                    placeholder="如：138****8888"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="text-lg py-3"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddContact}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    保存
                  </Button>
                  <Button
                    onClick={() => setShowAddContact(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {contacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{contact.avatar}</div>
                      <div>
                        <div className="font-medium text-gray-800">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteContact(contact.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {contacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  还没有紧急联系人，点击上方按钮添加
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 常用药物管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Pill className="mr-2 h-5 w-5" />
              常用药物管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setShowAddMedication(!showAddMedication)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="mr-2 h-5 w-5" />
              添加常用药物
            </Button>

            {showAddMedication && (
              <Card className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">药物名称</label>
                  <Input
                    placeholder="如：倍他司汀"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    className="text-lg py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">服用频率</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'daily', label: '每日一次' },
                      { value: 'twice_daily', label: '每日两次' },
                      { value: 'three_times_daily', label: '每日三次' },
                      { value: 'as_needed', label: '按需服用' }
                    ].map(freq => (
                      <Button
                        key={freq.value}
                        onClick={() => setNewMedication({ ...newMedication, frequency: freq.value })}
                        variant={newMedication.frequency === freq.value ? "default" : "outline"}
                        className="text-sm"
                      >
                        {freq.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddMedication}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    保存
                  </Button>
                  <Button
                    onClick={() => setShowAddMedication(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {medications.map((medication) => (
                <Card key={medication.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{medication.name}</div>
                      <div className="text-sm text-gray-500">
                        {medication.frequency === 'daily' && '每日一次'}
                        {medication.frequency === 'twice_daily' && '每日两次'}
                        {medication.frequency === 'three_times_daily' && '每日三次'}
                        {medication.frequency === 'as_needed' && '按需服用'}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteMedication(medication.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {medications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  还没有常用药物，点击上方按钮添加
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
