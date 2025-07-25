-- 修复现有函数的search_path安全问题

-- 修复update_updated_at_column函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- 修复delete_expired_voice_records函数
CREATE OR REPLACE FUNCTION public.delete_expired_voice_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 删除过期的语音记录
  DELETE FROM public.voice_records 
  WHERE expires_at < now();
END;
$$;

-- 修复admin_update_user_points函数
CREATE OR REPLACE FUNCTION public.admin_update_user_points(target_user_id uuid, points_change integer, transaction_type text, description text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_points INTEGER;
  admin_user_id UUID;
BEGIN
  -- 检查当前用户是否为管理员
  admin_user_id := auth.uid();
  IF NOT public.has_role(admin_user_id, 'admin'::app_role) THEN
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

-- 修复get_effective_user_points函数
CREATE OR REPLACE FUNCTION public.get_effective_user_points(check_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_points INTEGER;
BEGIN
  -- 如果是管理员，返回一个很大的数字表示无限积分
  IF public.has_role(check_user_id, 'admin'::app_role) THEN
    RETURN 999999;
  END IF;

  -- 获取普通用户的积分
  SELECT total_points INTO user_points
  FROM public.user_points
  WHERE user_id = check_user_id;

  RETURN COALESCE(user_points, 0);
END;
$$;

-- 修复has_role函数
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;