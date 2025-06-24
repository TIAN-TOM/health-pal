import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ExternalLink, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { saveMedicationRecord } from '@/services/meniereRecordService';
import { Medication, getMedications } from '@/services/medicationsService';
import { getBeijingTime } from '@/utils/beijingTime';

interface MedicationRecordProps {
  onBack: () => void;
  onNavigateToMedicationManagement?: () => void;
}

const MedicationRecord = ({ onBack, onNavigateToMedicationManagement }: MedicationRecordProps) => {
  const [medications, setMedications] = useState<string[]>([]);
  const [dosage, setDosage] = useState<string>('');
  const [note, setNote] = useState('');
  const [medicationTime, setMedicationTime] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [effectiveness, setEffectiveness] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMedications, setUserMedications] = useState<Medication[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [quickDosageOpen, setQuickDosageOpen] = useState(false);
  const [effectivenessOpen, setEffectivenessOpen] = useState(false);
  const [sideEffectsOpen, setSideEffectsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserMedications();
    // 默认设置当前时间
    const currentTime = getBeijingTime();
    const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM 格式
    setMedicationTime(timeString);
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
      // 构建详细的用药记录
      const detailedNote = [
        note.trim(),
        medicationTime ? `用药时间: ${medicationTime}` : '',
        effectiveness ? `药效评价: ${effectiveness}` : '',
        sideEffects ? `副作用记录: ${sideEffects}` : ''
      ].filter(Boolean).join('\n');

      await saveMedicationRecord({
        medications,
        dosage,
        manualInput: detailedNote || undefined
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

        <div className="space-y-4">
          {/* 提示信息 */}
          {userMedications.length === 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          )}

          {userMedications.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          )}

          {/* 药物选择 */}
          {userMedications.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-700">
                    选择药物 (可多选)
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* 用药时间 - 删除当前北京时间显示 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-700 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    用药时间
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="time"
                    value={medicationTime}
                    onChange={(e) => setMedicationTime(e.target.value)}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* 快速剂量选择 */}
              <Collapsible open={quickDosageOpen} onOpenChange={setQuickDosageOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50">
                      <CardTitle className="text-lg text-gray-700 flex items-center justify-between">
                        用药剂量
                        <span className="text-sm text-gray-500">
                          {quickDosageOpen ? '收起' : '展开'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
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
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* 药效评价 */}
              <Collapsible open={effectivenessOpen} onOpenChange={setEffectivenessOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50">
                      <CardTitle className="text-lg text-gray-700 flex items-center justify-between">
                        <span className="flex items-center">
                          <Check className="h-5 w-5 mr-2" />
                          药效评价 (可选)
                        </span>
                        <span className="text-sm text-gray-500">
                          {effectivenessOpen ? '收起' : '展开'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: '非常有效', color: 'bg-green-500' },
                            { value: '有效', color: 'bg-blue-500' },
                            { value: '一般', color: 'bg-yellow-500' },
                            { value: '效果不明显', color: 'bg-orange-500' },
                            { value: '无效', color: 'bg-red-500' }
                          ].map(option => (
                            <Button
                              key={option.value}
                              onClick={() => setEffectiveness(option.value)}
                              variant={effectiveness === option.value ? "default" : "outline"}
                              className={`text-sm ${
                                effectiveness === option.value 
                                  ? `${option.color} hover:opacity-90 text-white` 
                                  : 'hover:border-gray-400'
                              }`}
                            >
                              {option.value}
                            </Button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="详细描述药效情况..."
                          value={effectiveness.includes('非常有效') || effectiveness.includes('有效') || effectiveness.includes('一般') || effectiveness.includes('效果不明显') || effectiveness.includes('无效') ? '' : effectiveness}
                          onChange={(e) => setEffectiveness(e.target.value)}
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* 副作用记录 */}
              <Collapsible open={sideEffectsOpen} onOpenChange={setSideEffectsOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50">
                      <CardTitle className="text-lg text-gray-700 flex items-center justify-between">
                        <span className="flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          副作用记录 (可选)
                        </span>
                        <span className="text-sm text-gray-500">
                          {sideEffectsOpen ? '收起' : '展开'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            '无副作用',
                            '轻微头晕',
                            '恶心',
                            '困倦',
                            '食欲不振',
                            '其他'
                          ].map(option => (
                            <Button
                              key={option}
                              onClick={() => setSideEffects(option === '无副作用' ? option : (sideEffects === option ? '' : option))}
                              variant={sideEffects === option ? "default" : "outline"}
                              size="sm"
                              className={sideEffects === option ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="详细描述副作用情况..."
                          value={sideEffects === '无副作用' || sideEffects === '轻微头晕' || sideEffects === '恶心' || sideEffects === '困倦' || sideEffects === '食欲不振' ? '' : sideEffects}
                          onChange={(e) => setSideEffects(e.target.value)}
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* 详细说明 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-700">
                    详细说明 (可选)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="可以记录服药后感受、注意事项等相关信息..."
                    className="w-full"
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* 温馨提示 */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <p className="text-sm text-yellow-800">
                    💡 温馨提示：请严格按照医生处方用药，如有疑问请及时咨询医生
                  </p>
                </CardContent>
              </Card>

              {/* 保存按钮 */}
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xl py-6 rounded-lg"
              >
                {isLoading ? '保存中...' : '保存记录'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationRecord;
