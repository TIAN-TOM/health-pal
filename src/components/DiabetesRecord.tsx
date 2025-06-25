
import React, { useState } from 'react';
import { ArrowLeft, Activity, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { saveDiabetesRecord } from '@/services/diabetesRecordService';
import { getBeijingTime } from '@/utils/beijingTime';

interface DiabetesRecordProps {
  onBack: () => void;
}

const DiabetesRecord = ({ onBack }: DiabetesRecordProps) => {
  const [bloodSugar, setBloodSugar] = useState('');
  const [measurementTime, setMeasurementTime] = useState('before_meal');
  const [insulinDose, setInsulinDose] = useState('');
  const [medication, setMedication] = useState('');
  const [diet, setDiet] = useState('');
  const [exercise, setExercise] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const currentTime = getBeijingTime();

  const handleSubmit = async () => {
    if (!bloodSugar) {
      toast({
        title: "请填写血糖值",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await saveDiabetesRecord({
        blood_sugar: parseFloat(bloodSugar),
        measurement_time: measurementTime,
        insulin_dose: insulinDose || undefined,
        medication: medication || undefined,
        diet: diet || undefined,
        exercise: exercise || undefined,
        note: note || undefined,
      });

      toast({
        title: "记录保存成功",
        description: "糖尿病管理记录已保存",
      });

      // 重置表单
      setBloodSugar('');
      setMeasurementTime('before_meal');
      setInsulinDose('');
      setMedication('');
      setDiet('');
      setExercise('');
      setNote('');
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
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
          <h1 className="text-xl font-bold text-gray-800">糖尿病管理记录</h1>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-red-600" />
              血糖监测
            </CardTitle>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              记录时间: {currentTime.toLocaleString('zh-CN')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodSugar">血糖值 (mmol/L) *</Label>
                <Input
                  id="bloodSugar"
                  type="number"
                  step="0.1"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  placeholder="例如: 6.5"
                />
              </div>
              <div>
                <Label htmlFor="measurementTime">测量时机</Label>
                <Select value={measurementTime} onValueChange={setMeasurementTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_meal">餐前</SelectItem>
                    <SelectItem value="after_meal">餐后</SelectItem>
                    <SelectItem value="fasting">空腹</SelectItem>
                    <SelectItem value="bedtime">睡前</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="insulinDose">胰岛素剂量 (单位)</Label>
              <Input
                id="insulinDose"
                value={insulinDose}
                onChange={(e) => setInsulinDose(e.target.value)}
                placeholder="例如: 8单位"
              />
            </div>

            <div>
              <Label htmlFor="medication">其他药物</Label>
              <Input
                id="medication"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="例如: 二甲双胍"
              />
            </div>

            <div>
              <Label htmlFor="diet">饮食记录</Label>
              <Input
                id="diet"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                placeholder="例如: 早餐-燕麦粥、鸡蛋"
              />
            </div>

            <div>
              <Label htmlFor="exercise">运动记录</Label>
              <Input
                id="exercise"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                placeholder="例如: 散步30分钟"
              />
            </div>

            <div>
              <Label htmlFor="note">备注</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录身体状况、感受等..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? '保存中...' : '保存记录'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiabetesRecord;
