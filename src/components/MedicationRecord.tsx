
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveMedicationRecord } from '@/services/meniereRecordService';
import { Medication, getMedications } from '@/services/medicationsService';

interface MedicationRecordProps {
  onBack: () => void;
  onNavigateToMedicationManagement?: () => void;
}

const MedicationRecord = ({ onBack, onNavigateToMedicationManagement }: MedicationRecordProps) => {
  const [medications, setMedications] = useState<string[]>([]);
  const [dosage, setDosage] = useState<string>('');
  const [note, setNote] = useState('');
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
      const fallbackMedications: Medication[] = [
        {
          id: 'fallback-1',
          name: '倍他司汀',
          frequency: 'daily',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fallback-2',
          name: '地西泮',
          frequency: 'as_needed',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fallback-3',
          name: '异丙嗪',
          frequency: 'as_needed',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fallback-4',
          name: '利尿剂',
          frequency: 'daily',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fallback-5',
          name: '维生素B',
          frequency: 'daily',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setUserMedications(fallbackMedications);
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
        dosage,
        manualInput: note.trim() || undefined
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

  const handleGoToMedicationManagement = () => {
    if (onNavigateToMedicationManagement) {
      onNavigateToMedicationManagement();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 返回按钮 */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">记录用药情况</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              记录用药情况
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 提示信息 */}
            {userMedications.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  💡 请先添加常用药物才能进行用药记录
                </p>
                <Button
                  onClick={handleGoToMedicationManagement}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:border-purple-400"
                >
                  去设置常用药物
                </Button>
              </div>
            )}

            {userMedications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  💡 如需添加更多药物，请先到常用药物管理中设置
                </p>
                <Button
                  onClick={handleGoToMedicationManagement}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:border-blue-400"
                >
                  管理常用药物
                </Button>
              </div>
            )}

            {/* 药物选择 */}
            {userMedications.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700">
                    选择药物 (可多选)
                  </h3>
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
                            {getFrequencyLabel(medication.frequency || 'daily')}
                          </span>
                        </div>
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

                {/* 详细说明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    详细说明（可选）
                  </label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="可以记录用药时间、服药后感受、副作用等相关信息..."
                    className="w-full"
                    rows={3}
                  />
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
