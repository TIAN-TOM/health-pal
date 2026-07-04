import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Package, Search, Filter, Star, Trophy, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUserPurchasesWithPagination, type UserPurchase } from '@/services/pointsStoreService';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const MyPurchases = () => {
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<UserPurchase | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadPurchases();
  }, [currentPage, statusFilter]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const { data, count } = await getUserPurchasesWithPagination(
        currentPage,
        pageSize,
        statusFilter === 'all' ? undefined : statusFilter === 'active'
      );
      setPurchases(data);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('加载购买记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (itemType: string, itemName: string) => {
    if (itemName?.includes('皮肤')) return '🎨';
    if (itemName?.includes('补签卡')) return <Calendar className="h-5 w-5" />;
    if (itemName?.includes('徽章')) return <Trophy className="h-5 w-5" />;
    if (itemName?.includes('英语') || itemName?.includes('学习')) return <BookOpen className="h-5 w-5" />;
    
    switch (itemType) {
      case 'game_skin': return '🎨';
      case 'makeup_card': return <Calendar className="h-5 w-5" />;
      case 'virtual_badge': return <Trophy className="h-5 w-5" />;
      case 'unlock_feature': return '🔓';
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const itemName = purchase.points_store_items?.item_name || '';
    return itemName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索商品名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部订单</SelectItem>
            <SelectItem value="active">生效中</SelectItem>
            <SelectItem value="inactive">已失效</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 购买记录列表 */}
      {filteredPurchases.length === 0 ? (
        <EmptyState
          icon={Package}
          title="暂无购买记录"
          description="去商城逛逛，用积分换点实用好物吧"
        />
      ) : (
        <>
          <div className="space-y-3">
            {filteredPurchases.map((purchase) => (
              <Card 
                key={purchase.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPurchase(purchase)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 商品图标 */}
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {typeof getItemIcon(purchase.points_store_items?.item_type || '', purchase.points_store_items?.item_name || '') === 'string' 
                          ? getItemIcon(purchase.points_store_items?.item_type || '', purchase.points_store_items?.item_name || '')
                          : <div className="text-primary">{getItemIcon(purchase.points_store_items?.item_type || '', purchase.points_store_items?.item_name || '')}</div>
                        }
                      </span>
                    </div>

                    {/* 商品信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {purchase.points_store_items?.item_name || '未知商品'}
                        </h3>
                        <Badge variant={purchase.is_active ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                          {purchase.is_active ? '生效中' : '已失效'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="font-medium text-yellow-600">{purchase.points_spent}</span>
                          <span className="ml-1">积分</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(purchase.purchased_at), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    上一页
                  </Button>
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // 只显示当前页附近的页码
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <PaginationItem key={page}>...</PaginationItem>;
                  }
                  return null;
                })}

                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* 订单详情对话框 */}
      <Dialog open={!!selectedPurchase} onOpenChange={(open) => !open && setSelectedPurchase(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-16 h-16 bg-background rounded-lg flex items-center justify-center">
                  <span className="text-3xl">
                    {typeof getItemIcon(selectedPurchase.points_store_items?.item_type || '', selectedPurchase.points_store_items?.item_name || '') === 'string' 
                      ? getItemIcon(selectedPurchase.points_store_items?.item_type || '', selectedPurchase.points_store_items?.item_name || '')
                      : <div className="text-primary">{getItemIcon(selectedPurchase.points_store_items?.item_type || '', selectedPurchase.points_store_items?.item_name || '')}</div>
                    }
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">
                    {selectedPurchase.points_store_items?.item_name}
                  </h3>
                  <Badge variant={selectedPurchase.is_active ? 'default' : 'secondary'} className="mt-1">
                    {selectedPurchase.is_active ? '生效中' : '已失效'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">商品描述</span>
                  <span className="text-right max-w-[60%]">
                    {selectedPurchase.points_store_items?.item_description || '暂无描述'}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">消耗积分</span>
                  <span className="font-medium text-yellow-600">
                    {selectedPurchase.points_spent} 积分
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">购买时间</span>
                  <span>
                    {format(new Date(selectedPurchase.purchased_at), 'yyyy年M月d日 HH:mm:ss', { locale: zhCN })}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">订单编号</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedPurchase.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPurchases;
