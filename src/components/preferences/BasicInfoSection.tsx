
import React from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoSectionProps {
  formData: {
    age: string;
    gender: string;
    height: string;
    weight: string;
  };
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection = ({ formData, onChange }: BasicInfoSectionProps) => {
  return (
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
            onChange={(e) => onChange('age', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="gender">性别</Label>
          <Select value={formData.gender} onValueChange={(value) => onChange('gender', value)}>
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
            onChange={(e) => onChange('height', e.target.value)}
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
            onChange={(e) => onChange('weight', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
