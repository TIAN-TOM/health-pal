
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Award, Star, Package } from 'lucide-react';
import { getStoreItems, getUserPurchases, purchaseItem, type StoreItem } from '@/services/pointsStoreService';
import { getUserPoints, type UserPoints } from '@/services/pointsService';
import { useToast } from '@/hooks/use-toast';

const PointsStore = () => {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [items, points] = await Promise.all([
        getStoreItems(),
        getUserPoints()
      ]);
      
      setStoreItems(items);
      setUserPoints(points);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!userPoints || userPoints.total_points < item.price_points) {
      toast({
        title: "积分不足",
        description: `需要 ${item.price_points} 积分，当前只有 ${userPoints?.total_points || 0} 积分`,
        variant: "destructive",
      });
      return;
    }

    setPurchaseLoading(item.id);
    
    try {
      const success = await purchaseItem(item.id, item.price_points);
      
      if (success) {
        toast({
          title: "购买成功！",
          description: `成功购买 ${item.item_name}`,
        });
        
        // 重新加载数据
        await loadData();
      } else {
        toast({
          title: "购买失败",
          description: "请稍后重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('购买失败:', error);
      toast({
        title: "购买失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setPurchaseLoading(null);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'game_skin': return '🎨';
      case 'game_power': return '⚡';
      case 'virtual_badge': return '🏆';
      case 'unlock_feature': return '🔓';
      default: return '📦';
    }
  };

  const getItemTypeText = (type: string) => {
    switch (type) {
      case 'game_skin': return '游戏皮肤';
      case 'game_power': return '游戏道具';
      case 'virtual_badge': return '虚拟徽章';
      case 'unlock_feature': return '功能解锁';
      default: return '商品';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
          <ShoppingCart className="h-4 w-4 mr-2" />
          积分商城
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-yellow-600" />
            积分商城
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 用户积分显示 */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium">我的积分</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">
                  {userPoints?.total_points || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 商品列表 */}
          <div className="space-y-3">
            {storeItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{item.icon_url || getItemTypeIcon(item.item_type)}</span>
                        <div>
                          <h3 className="font-medium text-gray-800">{item.item_name}</h3>
                          <p className="text-xs text-gray-500">{getItemTypeText(item.item_type)}</p>
                        </div>
                      </div>
                      
                      {item.item_description && (
                        <p className="text-sm text-gray-600 mb-3">{item.item_description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-bold text-yellow-600">{item.price_points}</span>
                          <span className="text-sm text-gray-500 ml-1">积分</span>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(item)}
                          disabled={
                            purchaseLoading === item.id || 
                            !userPoints || 
                            userPoints.total_points < item.price_points
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {purchaseLoading === item.id ? '购买中...' : '购买'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {storeItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无商品</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PointsStore;
