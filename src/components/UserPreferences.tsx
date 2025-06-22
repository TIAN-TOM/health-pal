
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Heart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface UserPreferencesProps {
  onBack: () => void;
}

const UserPreferences = ({ onBack }: UserPreferencesProps) => {
  const { preferences, loading, savePreferences } = useUserPreferences();
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    medical_history: [] as string[],
    allergies: [] as string[],
    emergency_contact_name: '',
    emergency_contact_phone: '',
    preferred_language: 'zh-CN',
    timezone: 'Asia/Shanghai'
  });
  const [newMedicalHistory, setNewMedicalHistory] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        gender: preferences.gender || '',
        age: preferences.age?.toString() || '',
        height: preferences.height?.toString() || '',
        weight: preferences.weight?.toString() || '',
        medical_history: preferences.medical_history || [],
        allergies: preferences.allergies || [],
        emergency_contact_name: preferences.emergency_contact_name || '',
        emergency_contact_phone: preferences.emergency_contact_phone || '',
        preferred_language: preferences.preferred_language || 'zh-CN',
        timezone: preferences.timezone || 'Asia/Shanghai'
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsLoading(true);
    const success = await savePreferences({
      gender: formData.gender as any,
      age: formData.age ? parseInt(formData.age) : undefined,
      height: formData.height ? parseInt(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      medical_history: formData.medical_history,
      allergies: formData.allergies,
      emergency_contact_name: formData.emergency_contact_name || undefined,
      emergency_contact_phone: formData.emergency_contact_phone || undefined,
      preferred_language: formData.preferred_language,
      timezone: formData.timezone
    });
    
    if (success) {
      onBack();
    }
    setIsLoading(false);
  };

  const addMedicalHistory = () => {
    if (newMedicalHistory.trim() && !formData.medical_history.includes(newMedicalHistory.trim())) {
      setFormData(prev => ({
        ...prev,
        medical_history: [...prev.medical_history, newMedicalHistory.trim()]
      }));
      setNewMedicalHistory('');
    }
  };

  const removeMedicalHistory = (item: string) => {
    setFormData(prev => ({
      ...prev,
      medical_history: prev.medical_history.filter(h => h !== item)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (item: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== item)
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">个人偏好设置</h1>
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
                <Label htmlFor="gender">性别</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                    <SelectItem value="prefer_not_to_say">不便透露</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age">年龄</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="150"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="请输入年龄"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">身高 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="50"
                    max="250"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="身高"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">体重 (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="体重"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 医疗信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                医疗信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>病史</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newMedicalHistory}
                    onChange={(e) => setNewMedicalHistory(e.target.value)}
                    placeholder="添加病史"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicalHistory())}
                  />
                  <Button type="button" onClick={addMedicalHistory} variant="outline">
                    添加
                  </Button>
                </div>
                {formData.medical_history.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.medical_history.map((item) => (
                      <Badge key={item} variant="secondary" className="cursor-pointer" onClick={() => removeMedicalHistory(item)}>
                        {item} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>过敏史</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="添加过敏源"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <Button type="button" onClick={addAllergy} variant="outline">
                    添加
                  </Button>
                </div>
                {formData.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map((item) => (
                      <Badge key={item} variant="destructive" className="cursor-pointer" onClick={() => removeAllergy(item)}>
                        {item} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 紧急联系人 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                紧急联系人
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergency_contact_name">联系人姓名</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  placeholder="紧急联系人姓名"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">联系人电话</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  placeholder="紧急联系人电话"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
