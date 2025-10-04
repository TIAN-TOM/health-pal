-- Create secure server-side purchase function
CREATE OR REPLACE FUNCTION public.purchase_store_item(
  p_item_id uuid,
  p_item_price integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_admin boolean;
  v_item record;
  v_user_points integer;
  v_result jsonb;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Check if user is admin
  v_is_admin := public.has_role(v_user_id, 'admin'::app_role);

  -- Get item details
  SELECT * INTO v_item
  FROM public.points_store_items
  WHERE id = p_item_id AND is_available = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or unavailable');
  END IF;

  -- Check stock
  IF v_item.stock_quantity IS NOT NULL 
     AND v_item.stock_quantity != -1 
     AND v_item.stock_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item out of stock');
  END IF;

  -- Check if already purchased (for unique items)
  IF v_item.item_type IN ('virtual_badge', 'unlock_feature', 'game_skin') THEN
    IF EXISTS (
      SELECT 1 FROM public.user_purchases
      WHERE user_id = v_user_id AND item_id = p_item_id AND is_active = true
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Already purchased');
    END IF;
  END IF;

  -- For non-admin users, check and deduct points
  IF NOT v_is_admin THEN
    SELECT total_points INTO v_user_points
    FROM public.user_points
    WHERE user_id = v_user_id;

    IF v_user_points IS NULL OR v_user_points < p_item_price THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
    END IF;

    -- Deduct points
    UPDATE public.user_points
    SET total_points = total_points - p_item_price,
        updated_at = now()
    WHERE user_id = v_user_id;

    -- Record transaction
    INSERT INTO public.points_transactions (
      user_id,
      amount,
      transaction_type,
      description,
      reference_id
    ) VALUES (
      v_user_id,
      -p_item_price,
      'purchase',
      'Purchase: ' || v_item.item_name,
      p_item_id
    );
  END IF;

  -- Create purchase record
  INSERT INTO public.user_purchases (
    user_id,
    item_id,
    points_spent
  ) VALUES (
    v_user_id,
    p_item_id,
    p_item_price
  );

  -- Update stock if limited
  IF v_item.stock_quantity IS NOT NULL AND v_item.stock_quantity != -1 THEN
    UPDATE public.points_store_items
    SET stock_quantity = stock_quantity - 1
    WHERE id = p_item_id;
  END IF;

  -- Add to inventory
  INSERT INTO public.user_item_inventory (
    user_id,
    item_id,
    item_type,
    quantity
  ) VALUES (
    v_user_id,
    p_item_id,
    v_item.item_type,
    1
  )
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET
    quantity = user_item_inventory.quantity + 1,
    updated_at = now();

  RETURN jsonb_build_object('success', true, 'message', 'Purchase successful');
END;
$$;

-- Add RLS policy for admin_notifications INSERT
-- This policy allows the service role to insert notifications
-- Regular users cannot insert directly
CREATE POLICY "Service can insert admin notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (false);

-- Grant execute permission on the purchase function
GRANT EXECUTE ON FUNCTION public.purchase_store_item(uuid, integer) TO authenticated;