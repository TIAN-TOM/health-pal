
-- 1. Add restrictive deny policies for write paths on sensitive tables.
-- No existing policy means no access, but explicit deny policies make intent clear and
-- protect against future permissive policies being added accidentally.

-- account_deletions: only service role / SECURITY DEFINER may write
CREATE POLICY "Block client inserts on account_deletions"
  ON public.account_deletions FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "Block client updates on account_deletions"
  ON public.account_deletions FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "Block client deletes on account_deletions"
  ON public.account_deletions FOR DELETE TO authenticated, anon
  USING (false);

-- user_points: writes only via SECURITY DEFINER functions / service role
CREATE POLICY "Block client inserts on user_points"
  ON public.user_points FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "Block client updates on user_points"
  ON public.user_points FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "Block client deletes on user_points"
  ON public.user_points FOR DELETE TO authenticated, anon
  USING (false);

-- user_purchases: writes only via purchase_store_item / service role
CREATE POLICY "Block client inserts on user_purchases"
  ON public.user_purchases FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "Block client updates on user_purchases"
  ON public.user_purchases FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "Block client deletes on user_purchases"
  ON public.user_purchases FOR DELETE TO authenticated, anon
  USING (false);

-- user_item_inventory: writes only via purchase_store_item / consume_inventory_item / service role
CREATE POLICY "Block client inserts on user_item_inventory"
  ON public.user_item_inventory FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "Block client updates on user_item_inventory"
  ON public.user_item_inventory FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "Block client deletes on user_item_inventory"
  ON public.user_item_inventory FOR DELETE TO authenticated, anon
  USING (false);

-- 2. Revoke EXECUTE on internal SECURITY DEFINER functions from anon / authenticated.
-- These are triggers or admin-only helpers that should never be invoked from the client.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_expired_voice_records() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_user_suspended(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_user_points(uuid, integer, text, text) FROM anon, PUBLIC;
-- admin_update_user_points still callable by authenticated; the function itself enforces admin role.

-- Revoke anon execute on user-facing RPCs (they require auth.uid() anyway, but be explicit)
REVOKE EXECUTE ON FUNCTION public.award_points_for_checkin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_birthday_bonus() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_game_completion_bonus(text, integer, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.spend_user_points(integer, text, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purchase_store_item(uuid, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.consume_inventory_item(uuid, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_effective_user_points(uuid) FROM anon, PUBLIC;
-- has_role is used inside RLS policies and must remain callable by the policy executor.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Ensure authenticated keeps execute on user-facing RPCs
GRANT EXECUTE ON FUNCTION public.award_points_for_checkin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_birthday_bonus() TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_game_completion_bonus(text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_user_points(integer, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_store_item(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_inventory_item(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_user_points(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_points(uuid, integer, text, text) TO authenticated;
