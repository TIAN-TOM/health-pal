-- 1) Privilege escalation fix: explicit INSERT/UPDATE WITH CHECK on user_roles.
-- The previous "Admins can manage roles" ALL policy lacked WITH CHECK, so a non-admin
-- could potentially insert/update rows granting themselves admin. Replace with explicit,
-- per-command policies that require admin for both USING and WITH CHECK.
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow users to read their own role row (needed by the client to determine UI),
-- in addition to admins reading all roles.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polrelid = 'public.user_roles'::regclass
      AND polname = 'Users can view own role'
  ) THEN
    CREATE POLICY "Users can view own role"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- 2) Profiles: allow suspended/inactive users to still read their own profile,
-- and add an explicit INSERT WITH CHECK for self-creation (defence in depth alongside the trigger).
DROP POLICY IF EXISTS "Users can view their active profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polrelid = 'public.profiles'::regclass
      AND polname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END$$;