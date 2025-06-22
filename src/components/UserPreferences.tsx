
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Heart, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface UserPreferencesProps {
  onBack: () => void;
}

const UserPreferences = ({ onBack }: UserPreferencesProps) => {
  const { toast } = useToast();
  const { preferences, loading, updatePreferences } = useUserPreferences();
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    medical_history: [] as string[],
    allergies: [] as string[],
    preferred_language: 'zh-CN',
    timezone: 'Asia/Shanghai'
  });

  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        age: preferences.age?.toString() || '',
        gender: preferences.gender || '',
        height: preferences.height?.toString() || '',
        weight: preferences.weight?.toString() || '',
        medical_history: preferences.medical_history || [],
        allergies: preferences.allergies || [],
        preferred_language: preferences.preferred_language || 'zh-CN',
        timezone: preferences.timezone || 'Asia/Shanghai'
      });
      setMedicalHistoryInput(preferences.medical_history?.join(', ') || '');
      setAllergiesInput(preferences.allergies?.join(', ') || '');
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        medical_history: medicalHistoryInput ? 
          medicalHistoryInput.split(',').map(item => item.trim()).filter(Boolean) : [],
        allergies: allergiesInput ? 
          allergiesInput.split(',').map(item => item.trim()).filter(Boolean) : []
      };

      await updatePreferences(updatedData);
      
      toast({
        title: "保存成功",
        description: "个人偏好设置已更新",
      });
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: "保存失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              个人偏好设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-medium">基本信息</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">年龄</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="如：30"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender">性别</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
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
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 健康信息 */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <Heart className="h-5 w-5 mr-2 text-red-600" />
                <h3 className="text-lg font-medium">健康信息</h3>
              </div>
              
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
            </div>

            {/* 系统设置 */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <Globe className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-medium">系统设置</h3>
              </div>
              
              <div>
                <Label htmlFor="language">首选语言</Label>
                <Select value={formData.preferred_language} onValueChange={(value) => setFormData({ ...formData, preferred_language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="zh-TW">繁体中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="timezone">时区</Label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">北京时间 (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Hong_Kong">香港时间 (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Taipei">台北时间 (UTC+8)</SelectItem>
                    <SelectItem value="UTC">协调世界时 (UTC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? '保存中...' : '保存设置'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPreferences;
