
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { familyMembersService, type FamilyMember } from '@/services/familyMembersService';
import { presetAvatars, getAvatarsByCategory, getAvatarCategories, getAvatarUrl } from '@/data/avatars';
import { format } from 'date-fns';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import DateInputWithCalendar from './DateInputWithCalendar';

interface FamilyMemberFormProps {
  member?: FamilyMember | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FamilyMemberForm = ({ member, onSuccess, onCancel }: FamilyMemberFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    birthday: undefined as Date | undefined,
    address: '',
    notes: '',
    avatar_url: ''
  });

  // Avatar selection state
  const [selectedAvatarCategory, setSelectedAvatarCategory] = useState<'person' | 'animal' | 'zodiac'>('person');
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        relationship: member.relationship,
        phone: member.phone || '',
        birthday: member.birthday ? new Date(member.birthday) : undefined,
        address: member.address || '',
        notes: member.notes || '',
        avatar_url: member.avatar_url || ''
      });
    }
  }, [member]);

  const relationships = [
    { value: '父亲', label: '爸爸' },
    { value: '母亲', label: '妈妈' },
    { value: '外祖父', label: '外公' },
    { value: '外祖母', label: '外婆' },
    { value: '祖父', label: '爷爷' },
    { value: '祖母', label: '奶奶' },
    { value: '儿子', label: '孩子(儿子)' },
    { value: '女儿', label: '孩子(女儿)' },
    { value: '兄弟', label: '兄弟' },
    { value: '姐妹', label: '姐妹' },
    { value: '其他', label: '其他' }
  ];

  const handleAvatarUpload = async (file: File) => {
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
      setUploadingAvatar(true);
      const avatarUrl = await familyMembersService.uploadAvatar(file, `temp_${Date.now()}`);
      setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
      
      toast({
        title: "成功",
        description: "头像上传成功",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "错误",
        description: "头像上传失败",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePresetAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
    setShowAvatarSelection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.relationship) {
      toast({
        title: "错误",
        description: "姓名和关系为必填项",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const memberData = {
        ...formData,
        birthday: formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : undefined
      };

      if (member) {
        await familyMembersService.updateFamilyMember(member.id, memberData);
        toast({
          title: "成功",
          description: "更新家庭成员成功",
        });
      } else {
        await familyMembersService.addFamilyMember(memberData);
        toast({
          title: "成功",
          description: "添加家庭成员成功",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "错误",
        description: member ? "更新家庭成员失败" : "添加家庭成员失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarDisplay = () => {
    if (formData.avatar_url) {
      // 检查是否是emoji头像
      if (formData.avatar_url.length <= 4 && /\p{Emoji}/u.test(formData.avatar_url)) {
        return (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {formData.avatar_url}
          </div>
        );
      }
      return <AvatarImage src={formData.avatar_url} />;
    }
    return <AvatarFallback>{formData.name.charAt(0).toUpperCase()}</AvatarFallback>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {member ? '编辑成员' : '添加成员'}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 头像选择区域 */}
          <div className="space-y-4">
            <Label>头像</Label>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                {getAvatarDisplay()}
              </Avatar>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                >
                  选择预设头像
                </Button>
                
                <label className="inline-flex">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingAvatar}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-1" />
                      {uploadingAvatar ? '上传中...' : '上传头像'}
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              
              {/* 预设头像选择面板 */}
              {showAvatarSelection && (
                <Card className="w-full">
                  <CardContent className="p-4">
                    {/* 分类选择 */}
                    <div className="flex space-x-2 mb-4">
                      {getAvatarCategories().map(category => (
                        <Button
                          key={category.key}
                          type="button"
                          variant={selectedAvatarCategory === category.key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedAvatarCategory(category.key)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                    
                    {/* 头像网格 */}
                    <div className="grid grid-cols-8 gap-2">
                      {getAvatarsByCategory(selectedAvatarCategory).map(avatar => (
                        <button
                          key={avatar.id}
                          type="button"
                          className={cn(
                            "p-2 rounded-md border-2 hover:border-blue-500 transition-colors",
                            formData.avatar_url === avatar.url ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          )}
                          onClick={() => handlePresetAvatarSelect(avatar.url)}
                          title={avatar.name}
                        >
                          <div className="text-2xl">{avatar.url}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入姓名"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationship">关系 *</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择关系" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel.value} value={rel.value}>{rel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">电话号码</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="请输入电话号码"
              />
            </div>
            
            <DateInputWithCalendar
              label="生日"
              date={formData.birthday}
              onDateChange={(date) => setFormData(prev => ({ ...prev, birthday: date }))}
              placeholder="选择生日"
              className="space-y-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">地址</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="请输入地址"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="请输入备注信息"
              rows={3}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : (member ? '更新' : '添加')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FamilyMemberForm;
