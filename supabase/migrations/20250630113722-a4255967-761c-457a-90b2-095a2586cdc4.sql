
-- 创建积分交易记录表
CREATE TABLE public.points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 正数为获得积分，负数为消费积分
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('checkin', 'purchase', 'admin_grant', 'admin_deduct', 'reward')),
  description TEXT,
  reference_id UUID, -- 可以关联到购买记录或其他相关记录
  created_by UUID REFERENCES auth.users(id), -- 创建者（管理员操作时记录）
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 为积分交易记录启用RLS
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的积分交易记录
CREATE POLICY "Users can view their own transactions" ON public.points_transactions FOR SELECT USING (auth.uid() = user_id);

-- 管理员可以查看所有交易记录
CREATE POLICY "Admins can view all transactions" ON public.points_transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 管理员可以创建积分交易记录
CREATE POLICY "Admins can create transactions" ON public.points_transactions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建管理员积分管理函数
CREATE OR REPLACE FUNCTION public.admin_update_user_points(
  target_user_id UUID,
  points_change INTEGER,
  transaction_type TEXT,
  description TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
  admin_user_id UUID;
BEGIN
  -- 检查当前用户是否为管理员
  admin_user_id := auth.uid();
  IF NOT public.has_role(admin_user_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can modify user points';
  END IF;

  -- 获取用户当前积分
  SELECT total_points INTO current_points
  FROM public.user_points
  WHERE user_id = target_user_id;

  -- 如果用户没有积分记录，创建一个
  IF current_points IS NULL THEN
    INSERT INTO public.user_points (user_id, total_points, checkin_streak, last_checkin_date)
    VALUES (target_user_id, GREATEST(0, points_change), 0, NULL);
    current_points := 0;
  ELSE
    -- 更新用户积分
    UPDATE public.user_points
    SET total_points = GREATEST(0, current_points + points_change),
        updated_at = now()
    WHERE user_id = target_user_id;
  END IF;

  -- 记录积分交易
  INSERT INTO public.points_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    created_by
  ) VALUES (
    target_user_id,
    points_change,
    transaction_type,
    description,
    admin_user_id
  );

  RETURN TRUE;
END;
$$;

-- 创建检查管理员积分的函数（管理员拥有无限积分）
CREATE OR REPLACE FUNCTION public.get_effective_user_points(check_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_points INTEGER;
BEGIN
  -- 如果是管理员，返回一个很大的数字表示无限积分
  IF public.has_role(check_user_id, 'admin') THEN
    RETURN 999999;
  END IF;

  -- 获取普通用户的积分
  SELECT total_points INTO user_points
  FROM public.user_points
  WHERE user_id = check_user_id;

  RETURN COALESCE(user_points, 0);
END;
$$;
