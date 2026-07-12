
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Heart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { updateProfileName } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface PersonalProfileProps {
  onBack: () => void;
}

const PersonalProfile = ({ onBack }: PersonalProfileProps) => {
  const { userProfile, user } = useAuth();
  const { preferences, loading: preferencesLoading, isError, savePreferences, refetch } = useUserPreferences();
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  // 偏好设置状态
  const [formData, setFormData] = useState({
    birthday: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [familyMedicalHistoryInput, setFamilyMedicalHistoryInput] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (preferences) {
      setFormData({
        birthday: preferences.birthday || '',
        gender: preferences.gender || '',
        height: preferences.height?.toString() || '',
        weight: preferences.weight?.toString() || '',
      });
      setMedicalHistoryInput(preferences.medical_history?.join(', ') || '');
      setAllergiesInput(preferences.allergies?.join(', ') || '');
      setFamilyMedicalHistoryInput(preferences.family_medical_history?.join(', ') || '');
      
      // 计算年龄
      if (preferences.birthday) {
        const age = calculateAge(preferences.birthday);
        setCalculatedAge(age);
      }
    }
  }, [preferences]);

  // 计算年龄的函数
  const calculateAge = (birthday: string): number => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // 姓名走 profileService；偏好走已迁移的 hook（其内部处理成功/失败 toast）
      if (fullName.trim() !== userProfile?.full_name) {
        await updateProfileName(fullName.trim());
      }
      const updatedPreferences = {
        birthday: formData.birthday || undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        gender: formData.gender ? formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say' : undefined,
        medical_history: medicalHistoryInput ?
          medicalHistoryInput.split(',').map(item => item.trim()).filter(Boolean) : [],
        allergies: allergiesInput ?
          allergiesInput.split(',').map(item => item.trim()).filter(Boolean) : [],
        family_medical_history: familyMedicalHistoryInput ?
          familyMedicalHistoryInput.split(',').map(item => item.trim()).filter(Boolean) : []
      };
      return savePreferences(updatedPreferences);
    },
    onSuccess: (ok) => {
      // savePreferences 成功时 hook 已 toast；此处刷新以更新 AuthContext 的 userProfile
      if (ok) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    },
    onError: (error) => {
      // 仅当姓名更新（updateProfileName）抛错时到达；偏好失败已由 hook 提示
      console.error('保存失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    },
  });

  const handleSave = () => {
    if (!user) return;
    saveMutation.mutate();
  };

  if (preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
          <div className="text-center py-12 space-y-4" role="alert">
            <p className="text-gray-600">加载偏好设置失败，请检查网络后重试</p>
            <Button variant="outline" onClick={() => refetch()}>
              重新加载
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">个人资料与偏好设置</h1>
          <div className="w-16"></div>
        </div>

        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">邮箱地址</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-600 mt-1">邮箱地址不可修改</p>
              </div>
              
              <div>
                <Label htmlFor="fullName">姓名</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="请输入您的姓名"
                  maxLength={50}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">出生日期</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleFieldChange('birthday', e.target.value)}
                  />
                  {calculatedAge !== null && (
                    <p className="text-xs text-gray-600 mt-1">年龄：{calculatedAge}岁</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="gender">性别</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleFieldChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                      <SelectItem value="prefer_not_to_say">不愿透露</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">身高 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="如：170"
                    value={formData.height}
                    onChange={(e) => handleFieldChange('height', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight">体重 (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="如：65.5"
                    value={formData.weight}
                    onChange={(e) => handleFieldChange('weight', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 健康信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                健康信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="medical_history">既往病史</Label>
                <Textarea
                  id="medical_history"
                  placeholder="请用逗号分隔，如：高血压，糖尿病"
                  value={medicalHistoryInput}
                  onChange={(e) => setMedicalHistoryInput(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="allergies">过敏史</Label>
                <Textarea
                  id="allergies"
                  placeholder="请用逗号分隔，如：青霉素，花粉"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="family_medical_history">家族病史</Label>
                <Textarea
                  id="family_medical_history"
                  placeholder="请用逗号分隔，如：高血压，心脏病，糖尿病"
                  value={familyMedicalHistoryInput}
                  onChange={(e) => setFamilyMedicalHistoryInput(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 系统设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                系统设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>语言: 简体中文</p>
                <p>时区: 北京时间 (UTC+8)</p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !fullName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? '保存中...' : '保存所有设置'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalProfile;
