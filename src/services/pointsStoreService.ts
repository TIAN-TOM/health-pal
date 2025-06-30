
import { supabase } from '@/integrations/supabase/client';
import { spendPoints } from '@/services/pointsService';
import type { Tables } from '@/integrations/supabase/types';

type StoreItem = Tables<'points_store_items'>;
type UserPurchase = Tables<'user_purchases'>;

export const getStoreItems = async (): Promise<StoreItem[]> => {
  const { data, error } = await supabase
    .from('points_store_items')
    .select('*')
    .eq('is_available', true)
    .order('price_points', { ascending: true });

  if (error) {
    console.error('获取商城商品失败:', error);
    return [];
  }

  return data || [];
};

export const getUserPurchases = async (): Promise<UserPurchase[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_purchases')
    .select('*, points_store_items(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('purchased_at', { ascending: false });

  if (error) {
    console.error('获取用户购买记录失败:', error);
    return [];
  }

  return data || [];
};

export const purchaseItem = async (itemId: string, itemPrice: number): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  // 先扣除积分
  const pointsSpent = await spendPoints(itemPrice);
  if (!pointsSpent) {
    return false;
  }

  // 创建购买记录
  const { error } = await supabase
    .from('user_purchases')
    .insert({
      user_id: user.id,
      item_id: itemId,
      points_spent: itemPrice
    });

  if (error) {
    console.error('创建购买记录失败:', error);
    return false;
  }

  return true;
};

export type { StoreItem, UserPurchase };
