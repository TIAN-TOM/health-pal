
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminUpdateUserPoints, getPointsTransactions, type PointsTransaction } from '@/services/pointsService';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Coins, Plus, Minus, History, Search } from 'lucide-react';

const AdminPointsManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [operation, setOperation] = useState<'grant' | 'deduct'>('grant');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const { users } = useUserManagement();

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handlePointsUpdate = async () => {
    if (!selectedUserId || !pointsAmount) {
      toast({
        title: "请填写完整信息",
        description: "请选择用户并输入积分数量",
        variant: "destructive"
      });
      return;
    }

    const amount = parseInt(pointsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "积分数量无效",
        description: "请输入大于0的整数",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const finalAmount = operation === 'grant' ? amount : -amount;
      const transactionType = operation === 'grant' ? 'admin_grant' : 'admin_deduct';
      
      const success = await adminUpdateUserPoints(
        selectedUserId,
        finalAmount,
        transactionType,
        description || `管理员${operation === 'grant' ? '赠送' : '扣除'}积分`
      );

      if (success) {
        toast({
          title: "积分更新成功",
          description: `已${operation === 'grant' ? '赠送' : '扣除'} ${amount} 积分给用户 ${selectedUser?.email}`
        });
        
        // 清空表单
        setPointsAmount('');
        setDescription('');
        
        // 如果正在查看历史记录，刷新数据
        if (showHistory) {
          loadTransactions();
        }
      } else {
        throw new Error('积分更新失败');
      }
    } catch (error) {
      console.error('更新积分失败:', error);
      toast({
        title: "更新失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!selectedUserId) return;
    
    try {
      const data = await getPointsTransactions(selectedUserId);
      setTransactions(data);
    } catch (error) {
      console.error('加载交易记录失败:', error);
    }
  };

  useEffect(() => {
    if (showHistory && selectedUserId) {
      loadTransactions();
    }
  }, [showHistory, selectedUserId]);

  const formatTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'checkin': '每日打卡',
      'purchase': '购买商品',
      'admin_grant': '管理员赠送',
      'admin_deduct': '管理员扣除',
      'reward': '系统奖励'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 积分管理操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="h-5 w-5 mr-2 text-yellow-600" />
            积分管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>选择用户</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择用户" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>操作类型</Label>
              <Select value={operation} onValueChange={(value: 'grant' | 'deduct') => setOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grant">
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-green-600" />
                      赠送积分
                    </div>
                  </SelectItem>
                  <SelectItem value="deduct">
                    <div className="flex items-center">
                      <Minus className="h-4 w-4 mr-2 text-red-600" />
                      扣除积分
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>积分数量</Label>
            <Input
              type="number"
              min="1"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              placeholder="请输入积分数量"
            />
          </div>

          <div className="space-y-2">
            <Label>备注说明</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入操作原因（可选）"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePointsUpdate}
              disabled={loading || !selectedUserId || !pointsAmount}
              className={operation === 'grant' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading ? '处理中...' : (operation === 'grant' ? '赠送积分' : '扣除积分')}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              disabled={!selectedUserId}
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? '隐藏' : '查看'}历史记录
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 积分交易历史 */}
      {showHistory && selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              {selectedUser.full_name || selectedUser.email} 的积分记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无积分交易记录</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-sm">
                          {formatTransactionType(transaction.transaction_type)}
                        </span>
                        <span className={`ml-2 text-lg font-bold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-xs text-gray-600">{transaction.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPointsManagement;
