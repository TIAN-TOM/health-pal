import { supabase } from '@/integrations/supabase/client';

// 写路径统一取当前用户 id；未登录时抛错，而不是把 undefined 写进 user_id
export const requireUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('用户未登录');
  }
  return data.user.id;
};
