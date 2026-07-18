-- Versioned, append-only ledger of user privacy consents (supports APP 3/5-style
-- demonstrable consent for collecting health data). Each acceptance or withdrawal
-- inserts a new row; the latest row per (user_id, consent_type) is the current
-- state. Clients can never UPDATE or DELETE, so the trail is tamper-evident; rows
-- are removed only when the auth account is deleted (FK cascade).

CREATE TABLE IF NOT EXISTS public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  consent_version text NOT NULL,
  granted boolean NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_type_created
  ON public.user_consents (user_id, consent_type, created_at DESC);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own consents" ON public.user_consents;
CREATE POLICY "Users can view their own consents"
  ON public.user_consents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all consents" ON public.user_consents;
CREATE POLICY "Admins can view all consents"
  ON public.user_consents
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can record their own consents" ON public.user_consents;
CREATE POLICY "Users can record their own consents"
  ON public.user_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Append-only: explicitly deny client updates and deletes (same pattern as the
-- points tables lockdown in 20260607040134).
DROP POLICY IF EXISTS "Consents cannot be updated" ON public.user_consents;
CREATE POLICY "Consents cannot be updated"
  ON public.user_consents
  FOR UPDATE
  TO authenticated, anon
  USING (false);

DROP POLICY IF EXISTS "Consents cannot be deleted" ON public.user_consents;
CREATE POLICY "Consents cannot be deleted"
  ON public.user_consents
  FOR DELETE
  TO authenticated, anon
  USING (false);

GRANT SELECT, INSERT ON public.user_consents TO authenticated;
GRANT ALL ON public.user_consents TO service_role;

-- Rollback (this migration is fully reversible):
--   DROP TABLE IF EXISTS public.user_consents;
-- Dropping the table removes its index, policies and grants in one step.
