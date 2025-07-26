
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Phone, MapPin, Calendar, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { familyMembersService, type FamilyMember } from '@/services/familyMembersService';
import FamilyMemberForm from './FamilyMemberForm';

interface FamilyMembersProps {
  onBack: () => void;
}

const FamilyMembers = ({ onBack }: FamilyMembersProps) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await familyMembersService.getFamilyMembers();
      setMembers(data);
    } catch (error) {
      console.error('Fetch members error:', error);
      toast({
        title: "错误",
        description: "加载家庭成员失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAdded = () => {
    setShowAddForm(false);
    setEditingMember(null);
    fetchMembers();
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowAddForm(true);
  };

  const deleteMember = async (id: string) => {
    try {
      await familyMembersService.deleteFamilyMember(id);
      toast({
        title: "成功",
        description: "删除家庭成员成功",
      });
      fetchMembers();
    } catch (error) {
      console.error('Delete member error:', error);
      toast({
        title: "错误",
        description: "删除家庭成员失败",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (file: File, memberId: string) => {
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: "错误",
        description: "请选择图片文件",
        variant: "destructive",
      });
      return;
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "错误",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingAvatar(memberId);
      const avatarUrl = await familyMembersService.uploadAvatar(file, memberId);
      await familyMembersService.updateFamilyMember(memberId, { avatar_url: avatarUrl });
      
      toast({
        title: "成功",
        description: "头像上传成功",
      });
      
      fetchMembers();
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "错误",
        description: "头像上传失败",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(null);
    }
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

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return members
      .filter(member => member.birthday)
      .map(member => {
        const birthday = new Date(member.birthday!);
        const thisYearBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate());
        const nextYearBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate());
        
        const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...member,
          nextBirthday,
          daysUntil
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3);
  };

  const getAvatarDisplay = (member: FamilyMember) => {
    if (member.avatar_url) {
      // 检查是否是emoji头像
      if (member.avatar_url.length <= 4 && /\p{Emoji}/u.test(member.avatar_url)) {
        return (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {member.avatar_url}
          </div>
        );
      }
      return <AvatarImage src={member.avatar_url} />;
    }
    return <AvatarFallback className="text-lg">{getAvatarFallback(member.name)}</AvatarFallback>;
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  // 如果显示表单，渲染表单组件
  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-6">
          <FamilyMemberForm
            member={editingMember}
            onSuccess={handleMemberAdded}
            onCancel={() => {
              setShowAddForm(false);
              setEditingMember(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加成员
          </Button>
        </div>

        {/* 即将到来的生日提醒 */}
        {upcomingBirthdays.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                即将到来的生日
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBirthdays.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {getAvatarDisplay(member)}
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <Badge variant="secondary" className="text-xs">
                          {member.relationship}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-pink-600">
                        {member.daysUntil === 0 ? '今天' : `${member.daysUntil}天后`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.nextBirthday.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : members.length === 0 ? (
          // 空状态
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">暂无家庭成员</div>
              <p className="text-sm text-gray-500 mb-6">
                添加您的家庭成员，方便管理生日提醒和联系信息
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加第一个成员
              </Button>
            </CardContent>
          </Card>
        ) : (
          // 成员列表
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        {getAvatarDisplay(member)}
                      </Avatar>
                      <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors">
                        <Camera className="h-3 w-3" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAvatarUpload(file, member.id);
                            }
                          }}
                          disabled={uploadingAvatar === member.id}
                        />
                      </label>
                      {uploadingAvatar === member.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {member.relationship}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMember(member)}
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
                                <AlertDialogAction onClick={() => deleteMember(member.id)}>
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
                            <a href={`tel:${member.phone}`} className="hover:text-blue-600">
                              {member.phone}
                            </a>
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
                            <span className="truncate">{member.address}</span>
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
