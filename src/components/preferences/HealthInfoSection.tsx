
import React from 'react';
import { Heart } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface HealthInfoSectionProps {
  medicalHistoryInput: string;
  allergiesInput: string;
  onMedicalHistoryChange: (value: string) => void;
  onAllergiesChange: (value: string) => void;
}

const HealthInfoSection = ({ 
  medicalHistoryInput, 
  allergiesInput, 
  onMedicalHistoryChange, 
  onAllergiesChange 
}: HealthInfoSectionProps) => {
  return (
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
          onChange={(e) => onMedicalHistoryChange(e.target.value)}
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="allergies">过敏史</Label>
        <Textarea
          id="allergies"
          placeholder="请用逗号分隔，如：青霉素，花粉"
          value={allergiesInput}
          onChange={(e) => onAllergiesChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default HealthInfoSection;
