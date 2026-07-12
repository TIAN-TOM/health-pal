-- Phase 0 hotfix: points system correctness, RPC hardening, missing indexes.
--
-- Diagnosed against the live database on 2026-07-13:
--  * points_transactions' CHECK constraint predates the spend/birthday/game_reward
--    RPCs, so every one of those inserts has failed since they shipped (live table
--    contains zero rows of those types while the RPCs are actively called).
--  * purchase_store_item trusted the client-supplied p_item_price for balance
--    check, deduction and the transaction row.
--  * award_points_for_checkin compared created_at::date (UTC session timezone)
--    against an Asia/Shanghai date, opening a double-award window between
--    00:00-08:00 Beijing, and had no concurrency guard.
--  * All per-user health/family tables only had primary-key indexes.

-- 1) Allow the transaction types existing RPCs already write
ALTER TABLE public.points_transactions
  DROP CONSTRAINT IF EXISTS points_transactions_transaction_type_check;
ALTER TABLE public.points_transactions
  ADD CONSTRAINT points_transactions_transaction_type_check
  CHECK (transaction_type = ANY (ARRAY[
    'checkin'::text, 'purchase'::text, 'admin_grant'::text, 'admin_deduct'::text,
    'reward'::text, 'spend'::text, 'birthday'::text, 'game_reward'::text
  ]));

