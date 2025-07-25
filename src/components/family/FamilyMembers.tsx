import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Upload, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { familyMembersService, type FamilyMember } from '@/services/familyMembersService';

interface FamilyMembersProps {
  onBack: () => void;
}

const FamilyMembers = ({ onBack }: FamilyMembersProps) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    birthday: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await familyMembersService.getFamilyMembers();
      setMembers(data);
    } catch (error) {
      toast({
        title: "错误",
        description: "加载家庭成员失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.relationship.trim()) {
      toast({
        title: "错误",
        description: "姓名和关系为必填项",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMember) {
        await familyMembersService.updateFamilyMember(editingMember.id, formData);
        toast({
          title: "成功",
          description: "更新家庭成员成功",
        });
      } else {
        await familyMembersService.addFamilyMember(formData);
        toast({
          title: "成功",
          description: "添加家庭成员成功",
        });
      }
      
      setShowAddDialog(false);
      setEditingMember(null);
      resetForm();
      loadMembers();
    } catch (error) {
      toast({
        title: "错误",
        description: editingMember ? "更新家庭成员失败" : "添加家庭成员失败",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await familyMembersService.deleteFamilyMember(id);
      toast({
        title: "成功",
        description: "删除家庭成员成功",
      });
      loadMembers();
    } catch (error) {
      toast({
        title: "错误",
        description: "删除家庭成员失败",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      relationship: member.relationship,
      phone: member.phone || '',
      birthday: member.birthday || '',
      address: member.address || '',
      notes: member.notes || ''
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      birthday: '',
      address: '',
      notes: ''
    });
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setEditingMember(null);
    resetForm();
  };

  const getAvatarFallback = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const RELATIONSHIPS = [
    '父亲', '母亲', '儿子', '女儿', '丈夫', '妻子', 
    '兄弟', '姐妹', '祖父', '祖母', '外祖父', '外祖母',
    '叔叔', '阿姨', '其他'
  ];

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
          <h1 className="text-xl font-bold text-gray-800">家庭成员</h1>
          <Dialog open={showAddDialog} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? '编辑成员' : '添加成员'}</DialogTitle>
                <DialogDescription>
                  {editingMember ? '修改家庭成员信息' : '添加新的家庭成员'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入姓名"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship">关系 *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择关系" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((rel) => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="请输入手机号"
                  />
                </div>
                
                <div>
                  <Label htmlFor="birthday">生日</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">地址</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="请输入地址"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">备注</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="请输入备注信息"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    取消
                  </Button>
                  <Button type="submit">
                    {editingMember ? '更新' : '添加'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 成员列表 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : members.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">暂无家庭成员</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    添加第一个成员
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {getAvatarFallback(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.relationship}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除成员 "{member.name}" 吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(member.id)}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                        
                        {member.birthday && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {member.birthday}
                            {calculateAge(member.birthday) && (
                              <span className="ml-2 text-gray-500">
                                ({calculateAge(member.birthday)}岁)
                              </span>
                            )}
                          </div>
                        )}
                        
                        {member.address && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {member.address}
                          </div>
                        )}
                        
                        {member.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            {member.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyMembers;