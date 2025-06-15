
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Plus, Trash2, Pill, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Contact, saveContact, getContacts, updateContact, deleteContact } from '@/services/contactsService';
import { Medication, saveMedication, getMedications, deleteMedication } from '@/services/medicationsService';

interface SettingsProps {
  onBack: () => void;
}

const Settings = ({ onBack }: SettingsProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactAvatar, setNewContactAvatar] = useState('👤');
  const [newMedication, setNewMedication] = useState('');
  const [newMedicationFrequency, setNewMedicationFrequency] = useState('daily');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // 头像选项
  const avatarOptions = ['👤', '👵', '👴', '👨', '👩', '🧑', '👦', '👧', '👶', '🤱'];

  // 服药频率选项
  const frequencyOptions = [
    { value: 'daily', label: '每天一次' },
    { value: 'twice_daily', label: '每天两次' },
    { value: 'three_times_daily', label: '每天三次' },
    { value: 'as_needed', label: '按需服用' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [contactsData, medicationsData] = await Promise.all([
        getContacts(),
        getMedications()
      ]);
      setContacts(contactsData);
      setMedications(medicationsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async () => {
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

    try {
      const newContact = await saveContact({
        name: newContactName,
        phone: newContactPhone,
        avatar: newContactAvatar
      });

      setContacts([...contacts, newContact]);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactAvatar('👤');
      
      toast({
        title: "添加成功",
        description: "紧急联系人已添加",
      });
    } catch (error) {
      console.error('添加联系人失败:', error);
      toast({
        title: "添加失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const removeContact = async (contact: Contact) => {
    if (!contact.id) return;

    try {
      await deleteContact(contact.id);
      setContacts(contacts.filter(c => c.id !== contact.id));
      toast({
        title: "删除成功",
        description: "联系人已删除",
      });
    } catch (error) {
      console.error('删除联系人失败:', error);
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const updateContactAvatar = async (contact: Contact, newAvatar: string) => {
    if (!contact.id) return;

    try {
      const updated = await updateContact(contact.id, { avatar: newAvatar });
      setContacts(contacts.map(c => c.id === contact.id ? updated : c));
      setEditingContact(null);
      
      toast({
        title: "更新成功",
        description: "头像已更新",
      });
    } catch (error) {
      console.error('更新头像失败:', error);
      toast({
        title: "更新失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const addMedication = async () => {
    if (!newMedication) {
      toast({
        title: "请输入药物名称",
        variant: "destructive"
      });
      return;
    }

    if (medications.some(m => m.name === newMedication)) {
      toast({
        title: "药物已存在",
        variant: "destructive"
      });
      return;
    }

    try {
      const newMed = await saveMedication({
        name: newMedication,
        frequency: newMedicationFrequency
      });

      setMedications([...medications, newMed]);
      setNewMedication('');
      setNewMedicationFrequency('daily');
      
      toast({
        title: "添加成功",
        description: "常用药物已添加",
      });
    } catch (error) {
      console.error('添加药物失败:', error);
      toast({
        title: "添加失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const removeMedication = async (medication: Medication) => {
    if (!medication.id) return;

    try {
      await deleteMedication(medication.id);
      setMedications(medications.filter(m => m.id !== medication.id));
      toast({
        title: "删除成功",
        description: "药物已删除",
      });
    } catch (error) {
      console.error('删除药物失败:', error);
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option ? option.label : frequency;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

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
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <span className="text-2xl cursor-pointer" onClick={() => setEditingContact(contact)}>
                        {contact.avatar}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingContact(contact)}
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeContact(contact)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* 头像编辑弹窗 */}
            {editingContact && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                  <h3 className="text-lg font-medium mb-4">选择头像</h3>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => updateContactAvatar(editingContact, avatar)}
                        className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-50 ${
                          editingContact.avatar === avatar 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setEditingContact(null)}
                    variant="outline"
                    className="w-full"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}

            {/* 添加新联系人 */}
            {contacts.length < 3 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-gray-700">添加新联系人</h4>
                
                {/* 头像选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择头像</label>
                  <div className="grid grid-cols-5 gap-2">
                    {avatarOptions.slice(0, 5).map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setNewContactAvatar(avatar)}
                        className={`text-xl p-2 rounded border-2 hover:bg-gray-50 ${
                          newContactAvatar === avatar 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

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
              {medications.map((medication) => (
                <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-sm text-gray-600">{getFrequencyLabel(medication.frequency)}</div>
                  </div>
                  <Button
                    onClick={() => removeMedication(medication)}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">服药频率</label>
                <div className="grid gap-2">
                  {frequencyOptions.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setNewMedicationFrequency(option.value)}
                      variant={newMedicationFrequency === option.value ? "default" : "outline"}
                      className={`justify-start ${
                        newMedicationFrequency === option.value 
                          ? 'bg-purple-500 hover:bg-purple-600' 
                          : 'hover:border-purple-300'
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
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
              <li>• 点击联系人头像旁的编辑按钮可更换头像</li>
              <li>• 所有设置会自动同步到云端</li>
              <li>• 建议让家人帮助初次设置</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
