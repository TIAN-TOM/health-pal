
-- 创建用户积分表
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  checkin_streak INTEGER NOT NULL DEFAULT 0,
  last_checkin_date DATE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 启用行级安全
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 用户只能查看和修改自己的积分
CREATE POLICY "Users can view their own points" 
  ON public.user_points 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points" 
  ON public.user_points 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" 
  ON public.user_points 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 创建更新时间戳的触发器
CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON public.user_points
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
