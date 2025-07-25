
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { familyExpensesService, type FamilyExpense, type ExpenseStats } from '@/services/familyExpensesService';

interface FamilyExpensesProps {
  onBack: () => void;
}

const FamilyExpenses = ({ onBack }: FamilyExpensesProps) => {
  const [expenses, setExpenses] = useState<FamilyExpense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FamilyExpense | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paid_by: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExpenses();
    loadStats();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await familyExpensesService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('加载支出记录失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载支出记录",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await familyExpensesService.getExpenseStats();
      setStats(data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        paid_by: formData.paid_by
      };

      if (editingExpense) {
        await familyExpensesService.updateExpense(editingExpense.id, expenseData);
        toast({
          title: "更新成功",
          description: "支出记录已更新",
        });
      } else {
        await familyExpensesService.createExpense(expenseData);
        toast({
          title: "添加成功",
          description: "支出记录已添加",
        });
      }

      resetForm();
      loadExpenses();
      loadStats();
    } catch (error) {
      console.error('保存支出记录失败:', error);
      toast({
        title: "保存失败",
        description: "无法保存支出记录",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await familyExpensesService.deleteExpense(id);
      toast({
        title: "删除成功",
        description: "支出记录已删除",
      });
      loadExpenses();
      loadStats();
    } catch (error) {
      console.error('删除支出记录失败:', error);
      toast({
        title: "删除失败",
        description: "无法删除支出记录",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paid_by: ''
    });
    setShowAddForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: FamilyExpense) => {
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: expense.date,
      paid_by: expense.paid_by
    });
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const categories = [
    '餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '水电', '其他'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">家庭记账</h1>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            记账
          </Button>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalToday)}
                </div>
                <div className="text-sm text-gray-600">今日支出</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalThisMonth)}
                </div>
                <div className="text-sm text-gray-600">本月支出</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingExpense ? '编辑支出' : '添加支出'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">金额</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="请输入金额"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">分类</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paid_by">支付人</Label>
                  <Input
                    id="paid_by"
                    value={formData.paid_by}
                    onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
                    placeholder="请输入支付人"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">日期</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">备注</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入备注（可选）"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    {editingExpense ? '更新' : '添加'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 支出列表 */}
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-lg">{formatCurrency(expense.amount)}</span>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {expense.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>支付人: {expense.paid_by}</div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {expense.date}
                      </div>
                      {expense.description && (
                        <div>备注: {expense.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无支出记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyExpenses;
