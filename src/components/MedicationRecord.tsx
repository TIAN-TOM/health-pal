
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveMedicationRecord } from '@/services/meniereRecordService';
import { Medication, getMedications } from '@/services/medicationsService';

interface MedicationRecordProps {
  onBack: () => void;
}

const MedicationRecord = ({ onBack }: MedicationRecordProps) => {
  const [medications, setMedications] = useState<string[]>([]);
  const [dosage, setDosage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMedications, setUserMedications] = useState<Medication[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserMedications();
  }, []);

  const loadUserMedications = async () => {
    try {
      const medsData = await getMedications();
      setUserMedications(medsData);
    } catch (error) {
      console.error('加载药物失败:', error);
      // 如果加载失败，使用默认药物
      setUserMedications([
        { name: '倍他司汀', frequency: 'daily' },
        { name: '地西泮', frequency: 'as_needed' },
        { name: '异丙嗪', frequency: 'as_needed' },
        { name: '利尿剂', frequency: 'daily' },
        { name: '维生素B', frequency: 'daily' }
      ]);
    } finally {
      setLoadingMeds(false);
    }
  };

  const toggleMedication = (medication: string) => {
    setMedications(prev => 
      prev.includes(medication) 
        ? prev.filter(m => m !== medication)
        : [...prev, medication]
    );
  };

  const handleSave = async () => {
    if (medications.length === 0) {
      toast({
        title: "请选择药物",
        description: "请至少选择一种药物",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveMedicationRecord({
        medications,
        dosage
      });

      toast({
        title: "记录已保存",
        description: "用药记录已成功保存到数据库",
      });

      onBack();
    } catch (error) {
      console.error('保存记录失败:', error);
      toast({
        title: "保存失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '每天一次';
      case 'twice_daily': return '每天两次';
      case 'three_times_daily': return '每天三次';
      case 'as_needed': return '按需服用';
      default: return '';
    }
  };

  if (loadingMeds) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">加载药物信息中...</div>
        </div>
      </div>
    );
  }

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
              {userMedications.length > 0 ? (
                <div className="grid gap-3">
                  {userMedications.map((medication, index) => (
                    <Button
                      key={medication.id || index}
                      onClick={() => toggleMedication(medication.name)}
                      variant={medications.includes(medication.name) ? "default" : "outline"}
                      className={`w-full py-4 text-lg ${
                        medications.includes(medication.name)
                          ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                          : 'border-2 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        {medications.includes(medication.name) && (
                          <Check className="mr-2 h-5 w-5" />
                        )}
                        <span>吃了"{medication.name}"</span>
                        <span className="text-sm opacity-75">
                          {getFrequencyLabel(medication.frequency)}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-600 mb-4">还没有设置常用药物</div>
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:border-purple-400"
                  >
                    去设置常用药物
                  </Button>
                </div>
              )}
            </div>

            {userMedications.length > 0 && (
              <>
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
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xl py-6 rounded-lg mt-8"
                >
                  {isLoading ? '保存中...' : '保存记录'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicationRecord;
