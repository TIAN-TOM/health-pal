
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

  return data as UserPurchase[] || [];
};

// 获取用户道具效果
export const getUserItemEffects = async (): Promise<UserItemEffects> => {
  const purchases = await getUserPurchases();
  
  const effects: UserItemEffects = {
    gameSkinsUnlocked: [],
    virtualBadges: [],
    unlockedFeatures: [],
    makeupCards: 0
  };

  purchases.forEach(purchase => {
    const item = purchase.points_store_items;
    if (!item) return;

    switch (item.item_type) {
      case 'game_skin':
        effects.gameSkinsUnlocked.push(item.id);
        break;
      case 'virtual_badge':
        effects.virtualBadges.push(item.id);
        break;
      case 'unlock_feature':
        effects.unlockedFeatures.push(item.id);
        break;
      case 'makeup_card':
        effects.makeupCards += 1; // 每购买一次补签卡增加1张
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

  // 获取商品信息
  const { data: item } = await supabase
    .from('points_store_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (!item) {
    return false;
  }

  // 检查是否可以购买
  const { canPurchase, reason } = await canPurchaseItem(item);
  if (!canPurchase) {
    console.error('无法购买商品:', reason);
    return false;
  }

  // 先扣除积分
  const pointsSpent = await spendPoints(itemPrice, `购买商品: ${item.item_name}`, itemId);
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

  // 更新库存（如果有限库存）
  if (item.stock_quantity !== null && item.stock_quantity !== -1) {
    await supabase
      .from('points_store_items')
      .update({ stock_quantity: item.stock_quantity - 1 })
      .eq('id', itemId);
  }

  // 应用道具效果到用户游戏状态
  await applyItemEffect(item, user.id);

  // 通知管理员
  await notifyAdminActivity({
    activity_type: ACTIVITY_TYPES.PURCHASE,
    activity_description: `购买了商品 "${item.item_name}" (${itemPrice}积分)`,
    module_name: MODULE_NAMES.POINTS_STORE
  });

  return true;
};

// 应用道具效果
const applyItemEffect = async (item: StoreItem, userId: string) => {
  try {
    // 存储道具效果到用户偏好设置或专门的道具效果表
    const effectData = {
      itemId: item.id,
      itemType: item.item_type,
      itemName: item.item_name,
      appliedAt: new Date().toISOString(),
      isActive: true
    };

    console.log('应用道具效果:', effectData);
    
    // 如果是补签卡，可以在这里记录到用户的补签卡余额
    if (item.item_type === 'makeup_card') {
      const currentCount = parseInt(localStorage.getItem('makeup-cards-count') || '0');
      localStorage.setItem('makeup-cards-count', (currentCount + 1).toString());
    }
    
  } catch (error) {
    console.error('应用道具效果失败:', error);
  }
};

// 获取补签卡数量
export const getMakeupCardsCount = (): number => {
  return parseInt(localStorage.getItem('makeup-cards-count') || '0');
};

// 使用补签卡
export const useMakeupCard = (): boolean => {
  const currentCount = getMakeupCardsCount();
  if (currentCount > 0) {
    localStorage.setItem('makeup-cards-count', (currentCount - 1).toString());
    return true;
  }
  return false;
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
