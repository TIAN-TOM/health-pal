-- RLS WITH CHECK cannot compare NEW against OLD, so the gomoku_rooms UPDATE
-- policy (USING only) lets a joined guest rewrite host_id or hijack the guest
-- seat via a crafted PostgREST update. Enforce row integrity with a trigger:
-- host_id is immutable, and an occupied guest seat can only be vacated or
-- kept, never transferred directly to another player.
CREATE OR REPLACE FUNCTION public.protect_gomoku_room_integrity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.host_id IS DISTINCT FROM OLD.host_id THEN
    RAISE EXCEPTION 'host_id is immutable';
  END IF;
  IF OLD.guest_id IS NOT NULL
     AND NEW.guest_id IS NOT NULL
     AND NEW.guest_id IS DISTINCT FROM OLD.guest_id THEN
    RAISE EXCEPTION 'guest seat cannot be transferred directly';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_gomoku_room_integrity ON public.gomoku_rooms;
CREATE TRIGGER trg_protect_gomoku_room_integrity
  BEFORE UPDATE ON public.gomoku_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_gomoku_room_integrity();
