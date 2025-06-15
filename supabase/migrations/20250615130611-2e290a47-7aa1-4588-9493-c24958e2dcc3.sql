
-- 创建每日打卡记录表
CREATE TABLE public.daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- 启用行级安全
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view their own checkins" 
  ON public.daily_checkins 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins" 
  ON public.daily_checkins 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins" 
  ON public.daily_checkins 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 创建存储桶用于存储打卡照片
INSERT INTO storage.buckets (id, name, public) VALUES ('checkin-photos', 'checkin-photos', true);

-- 创建存储桶的RLS策略
CREATE POLICY "Users can upload their own checkin photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own checkin photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view checkin photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checkin-photos');
