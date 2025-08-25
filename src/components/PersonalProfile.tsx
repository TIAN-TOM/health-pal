
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Heart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface PersonalProfileProps {
  onBack: () => void;
}

const PersonalProfile = ({ onBack }: PersonalProfileProps) => {
  const { userProfile, user } = useAuth();
  const { preferences, loading: preferencesLoading, savePreferences } = useUserPreferences();
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 偏好设置状态
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (preferences) {
      setFormData({
        age: preferences.age?.toString() || '',
        gender: preferences.gender || '',
        height: preferences.height?.toString() || '',
        weight: preferences.weight?.toString() || '',
      });
      setMedicalHistoryInput(preferences.medical_history?.join(', ') || '');
      setAllergiesInput(preferences.allergies?.join(', ') || '');
    }
  }, [preferences]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // 保存个人资料
      if (fullName.trim() !== userProfile?.full_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // 保存偏好设置
      const updatedPreferences = {
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        gender: formData.gender ? formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say' : undefined,
        medical_history: medicalHistoryInput ? 
          medicalHistoryInput.split(',').map(item => item.trim()).filter(Boolean) : [],
        allergies: allergiesInput ? 
          allergiesInput.split(',').map(item => item.trim()).filter(Boolean) : []
      };

      await savePreferences(updatedPreferences);

      toast({
        title: "保存成功",
        description: "您的个人资料和偏好设置已更新"
      });

      // 刷新页面以更新用户信息
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
                <p className="text-xs text-gray-500 mt-1">邮箱地址不可修改</p>
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
                  <Label htmlFor="age">年龄</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="如：30"
                    value={formData.age}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                  />
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
            disabled={isLoading || !fullName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? '保存中...' : '保存所有设置'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalProfile;
