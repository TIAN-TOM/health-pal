-- 删除前面那个未必好用的 award_checkin_points，重新设计一组完整函数
DROP FUNCTION IF EXISTS public.award_checkin_points(integer, text);

-- ============================================
-- 1. 每日打卡积分（服务器原子计算连续奖励）
-- ============================================
CREATE OR REPLACE FUNCTION public.award_points_for_checkin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_today date;
  v_existing_checkin uuid;
  v_last_checkin date;
  v_current_streak integer;
  v_new_streak integer;
  v_base_points integer := 10;
  v_bonus integer := 0;
  v_streak_bonus integer;
  v_total integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  v_today := (now() AT TIME ZONE 'Asia/Shanghai')::date;

  -- 必须有今日签到记录
  SELECT id INTO v_existing_checkin
  FROM public.daily_checkins
  WHERE user_id = v_user_id AND checkin_date = v_today
  LIMIT 1;
  IF v_existing_checkin IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No check-in record for today');
  END IF;

  -- 防重复发放
  IF EXISTS (
    SELECT 1 FROM public.points_transactions
    WHERE user_id = v_user_id
      AND transaction_type = 'checkin'
      AND created_at::date = v_today
  ) THEN
    RETURN jsonb_build_object('success', true, 'points_awarded', 0, 'message', 'Already awarded today');
  END IF;

  -- 取当前积分
  SELECT total_points, checkin_streak, last_checkin_date
    INTO v_total, v_current_streak, v_last_checkin
  FROM public.user_points WHERE user_id = v_user_id;

  -- 计算连续天数
  IF v_last_checkin IS NULL THEN
    v_new_streak := 1;
  ELSIF v_last_checkin = v_today - INTERVAL '1 day' THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSIF v_last_checkin = v_today THEN
    v_new_streak := COALESCE(v_current_streak, 1);
  ELSE
    v_new_streak := 1;
  END IF;

  -- 奖励
  IF v_new_streak >= 7 THEN v_bonus := v_bonus + 20; END IF;
  IF v_new_streak >= 30 THEN v_bonus := v_bonus + 50; END IF;
  IF v_new_streak >= 100 THEN v_bonus := v_bonus + 100; END IF;
  v_streak_bonus := LEAST(v_new_streak - 1, 10);
  v_total := v_base_points + v_bonus + v_streak_bonus;

  -- 写入或更新
  INSERT INTO public.user_points (user_id, total_points, checkin_streak, last_checkin_date)
  VALUES (v_user_id, v_total, v_new_streak, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_points.total_points + EXCLUDED.total_points,
    checkin_streak = EXCLUDED.checkin_streak,
    last_checkin_date = EXCLUDED.last_checkin_date,
    updated_at = now();

  INSERT INTO public.points_transactions (user_id, amount, transaction_type, description)
  VALUES (v_user_id, v_total, 'checkin', '每日打卡奖励 (连续' || v_new_streak || '天)');

  RETURN jsonb_build_object('success', true, 'points_awarded', v_total, 'streak', v_new_streak);
END;
$$;

-- 注意：user_points 没有 user_id 唯一约束，先添加
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_points_user_id_key'
  ) THEN
    ALTER TABLE public.user_points ADD CONSTRAINT user_points_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- ============================================
-- 2. 用户消费积分（如补签卡兑换）
-- ============================================
CREATE OR REPLACE FUNCTION public.spend_user_points(
  p_amount integer,
  p_reason text DEFAULT 'spend',
  p_reference_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_current integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF p_amount <= 0 OR p_amount > 100000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;

  SELECT total_points INTO v_current
  FROM public.user_points WHERE user_id = v_user_id FOR UPDATE;

  IF v_current IS NULL OR v_current < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;

  UPDATE public.user_points
  SET total_points = total_points - p_amount, updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO public.points_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (v_user_id, -p_amount, 'spend', p_reason, p_reference_id);

  RETURN jsonb_build_object('success', true, 'remaining', v_current - p_amount);
END;
$$;

-- ============================================
-- 3. 受控的杂项奖励（生日礼物等）
-- ============================================
CREATE OR REPLACE FUNCTION public.award_birthday_bonus()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_birthday date;
  v_today date;
  v_year integer;
  v_last_year integer;
  v_amount integer := 666;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  v_today := (now() AT TIME ZONE 'Asia/Shanghai')::date;
  v_year := EXTRACT(YEAR FROM v_today)::integer;

  SELECT birthday, last_birthday_wish_year
    INTO v_birthday, v_last_year
  FROM public.user_preferences WHERE user_id = v_user_id;

  IF v_birthday IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No birthday set');
  END IF;

  -- 必须是今天的月日
  IF EXTRACT(MONTH FROM v_birthday) != EXTRACT(MONTH FROM v_today)
     OR EXTRACT(DAY FROM v_birthday) != EXTRACT(DAY FROM v_today) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your birthday');
  END IF;

  -- 同年只能领一次
  IF v_last_year = v_year THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed this year');
  END IF;

  INSERT INTO public.user_points (user_id, total_points, checkin_streak)
  VALUES (v_user_id, v_amount, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_points.total_points + v_amount,
    updated_at = now();

  INSERT INTO public.points_transactions (user_id, amount, transaction_type, description)
  VALUES (v_user_id, v_amount, 'birthday', '生日礼物 666 积分');

  UPDATE public.user_preferences
  SET last_birthday_wish_year = v_year, updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'points_awarded', v_amount);
END;
$$;

-- ============================================
-- 4. 用户消费补签卡（库存扣减）
-- ============================================
CREATE OR REPLACE FUNCTION public.consume_inventory_item(
  p_item_id uuid,
  p_quantity integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_current integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF p_quantity <= 0 OR p_quantity > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid quantity');
  END IF;

  SELECT quantity INTO v_current
  FROM public.user_item_inventory
  WHERE user_id = v_user_id AND item_id = p_item_id
  FOR UPDATE;

  IF v_current IS NULL OR v_current < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient inventory');
  END IF;

  UPDATE public.user_item_inventory
  SET quantity = quantity - p_quantity, updated_at = now()
  WHERE user_id = v_user_id AND item_id = p_item_id;

  RETURN jsonb_build_object('success', true, 'remaining', v_current - p_quantity);
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_points_for_checkin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_user_points(integer, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_birthday_bonus() TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_inventory_item(uuid, integer) TO authenticated;