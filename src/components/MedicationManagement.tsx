
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pill, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getMedications, saveMedication, deleteMedication } from '@/services/medicationsService';

interface MedicationManagementProps {
  onBack: () => void;
}

const MedicationManagement = ({ onBack }: MedicationManagementProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    frequency: 'daily'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const medicationsQuery = useQuery({
    queryKey: ['medications'],
    queryFn: getMedications,
  });
  const medications = medicationsQuery.data ?? [];

  const addMutation = useMutation({
    mutationFn: saveMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setNewMedication({ name: '', frequency: 'daily' });
      setShowAddForm(false);
      toast({
        title: "添加成功",
        description: "药物已添加到常用列表",
      });
    },
    onError: (error) => {
      console.error('添加失败:', error);
      toast({
        title: "添加失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast({
        title: "删除成功",
        description: "药物已从常用列表中删除",
      });
    },
    onError: (error) => {
      console.error('删除失败:', error);
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    },
  });

  const handleAdd = () => {
    if (!newMedication.name.trim()) {
      toast({
        title: "请输入药物名称",
        variant: "destructive"
      });
      return;
    }
    addMutation.mutate(newMedication);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('确定要删除这个药物吗？')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '每天一次';
      case 'twice_daily': return '每天两次';
      case 'three_times_daily': return '每天三次';
      case 'as_needed': return '按需服用';
      default: return '每天一次';
    }
  };

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

      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              常用药物管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-5 w-5" />
              添加常用药物
            </Button>

            {showAddForm && (
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      药物名称
                    </label>
                    <Input
                      value={newMedication.name}
                      onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                      placeholder="如：倍他司汀"
                      className="text-lg py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用药频率
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'daily', label: '每天一次' },
                        { value: 'twice_daily', label: '每天两次' },
                        { value: 'three_times_daily', label: '每天三次' },
                        { value: 'as_needed', label: '按需服用' }
                      ].map(option => (
                        <Button
                          key={option.value}
                          onClick={() => setNewMedication({ ...newMedication, frequency: option.value })}
                          variant={newMedication.frequency === option.value ? "default" : "outline"}
                          className="text-sm"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAdd}
                      disabled={addMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {addMutation.isPending ? '添加中...' : '保存'}
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

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-800">常用药物列表</h3>
              {medicationsQuery.isPending ? (
                <div className="text-center py-8 text-gray-600" role="status">
                  加载中...
                </div>
              ) : medicationsQuery.isError ? (
                <div className="text-center py-8 space-y-3" role="alert">
                  <p className="text-gray-600">药物列表加载失败，请检查网络后重试</p>
                  <Button variant="outline" onClick={() => medicationsQuery.refetch()}>
                    重新加载
                  </Button>
                </div>
              ) : medications.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  还没有添加常用药物
                </div>
              ) : (
                medications.map((medication) => (
                  <Card key={medication.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <Pill className="h-4 w-4 mr-2 text-purple-600" />
                            <span className="font-medium text-gray-800">{medication.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {getFrequencyLabel(medication.frequency || 'daily')}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDelete(medication.id)}
                          aria-label="删除药物"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default MedicationManagement;
