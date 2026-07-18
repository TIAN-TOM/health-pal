CREATE OR REPLACE FUNCTION public.protect_gomoku_room_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
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
$function$;