-- emergency_sms_logs rows carry the message text and a GPS location_data jsonb,
-- but since 20250621115018 the table only had SELECT/INSERT policies. Two problems:
--   1. Users could not erase their own SMS/location history short of deleting the
--      whole account (privacy centre needs this; APP 11/12-aligned).
--   2. contactsService.deleteContact deletes a contact's SMS logs before the
--      contact (contact_id FK is NOT NULL, no cascade). Without a DELETE policy
--      that first step silently removes 0 rows, so deleting any contact that ever
--      received an emergency SMS fails on the foreign key.

DROP POLICY IF EXISTS "Users can delete their own SMS logs" ON public.emergency_sms_logs;
CREATE POLICY "Users can delete their own SMS logs"
  ON public.emergency_sms_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Rollback (this migration is fully reversible):
--   DROP POLICY IF EXISTS "Users can delete their own SMS logs" ON public.emergency_sms_logs;
