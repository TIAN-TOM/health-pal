
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MedicationRecordProps {
  onBack: () => void;
}

const MedicationRecord = ({ onBack }: MedicationRecordProps) => {
  const [medications, setMedications] = useState<string[]>([]);
  const [dosage, setDosage] = useState<string>('');
  const { toast } = useToast();

  // 常用药物列表
  const commonMedications = [
    { value: 'betahistine', label: '倍他司汀' },
    { value: 'diazepam', label: '地西泮' },
    { value: 'promethazine', label: '异丙嗪' },
    { value: 'diuretic', label: '利尿剂' },
    { value: 'vitamin', label: '维生素B' }
  ];

  const toggleMedication = (medication: string) => {
    setMedications(prev => 
      prev.includes(medication) 
        ? prev.filter(m => m !== medication)
        : [...prev, medication]
    );
  };

  const handleSave = () => {
    if (medications.length === 0) {
      toast({
        title: "请选择药物",
        description: "请至少选择一种药物",
        variant: "destructive"
      });
      return;
    }

    // 保存记录到本地存储
    const record = {
      type: 'medication',
      timestamp: new Date().toISOString(),
      medications,
      dosage
    };

    const existingRecords = JSON.parse(localStorage.getItem('meniereRecords') || '[]');
    existingRecords.push(record);
    localStorage.setItem('meniereRecords', JSON.stringify(existingRecords));

    toast({
      title: "记录已保存",
      description: "用药记录已成功保存",
    });

    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      {/* 返回按钮 */}
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
              记录用药情况
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 药物选择 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                选择药物 (可多选)
              </h3>
              <div className="grid gap-3">
                {commonMedications.map(medication => (
                  <Button
                    key={medication.value}
                    onClick={() => toggleMedication(medication.value)}
                    variant={medications.includes(medication.value) ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      medications.includes(medication.value)
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'border-2 hover:border-purple-300'
                    }`}
                  >
                    {medications.includes(medication.value) && (
                      <Check className="mr-2 h-5 w-5" />
                    )}
                    吃了"{medication.label}"
                  </Button>
                ))}
              </div>
            </div>

            {/* 用药剂量 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                用药剂量
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'normal', label: '按医嘱正常剂量' },
                  { value: 'half', label: '减半剂量' },
                  { value: 'extra', label: '加强剂量' }
                ].map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setDosage(option.value)}
                    variant={dosage === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      dosage === option.value 
                        ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                        : 'border-2 hover:border-teal-300'
                    }`}
                  >
                    {dosage === option.value && (
                      <Check className="mr-2 h-5 w-5" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 温馨提示 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 温馨提示：请严格按照医生处方用药，如有疑问请及时咨询医生
              </p>
            </div>

            {/* 保存按钮 */}
            <Button
              onClick={handleSave}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xl py-6 rounded-lg mt-8"
            >
              保存记录
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicationRecord;
