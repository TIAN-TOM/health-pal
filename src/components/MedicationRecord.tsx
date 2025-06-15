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
}

const MedicationRecord = ({ onBack }: MedicationRecordProps) => {
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

  const handleAIAssistant = (aiType: 'doubao' | 'deepseek') => {
    const medications_text = medications.join('、');
    const dosage_text = dosage === 'normal' ? '正常剂量' : dosage === 'half' ? '减半剂量' : dosage === 'extra' ? '加强剂量' : '';
    
    const record_text = `我有梅尼埃症，今天服用的药物：${medications_text}，用药剂量：${dosage_text}。${note ? `详细说明：${note}` : ''}请给我一些用药建议和指导。`;
    
    if (aiType === 'doubao') {
      window.open('doubao://chat?text=' + encodeURIComponent(record_text), '_blank');
      setTimeout(() => {
        toast({
          title: "如果没有自动打开豆包APP",
          description: "请手动复制用药记录到豆包中咨询",
        });
      }, 1000);
    } else if (aiType === 'deepseek') {
      window.open('deepseek://chat?text=' + encodeURIComponent(record_text), '_blank');
      setTimeout(() => {
        toast({
          title: "如果没有自动打开DeepSeek APP",
          description: "请手动复制用药记录到DeepSeek中咨询",
        });
      }, 1000);
    }
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
                          {getFrequencyLabel(medication.frequency || 'daily')}
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

                {/* AI助手按钮 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    AI健康助手咨询
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAIAssistant('doubao')}
                      className="flex items-center justify-center border-orange-300 text-orange-600 hover:border-orange-400"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      豆包AI
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAIAssistant('deepseek')}
                      className="flex items-center justify-center border-purple-300 text-purple-600 hover:border-purple-400"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      DeepSeek
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    点击按钮跳转到对应AI应用进行健康咨询
                  </p>
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
