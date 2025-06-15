
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, Hospital, User, FileText, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MedicalRecord, getMedicalRecords, saveMedicalRecord, deleteMedicalRecord } from '@/services/medicalRecordsService';

interface MedicalRecordsProps {
  onBack: () => void;
}

const MedicalRecords = ({ onBack }: MedicalRecordsProps) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({
    record_type: 'visit',
    date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await getMedicalRecords();
      setRecords(data);
    } catch (error) {
      console.error('加载医疗记录失败:', error);
      toast({
        title: "加载失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.date) {
      toast({
        title: "请选择日期",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveMedicalRecord(formData as Omit<MedicalRecord, 'id'>);
      await loadRecords();
      setShowAddForm(false);
      setFormData({
        record_type: 'visit',
        date: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "保存成功",
        description: "医疗记录已保存",
      });
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: "保存失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicalRecord(id);
      await loadRecords();
      toast({
        title: "删除成功",
        description: "医疗记录已删除",
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'visit': return '就诊记录';
      case 'diagnosis': return '诊断结果';
      case 'prescription': return '处方记录';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">加载中...</div>
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

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              医疗记录管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-6"
            >
              <Plus className="mr-2 h-5 w-5" />
              添加医疗记录
            </Button>

            {showAddForm && (
              <Card className="mb-6">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">记录类型</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'visit', label: '就诊记录' },
                        { value: 'diagnosis', label: '诊断结果' },
                        { value: 'prescription', label: '处方记录' }
                      ].map(type => (
                        <Button
                          key={type.value}
                          onClick={() => setFormData({ ...formData, record_type: type.value as any })}
                          variant={formData.record_type === type.value ? "default" : "outline"}
                          className="text-sm"
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        日期
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="text-lg py-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Hospital className="inline h-4 w-4 mr-1" />
                        医院
                      </label>
                      <Input
                        placeholder="如：人民医院"
                        value={formData.hospital || ''}
                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        className="text-lg py-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        医生
                      </label>
                      <Input
                        placeholder="如：张医生"
                        value={formData.doctor || ''}
                        onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                        className="text-lg py-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">科室</label>
                      <Input
                        placeholder="如：耳鼻喉科"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="text-lg py-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">诊断结果</label>
                    <Textarea
                      placeholder="医生的诊断结果..."
                      value={formData.diagnosis || ''}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="text-lg"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">症状描述</label>
                    <Textarea
                      placeholder="当时的症状..."
                      value={formData.symptoms || ''}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      className="text-lg"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                    <Textarea
                      placeholder="其他注意事项..."
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="text-lg"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">下次预约日期</label>
                    <Input
                      type="date"
                      value={formData.next_appointment || ''}
                      onChange={(e) => setFormData({ ...formData, next_appointment: e.target.value })}
                      className="text-lg py-3"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      保存记录
                    </Button>
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">历史记录</h3>
              {records.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  还没有医疗记录，点击上方按钮添加
                </div>
              ) : (
                records.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {getRecordTypeLabel(record.record_type)}
                          </span>
                          <div className="text-lg font-medium mt-1">{record.date}</div>
                        </div>
                        <Button
                          onClick={() => handleDelete(record.id!)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {record.hospital && (
                        <div className="text-gray-700 mb-2">
                          <Hospital className="inline h-4 w-4 mr-1" />
                          {record.hospital} {record.department && `- ${record.department}`}
                        </div>
                      )}
                      
                      {record.doctor && (
                        <div className="text-gray-700 mb-2">
                          <User className="inline h-4 w-4 mr-1" />
                          {record.doctor}
                        </div>
                      )}
                      
                      {record.diagnosis && (
                        <div className="text-gray-700 mb-2">
                          <FileText className="inline h-4 w-4 mr-1" />
                          诊断：{record.diagnosis}
                        </div>
                      )}
                      
                      {record.symptoms && (
                        <div className="text-gray-700 mb-2">
                          症状：{record.symptoms}
                        </div>
                      )}
                      
                      {record.notes && (
                        <div className="text-gray-700 mb-2">
                          备注：{record.notes}
                        </div>
                      )}
                      
                      {record.next_appointment && (
                        <div className="text-orange-600 font-medium">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          下次预约：{record.next_appointment}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalRecords;
