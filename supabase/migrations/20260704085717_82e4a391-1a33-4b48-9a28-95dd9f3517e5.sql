
-- 通知偏好表
CREATE TABLE public.user_notification_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  checkin_streak BOOLEAN NOT NULL DEFAULT true,
  medication BOOLEAN NOT NULL DEFAULT true,
  medical_followup BOOLEAN NOT NULL DEFAULT true,
  family_calendar BOOLEAN NOT NULL DEFAULT true,
  last_reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notification_preferences TO authenticated;
GRANT ALL ON public.user_notification_preferences TO service_role;

ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own notification prefs"
  ON public.user_notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI 周报表
CREATE TABLE public.ai_weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  summary TEXT NOT NULL,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_points_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_weekly_reports TO authenticated;
GRANT ALL ON public.ai_weekly_reports TO service_role;

ALTER TABLE public.ai_weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly reports"
  ON public.ai_weekly_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly reports"
  ON public.ai_weekly_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly reports"
  ON public.ai_weekly_reports FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_ai_weekly_reports_user_week
  ON public.ai_weekly_reports(user_id, week_start DESC);
