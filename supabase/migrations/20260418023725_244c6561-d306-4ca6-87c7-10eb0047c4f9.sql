-- 游戏通关奖励积分函数：防止客户端伪造，每日封顶
CREATE OR REPLACE FUNCTION public.award_game_completion_bonus(
  p_game_id text,
  p_amount integer,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_today date;
  v_today_total integer;
  v_daily_cap integer := 100; -- 每日游戏奖励上限 100 积分
  v_actual integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- 单次奖励范围合理性
  IF p_amount <= 0 OR p_amount > 50 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;

  -- 游戏 ID 白名单（避免任意 transaction_type 注入）
  IF p_game_id IS NULL OR length(p_game_id) > 32 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid game_id');
  END IF;

  v_today := (now() AT TIME ZONE 'Asia/Shanghai')::date;

  -- 当日已发放的游戏奖励总和
  SELECT COALESCE(SUM(amount), 0) INTO v_today_total
  FROM public.points_transactions
  WHERE user_id = v_user_id
    AND transaction_type = 'game_reward'
    AND (created_at AT TIME ZONE 'Asia/Shanghai')::date = v_today;

  IF v_today_total >= v_daily_cap THEN
    RETURN jsonb_build_object('success', true, 'points_awarded', 0, 'message', 'Daily cap reached');
  END IF;

  v_actual := LEAST(p_amount, v_daily_cap - v_today_total);

  -- 更新积分
  INSERT INTO public.user_points (user_id, total_points, checkin_streak)
  VALUES (v_user_id, v_actual, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_points.total_points + v_actual,
    updated_at = now();

  INSERT INTO public.points_transactions (user_id, amount, transaction_type, description)
  VALUES (
    v_user_id,
    v_actual,
    'game_reward',
    COALESCE(p_description, '游戏通关奖励 (' || p_game_id || ')')
  );

  RETURN jsonb_build_object(
    'success', true,
    'points_awarded', v_actual,
    'daily_remaining', v_daily_cap - v_today_total - v_actual
  );
END;
$$;