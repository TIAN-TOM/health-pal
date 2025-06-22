
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPreferences {
  id?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  age?: number;
  height?: number;
  weight?: number;
  medical_history?: string[];
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language?: string;
  timezone?: string;
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
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setPreferences(data || {});
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
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences
        });

      if (error) throw error;

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
