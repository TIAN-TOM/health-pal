
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPreferences {
  id?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthday?: string; // Date in YYYY-MM-DD format
  height?: number;
  weight?: number;
  medical_history?: string[];
  allergies?: string[];
  family_medical_history?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  last_birthday_wish_year?: number; // Year when user last received birthday wish
  preferred_weather_city?: string; // 用户偏好的天气城市
  preferred_weather_city2?: string; // 第二个对比城市
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // 使用 maybeSingle 避免错误

      if (error) {
        throw error;
      }

      if (data) {
        const mappedData: UserPreferences = {
          id: data.id,
          gender: data.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
          birthday: data.birthday,
          height: data.height,
          weight: data.weight,
          medical_history: data.medical_history,
          allergies: data.allergies,
          family_medical_history: data.family_medical_history,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          last_birthday_wish_year: data.last_birthday_wish_year,
          preferred_weather_city: data.preferred_weather_city,
          preferred_weather_city2: data.preferred_weather_city2,
        };
        setPreferences(mappedData);
      } else {
        setPreferences({});
      }
    } catch (error: any) {
      console.error('加载用户偏好设置失败:', error);
      toast({
        title: "加载偏好设置失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    if (!user) return false;

    try {
      // 先检查是否已存在记录
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existingData) {
        // 更新现有记录
        result = await supabase
          .from('user_preferences')
          .update(newPreferences)
          .eq('user_id', user.id);
      } else {
        // 插入新记录
        result = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...newPreferences
          });
      }

      if (result.error) throw result.error;

      setPreferences(newPreferences);
      toast({
        title: "保存成功",
        description: "您的偏好设置已更新"
      });
      return true;
    } catch (error: any) {
      console.error('保存用户偏好设置失败:', error);
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  return {
    preferences,
    loading,
    savePreferences,
    refreshPreferences: loadPreferences
  };
};
