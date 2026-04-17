import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { claimBirthdayBonus } from '@/services/pointsService';
import { useToast } from '@/hooks/use-toast';

export const useBirthdayWish = () => {
  const { user } = useAuth();
  const { preferences, refreshPreferences } = useUserPreferences();
  const { toast } = useToast();
  const [showBirthdayWish, setShowBirthdayWish] = useState(false);
  const [birthdayAge, setBirthdayAge] = useState<number | null>(null);

  useEffect(() => {
    const checkBirthdayWish = async () => {
      if (!user || !preferences?.birthday) return;

      const birthDate = new Date(preferences.birthday);
      const today = new Date();
      const currentYear = today.getFullYear();

      let age = currentYear - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // 必须是生日当天才弹窗
      const isBirthdayToday =
        birthDate.getMonth() === today.getMonth() &&
        birthDate.getDate() === today.getDate();
      if (!isBirthdayToday) return;

      if (preferences.last_birthday_wish_year === currentYear) return;

      setBirthdayAge(age);
      setShowBirthdayWish(true);
    };

    checkBirthdayWish();
  }, [user, preferences]);

  const handleBirthdayWishClose = async () => {
    if (!user) {
      setShowBirthdayWish(false);
      return;
    }

    try {
      // 服务器端校验生日并发放 666 积分（原子操作，含防重复领取）
      const success = await claimBirthdayBonus();
      if (success) {
        toast({
          title: '生日快乐！🎉',
          description: '已为您送上666积分作为生日礼物！',
          duration: 5000,
        });
        await refreshPreferences();
      } else {
        toast({
          title: '生日快乐！🎉',
          description: '生日祝福已送达！',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('生日积分领取失败:', error);
      toast({
        title: '生日快乐！🎉',
        description: '生日祝福已送达！',
        duration: 5000,
      });
    }

    setShowBirthdayWish(false);
  };

  return {
    showBirthdayWish,
    birthdayAge,
    handleBirthdayWishClose,
  };
};
