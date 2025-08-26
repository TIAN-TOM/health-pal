import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { addPoints } from '@/services/pointsService';
import { useToast } from '@/hooks/use-toast';

export const useBirthdayWish = () => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { toast } = useToast();
  const [showBirthdayWish, setShowBirthdayWish] = useState(false);
  const [birthdayAge, setBirthdayAge] = useState<number | null>(null);

  useEffect(() => {
    const checkBirthdayWish = async () => {
      if (!user || !preferences?.birthday) return;

      const birthDate = new Date(preferences.birthday);
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // 计算年龄
      let age = currentYear - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // 检查今年的生日是否已经过了
      const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      const hasBirthdayPassed = today >= birthdayThisYear;

      if (!hasBirthdayPassed) return;

      // 检查是否已经收到今年的生日祝福（通过积分交易记录）
      const { data: transactions } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'birthday_reward')
        .gte('created_at', `${currentYear}-01-01`)
        .lt('created_at', `${currentYear + 1}-01-01`);

      if (!transactions || transactions.length === 0) {
        setBirthdayAge(age);
        setShowBirthdayWish(true);
      }
    };

    checkBirthdayWish();
  }, [user, preferences]);

  const handleBirthdayWishClose = async () => {
    if (!user) return;

    try {
      // 赠送666积分
      await addPoints(666, '生日祝福奖励', 'birthday_reward');
      
      toast({
        title: "生日快乐！🎉",
        description: "已为您送上666积分作为生日礼物！",
        duration: 5000,
      });
    } catch (error) {
      console.error('生日积分赠送失败:', error);
      toast({
        title: "生日快乐！🎉",
        description: "生日祝福已送达！",
        duration: 5000,
      });
    }

    setShowBirthdayWish(false);
  };

  return {
    showBirthdayWish,
    birthdayAge,
    handleBirthdayWishClose
  };
};