-- 2) purchase_store_item: price comes from the database, rows are locked.
-- Signature keeps p_item_price so existing clients continue to work; the value
-- is no longer trusted for any calculation.
CREATE OR REPLACE FUNCTION public.purchase_store_item(p_item_id uuid, p_item_price integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_is_admin boolean;
  v_item record;
  v_price integer;
  v_user_points integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  v_is_admin := public.has_role(v_user_id, 'admin'::app_role);

  -- Lock the item row so concurrent purchases serialize on stock
  SELECT * INTO v_item
  FROM public.points_store_items
  WHERE id = p_item_id AND is_available = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or unavailable');
  END IF;

  -- Server-side price; client-supplied p_item_price is ignored
  v_price := v_item.price_points;
  IF v_price IS NULL OR v_price < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid item price');
  END IF;

  IF v_item.stock_quantity IS NOT NULL
     AND v_item.stock_quantity != -1
     AND v_item.stock_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item out of stock');
  END IF;

  IF v_item.item_type IN ('virtual_badge', 'unlock_feature', 'game_skin') THEN
    IF EXISTS (
      SELECT 1 FROM public.user_purchases
      WHERE user_id = v_user_id AND item_id = p_item_id AND is_active = true
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Already purchased');
    END IF;
  END IF;

  IF NOT v_is_admin THEN
    -- Lock the balance row so concurrent purchases cannot double-spend
    SELECT total_points INTO v_user_points
    FROM public.user_points
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_user_points IS NULL OR v_user_points < v_price THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
    END IF;

    UPDATE public.user_points
    SET total_points = total_points - v_price,
        updated_at = now()
    WHERE user_id = v_user_id;

    INSERT INTO public.points_transactions (
      user_id, amount, transaction_type, description, reference_id
    ) VALUES (
      v_user_id, -v_price, 'purchase', 'Purchase: ' || v_item.item_name, p_item_id
    );
  END IF;

  INSERT INTO public.user_purchases (user_id, item_id, points_spent)
  VALUES (v_user_id, p_item_id, v_price);

  IF v_item.stock_quantity IS NOT NULL AND v_item.stock_quantity != -1 THEN
    UPDATE public.points_store_items
    SET stock_quantity = stock_quantity - 1
    WHERE id = p_item_id;
  END IF;

  INSERT INTO public.user_item_inventory (user_id, item_id, item_type, quantity)
  VALUES (v_user_id, p_item_id, v_item.item_type, 1)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET
    quantity = user_item_inventory.quantity + 1,
    updated_at = now();

  RETURN jsonb_build_object('success', true, 'message', 'Purchase successful');
END;
$function$;

-- 3) award_points_for_checkin: consistent Asia/Shanghai day boundary for the
-- dedup check + per-user advisory lock against concurrent double awards.
CREATE OR REPLACE FUNCTION public.award_points_for_checkin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- Serialize per user: concurrent calls wait here instead of both passing the
  -- dedup check below
  PERFORM pg_advisory_xact_lock(hashtextextended('award_points_for_checkin:' || v_user_id::text, 0));

  v_today := (now() AT TIME ZONE 'Asia/Shanghai')::date;

  SELECT id INTO v_existing_checkin
  FROM public.daily_checkins
  WHERE user_id = v_user_id AND checkin_date = v_today
  LIMIT 1;
  IF v_existing_checkin IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No check-in record for today');
  END IF;

  -- Dedup on the same Asia/Shanghai day the rest of the function uses
  -- (created_at::date evaluated in the session timezone, i.e. UTC, which opened
  -- a double-award window between 00:00-08:00 Beijing)
  IF EXISTS (
    SELECT 1 FROM public.points_transactions
    WHERE user_id = v_user_id
      AND transaction_type = 'checkin'
      AND (created_at AT TIME ZONE 'Asia/Shanghai')::date = v_today
  ) THEN
    RETURN jsonb_build_object('success', true, 'points_awarded', 0, 'message', 'Already awarded today');
  END IF;

  SELECT total_points, checkin_streak, last_checkin_date
    INTO v_total, v_current_streak, v_last_checkin
  FROM public.user_points WHERE user_id = v_user_id;

  IF v_last_checkin IS NULL THEN
    v_new_streak := 1;
  ELSIF v_last_checkin = v_today - INTERVAL '1 day' THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSIF v_last_checkin = v_today THEN
    v_new_streak := COALESCE(v_current_streak, 1);
  ELSE
    v_new_streak := 1;
  END IF;

  IF v_new_streak >= 7 THEN v_bonus := v_bonus + 20; END IF;
  IF v_new_streak >= 30 THEN v_bonus := v_bonus + 50; END IF;
  IF v_new_streak >= 100 THEN v_bonus := v_bonus + 100; END IF;
  v_streak_bonus := LEAST(v_new_streak - 1, 10);
  v_total := v_base_points + v_bonus + v_streak_bonus;

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
$function$;

-- 4) award_game_completion_bonus: real game-id whitelist (matches
-- src/components/games/registry.tsx) + per-user advisory lock so the daily-cap
-- SUM and the INSERT cannot race.
CREATE OR REPLACE FUNCTION public.award_game_completion_bonus(p_game_id text, p_amount integer, p_description text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  IF p_amount <= 0 OR p_amount > 50 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;

  IF p_game_id IS NULL OR NOT (p_game_id = ANY (ARRAY[
    'memory-cards', 'flappy-bird', 'gomoku', 'multiplayer-gomoku', 'breakout',
    'snake', '2048', 'bubble-pop', 'tetris', 'bomber-pop'
  ])) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid game_id');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('award_game_completion_bonus:' || v_user_id::text, 0));

  v_today := (now() AT TIME ZONE 'Asia/Shanghai')::date;

  SELECT COALESCE(SUM(amount), 0) INTO v_today_total
  FROM public.points_transactions
  WHERE user_id = v_user_id
    AND transaction_type = 'game_reward'
    AND (created_at AT TIME ZONE 'Asia/Shanghai')::date = v_today;

  IF v_today_total >= v_daily_cap THEN
    RETURN jsonb_build_object('success', true, 'points_awarded', 0, 'message', 'Daily cap reached');
  END IF;

  v_actual := LEAST(p_amount, v_daily_cap - v_today_total);

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
$function$;

-- 5) Indexes for per-user hot paths (live DB had only primary keys on all of
-- these; every list query was a sequential scan with per-row RLS evaluation)
CREATE INDEX IF NOT EXISTS idx_meniere_records_user_time
  ON public.meniere_records (user_id, "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_diabetes_records_user_time
  ON public.diabetes_records (user_id, "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_user_date
  ON public.medical_records (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_medications_user
  ON public.user_medications (user_id);
CREATE INDEX IF NOT EXISTS idx_voice_records_user_created
  ON public.voice_records (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_created
  ON public.points_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_type_created
  ON public.points_transactions (user_id, transaction_type, created_at);
CREATE INDEX IF NOT EXISTS idx_family_calendar_events_user_date
  ON public.family_calendar_events (user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_family_expenses_user_date
  ON public.family_expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_family_messages_user_created
  ON public.family_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_reminders_user_date
  ON public.family_reminders (user_id, reminder_date);
CREATE INDEX IF NOT EXISTS idx_family_members_user
  ON public.family_members (user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user
  ON public.emergency_contacts (user_id);
