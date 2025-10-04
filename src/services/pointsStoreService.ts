
import { supabase } from '@/integrations/supabase/client';
import { spendPoints, getEffectiveUserPoints } from '@/services/pointsService';
import type { Tables } from '@/integrations/supabase/types';
import { notifyAdminActivity, ACTIVITY_TYPES, MODULE_NAMES } from '@/services/adminNotificationService';

type StoreItem = Tables<'points_store_items'>;
type UserPurchase = Tables<'user_purchases'> & {
  points_store_items: StoreItem | null;
};

// 用户道具效果存储
interface UserItemEffects {
  gameSkinsUnlocked: string[];
  virtualBadges: string[];
  unlockedFeatures: string[];
  makeupCards: number; // 补签卡数量
}

export const getStoreItems = async (): Promise<StoreItem[]> => {
  const { data, error } = await supabase
    .from('points_store_items')
    .select('*')
    .eq('is_available', true)
    .order('price_points', { ascending: true });

  if (error) {
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
    return [];
  }

  return data as UserPurchase[] || [];
};

// 获取用户购买记录（带分页）
export const getUserPurchasesWithPagination = async (
  page: number = 1,
  pageSize: number = 10,
  isActive?: boolean
): Promise<{ data: UserPurchase[]; count: number }> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: [], count: 0 };
  }

  let query = supabase
    .from('user_purchases')
    .select('*, points_store_items(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false });

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { data: [], count: 0 };
  }

  return { data: data as UserPurchase[] || [], count: count || 0 };
};

// 获取用户道具效果 - 从数据库库存表获取
export const getUserItemEffects = async (): Promise<UserItemEffects> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      gameSkinsUnlocked: [],
      virtualBadges: [],
      unlockedFeatures: [],
      makeupCards: 0
    };
  }

  const { data: inventory, error } = await supabase
    .from('user_item_inventory')
    .select('item_id, item_type, quantity')
    .eq('user_id', user.id)
    .gt('quantity', 0);

  if (error) {
    return {
      gameSkinsUnlocked: [],
      virtualBadges: [],
      unlockedFeatures: [],
      makeupCards: 0
    };
  }

  const effects: UserItemEffects = {
    gameSkinsUnlocked: [],
    virtualBadges: [],
    unlockedFeatures: [],
    makeupCards: 0
  };

  (inventory || []).forEach(item => {
    switch (item.item_type) {
      case 'game_skin':
        effects.gameSkinsUnlocked.push(item.item_id);
        break;
      case 'virtual_badge':
        effects.virtualBadges.push(item.item_id);
        break;
      case 'unlock_feature':
        effects.unlockedFeatures.push(item.item_id);
        break;
      case 'makeup_card':
        effects.makeupCards = item.quantity;
        break;
    }
  });

  return effects;
};

// 检查用户是否可以购买商品
export const canPurchaseItem = async (item: StoreItem): Promise<{ canPurchase: boolean; reason?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { canPurchase: false, reason: '请先登录' };
  }

  // Get effective points (handles admin unlimited points)
  const effectivePoints = await getEffectiveUserPoints();
  if (effectivePoints < item.price_points) {
    return { canPurchase: false, reason: '积分不足' };
  }

  // 检查库存
  if (item.stock_quantity !== null && item.stock_quantity !== -1 && item.stock_quantity <= 0) {
    return { canPurchase: false, reason: '商品已售罄' };
  }

  // 检查是否已购买（某些商品只能购买一次）
  if (item.item_type === 'virtual_badge' || item.item_type === 'unlock_feature' || item.item_type === 'game_skin') {
    const purchases = await getUserPurchases();
    const alreadyPurchased = purchases.some(p => p.item_id === item.id);
    if (alreadyPurchased) {
      return { canPurchase: false, reason: '已拥有此商品' };
    }
  }

  return { canPurchase: true };
};

export const purchaseItem = async (itemId: string, itemPrice: number): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  try {
    // Call secure server-side purchase function
    const { data, error } = await supabase.rpc('purchase_store_item', {
      p_item_id: itemId,
      p_item_price: itemPrice
    });

    if (error) {
      console.error('Purchase failed');
      return false;
    }

    const result = data as { success: boolean; error?: string; message?: string };
    
    if (!result.success) {
      console.error('Purchase failed:', result.error || 'Unknown error');
      return false;
    }

    // Get item name for notification
    const { data: item } = await supabase
      .from('points_store_items')
      .select('item_name')
      .eq('id', itemId)
      .single();

    // Notify admin
    if (item) {
      await notifyAdminActivity({
        activity_type: ACTIVITY_TYPES.PURCHASE,
        activity_description: `购买了商品 "${item.item_name}" (${itemPrice}积分)`,
        module_name: MODULE_NAMES.POINTS_STORE
      });
    }

    return true;
  } catch (error) {
    console.error('Purchase error');
    return false;
  }
};

// Remove old applyItemEffect function - now handled by server-side function

// 获取补签卡数量 - 从数据库获取
export const getMakeupCardsCount = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return 0;
  }

  const { data, error } = await supabase
    .from('user_item_inventory')
    .select('quantity')
    .eq('user_id', user.id)
    .eq('item_type', 'makeup_card')
    .maybeSingle();

  if (error) {
    return 0;
  }

  return data?.quantity || 0;
};

// 检查用户是否拥有特定道具效果
export const hasItemEffect = async (itemType: string, itemName?: string): Promise<boolean> => {
  const effects = await getUserItemEffects();
  
  switch (itemType) {
    case 'game_skin':
      return effects.gameSkinsUnlocked.length > 0;
    case 'virtual_badge':
      return effects.virtualBadges.length > 0;
    case 'unlock_feature':
      return effects.unlockedFeatures.some(id => {
        // 这里可以根据具体需求检查特定功能
        return true;
      });
    case 'makeup_card':
      return effects.makeupCards > 0;
    default:
      return false;
  }
};

export type { StoreItem, UserPurchase, UserItemEffects };
