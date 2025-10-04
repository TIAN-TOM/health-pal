
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Award, Star, Package, Trophy, BookOpen, Calendar, History } from 'lucide-react';
import { getStoreItems, getUserPurchases, purchaseItem, canPurchaseItem, type StoreItem } from '@/services/pointsStoreService';
import { getEffectiveUserPoints } from '@/services/pointsService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MyPurchases from './MyPurchases';

const PointsStore = () => {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole } = useAuth();

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [items, points] = await Promise.all([
        getStoreItems(),
        getEffectiveUserPoints()
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
    // 检查购买条件
    const { canPurchase, reason } = await canPurchaseItem(item);
    
    if (!canPurchase) {
      toast({
        title: "无法购买",
        description: reason,
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
          description: `成功购买 ${item.item_name}，道具效果已激活`,
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

  const getItemIcon = (type: string, itemName: string) => {
    if (itemName.includes('皮肤')) return '🎨';
    if (itemName.includes('补签卡')) return <Calendar className="h-5 w-5" />;
    if (itemName.includes('徽章')) return <Trophy className="h-5 w-5" />;
    if (itemName.includes('英语') || itemName.includes('学习')) return <BookOpen className="h-5 w-5" />;
    
    switch (type) {
      case 'game_skin': return '🎨';
      case 'makeup_card': return <Calendar className="h-5 w-5" />;
      case 'virtual_badge': return <Trophy className="h-5 w-5" />;
      case 'unlock_feature': return '🔓';
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getItemTypeText = (type: string) => {
    switch (type) {
      case 'game_skin': return '游戏皮肤';
      case 'makeup_card': return '功能道具';
      case 'virtual_badge': return '虚拟徽章';
      case 'unlock_feature': return '功能解锁';
      default: return '商品';
    }
  };

  const getItemEffectDescription = (itemName: string) => {
    if (itemName.includes('五子棋经典皮肤')) return '为五子棋游戏启用经典木质纹理棋盘';
    if (itemName.includes('补签卡')) return '可以补签过去错过的打卡日期，保持连续打卡记录';
    if (itemName.includes('打卡达人徽章')) return '专属徽章，彰显您的打卡毅力';
    if (itemName.includes('呼吸练习增强版')) return '解锁更多呼吸练习模式和个性化设置';
    if (itemName.includes('英语学习进阶')) return '解锁高难度英语学习内容和专属练习模式';
    return '为您带来更好的应用体验';
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-yellow-600" />
            积分商城
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="store" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="store" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              商城
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              我的已购
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="store" className="flex-1 overflow-y-auto mt-4 space-y-4">
            {/* 用户积分显示 */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2" />
                    <span className="font-medium">我的积分</span>
                    {isAdmin && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        管理员
                      </Badge>
                    )}
                  </div>
                  <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                    {isAdmin ? '∞' : userPoints}
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
                          <span className="text-2xl mr-2">
                            {typeof getItemIcon(item.item_type, item.item_name) === 'string' 
                              ? getItemIcon(item.item_type, item.item_name)
                              : <div className="text-primary">{getItemIcon(item.item_type, item.item_name)}</div>
                            }
                          </span>
                          <div>
                            <h3 className="font-medium">{item.item_name}</h3>
                            <p className="text-xs text-muted-foreground">{getItemTypeText(item.item_type)}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.item_description || getItemEffectDescription(item.item_name)}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-bold text-yellow-600 dark:text-yellow-500">{item.price_points}</span>
                            <span className="text-sm text-muted-foreground ml-1">积分</span>
                            {item.stock_quantity !== -1 && item.stock_quantity !== null && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                库存: {item.stock_quantity}
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(item)}
                            disabled={
                              purchaseLoading === item.id || 
                              (!isAdmin && userPoints < item.price_points)
                            }
                            className="bg-primary hover:bg-primary/90"
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
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">暂无商品</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="purchases" className="flex-1 overflow-y-auto mt-4">
            <MyPurchases />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PointsStore;
