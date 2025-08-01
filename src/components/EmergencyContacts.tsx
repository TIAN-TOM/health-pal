
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Phone, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { getContacts, saveContact, deleteContact, updateContact, type Contact } from '@/services/contactsService';

interface EmergencyContactsProps {
  onBack: () => void;
}

const EmergencyContacts = ({ onBack }: EmergencyContactsProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '👤'
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('加载联系人失败:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "请填写完整信息",
        description: "姓名和电话号码不能为空",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
        toast({
          title: "更新成功",
          description: "联系人信息已更新"
        });
      } else {
        await saveContact(formData);
        toast({
          title: "添加成功",
          description: "紧急联系人已添加"
        });
      }
      
      setIsDialogOpen(false);
      setEditingContact(null);
      setFormData({ name: '', phone: '', avatar: '👤' });
      loadContacts();
    } catch (error) {
      console.error('保存联系人失败:', error);
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个联系人吗？')) {
      try {
        console.log('尝试删除联系人ID:', id);
        await deleteContact(id);
        toast({
          title: "删除成功",
          description: "联系人已删除"
        });
        // 重新加载联系人列表
        await loadContacts();
      } catch (error: any) {
        console.error('删除联系人失败:', error);
        toast({
          title: "删除失败",
          description: error.message || "请稍后重试",
          variant: "destructive"
        });
      }
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      avatar: contact.avatar || '👤'
    });
    setIsDialogOpen(true);
  };

  const callContact = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">紧急联系人</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingContact(null);
                  setFormData({ name: '', phone: '', avatar: '👤' });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle className="text-center">{editingContact ? '编辑联系人' : '添加紧急联系人'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-2">
                <div>
                  <label className="block text-sm font-medium mb-2">头像</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['👤', '👨', '👩', '👴', '👵', '👨‍⚕️', '👩‍⚕️', '👮', '👨‍🚒'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant={formData.avatar === emoji ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                        className="text-lg h-10 p-0"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">姓名</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入联系人姓名"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">电话号码</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="输入电话号码"
                    type="tel"
                    className="w-full"
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingContact ? '更新' : '添加'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {contacts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">还没有添加紧急联系人</p>
                <p className="text-sm text-gray-400 mt-2">点击右上角的"添加"按钮来添加联系人</p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact, index) => (
              <Card key={contact.id || index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{contact.avatar}</div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.phone}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => callContact(contact.phone)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
