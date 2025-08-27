-- Fix function search path issue for the is_user_suspended function
DROP FUNCTION IF EXISTS public.is_user_suspended(UUID);

CREATE OR REPLACE FUNCTION public.is_user_suspended(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE 
    WHEN status = 'suspended' OR status = 'banned' THEN TRUE
    ELSE FALSE
  END
  FROM public.profiles
  WHERE id = user_id;
$$;