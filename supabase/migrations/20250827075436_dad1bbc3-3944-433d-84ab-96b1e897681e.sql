-- Add user status tracking
ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));

-- Add index for better performance
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update RLS policies to prevent suspended users from accessing their data
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view their active profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id AND status = 'active');

-- Create a function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN status = 'suspended' OR status = 'banned' THEN TRUE
    ELSE FALSE
  END
  FROM public.profiles
  WHERE id = user_id;
$$;