-- ============================================
-- 1. 修复积分系统：移除用户直接写权限
-- ============================================

-- user_points: 移除用户 INSERT/UPDATE 权限
DROP POLICY IF EXISTS "Users can insert their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;

-- user_item_inventory: 移除用户 INSERT/UPDATE 权限（购买流程会用 SECURITY DEFINER 函数写入）
DROP POLICY IF EXISTS "Users can insert their own inventory" ON public.user_item_inventory;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.user_item_inventory;

-- user_purchases: 移除用户 INSERT 权限（必须通过 purchase_store_item 函数）
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.user_purchases;

-- ============================================
-- 2. 新增服务端积分发放函数（每日签到等场景）
-- ============================================
CREATE OR REPLACE FUNCTION public.award_checkin_points(
  p_points integer DEFAULT 10,
  p_description text DEFAULT 'Daily check-in reward'
)
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
  v_new_streak integer;
  v_current_points integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- 限制最大单次发放积分，防止滥用
  IF p_points <= 0 OR p_points > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid points amount');
  END IF;

  v_today := (now() AT TIME ZONE 'Asia/Shanghai')::date;

  -- 必须存在今日签到记录才能发放积分
  SELECT id INTO v_existing_checkin
  FROM public.daily_checkins
  WHERE user_id = v_user_id AND checkin_date = v_today
  LIMIT 1;

  IF v_existing_checkin IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No check-in record for today');
  END IF;

  -- 防止重复发放：检查今日是否已有同类型积分交易
  IF EXISTS (
    SELECT 1 FROM public.points_transactions
    WHERE user_id = v_user_id
      AND transaction_type = 'checkin'
      AND created_at::date = v_today
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Points already awarded today');
  END IF;

  -- 获取或创建积分记录
  SELECT total_points, last_checkin_date INTO v_current_points, v_last_checkin
  FROM public.user_points
  WHERE user_id = v_user_id;

  -- 计算连续签到
  IF v_last_checkin IS NULL THEN
    v_new_streak := 1;
  ELSIF v_last_checkin = v_today - INTERVAL '1 day' THEN
    v_new_streak := COALESCE((SELECT checkin_streak FROM public.user_points WHERE user_id = v_user_id), 0) + 1;
  ELSIF v_last_checkin = v_today THEN
    v_new_streak := COALESCE((SELECT checkin_streak FROM public.user_points WHERE user_id = v_user_id), 1);
  ELSE
    v_new_streak := 1;
  END IF;

  IF v_current_points IS NULL THEN
    INSERT INTO public.user_points (user_id, total_points, checkin_streak, last_checkin_date)
    VALUES (v_user_id, p_points, v_new_streak, v_today);
  ELSE
    UPDATE public.user_points
    SET total_points = total_points + p_points,
        checkin_streak = v_new_streak,
        last_checkin_date = v_today,
        updated_at = now()
    WHERE user_id = v_user_id;
  END IF;

  -- 记录交易
  INSERT INTO public.points_transactions (user_id, amount, transaction_type, description)
  VALUES (v_user_id, p_points, 'checkin', p_description);

  RETURN jsonb_build_object('success', true, 'points_awarded', p_points, 'streak', v_new_streak);
END;
$$;

-- 允许已认证用户调用
GRANT EXECUTE ON FUNCTION public.award_checkin_points(integer, text) TO authenticated;

-- 同时放开 points_transactions 的服务函数 INSERT 路径
-- （SECURITY DEFINER 函数已经能写入，这里只确保管理员策略不影响）

-- ============================================
-- 3. Realtime 授权（gomoku_rooms 频道订阅）
-- ============================================
-- 仅房间参与者（host 或 guest）可订阅 gomoku 房间频道
-- 频道命名约定: gomoku-room-{room_id}
DROP POLICY IF EXISTS "Gomoku room participants can subscribe" ON realtime.messages;

CREATE POLICY "Gomoku room participants can subscribe"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.gomoku_rooms r
    WHERE ('gomoku-room-' || r.id::text) = (realtime.topic())
      AND (r.host_id = auth.uid() OR r.guest_id = auth.uid()
           OR (r.status = 'waiting' AND r.guest_id IS NULL))
  )
);

CREATE POLICY "Gomoku room participants can broadcast"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.gomoku_rooms r
    WHERE ('gomoku-room-' || r.id::text) = (realtime.topic())
      AND (r.host_id = auth.uid() OR r.guest_id = auth.uid())
  )
);

-- ============================================
-- 4. 存储桶策略补全
-- ============================================

-- checkin-photos: DELETE & UPDATE
DROP POLICY IF EXISTS "Users can delete their own checkin photos" ON storage.objects;
CREATE POLICY "Users can delete their own checkin photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'checkin-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own checkin photos" ON storage.objects;
CREATE POLICY "Users can update their own checkin photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'checkin-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- voice-records: UPDATE
DROP POLICY IF EXISTS "Users can update their own voice files" ON storage.objects;
CREATE POLICY "Users can update their own voice files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'voice-records'
  AND auth.uid()::text = (storage.foldername(name))[1]
);