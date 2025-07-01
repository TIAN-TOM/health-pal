
import { getUserPurchases } from '@/services/pointsStoreService';

export const checkGomokuSkinUnlocked = async (): Promise<boolean> => {
  try {
    const purchases = await getUserPurchases();
    return purchases.some(purchase => 
      purchase.points_store_items?.item_name === '五子棋经典皮肤'
    );
  } catch (error) {
    console.error('检查五子棋皮肤解锁状态失败:', error);
    return false;
  }
};

export const getSkinPreference = (skinKey: string): string => {
  return localStorage.getItem(`skin-${skinKey}`) || 'default';
};

export const setSkinPreference = (skinKey: string, skinValue: string): void => {
  localStorage.setItem(`skin-${skinKey}`, skinValue);
};
