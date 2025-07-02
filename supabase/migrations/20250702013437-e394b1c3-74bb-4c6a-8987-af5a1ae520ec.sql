
-- 创建语音记录表
CREATE TABLE public.voice_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '语音记录',
  duration INTEGER NOT NULL DEFAULT 0, -- 录音时长（秒）
  file_path TEXT, -- 存储在Supabase Storage中的文件路径
  file_size INTEGER, -- 文件大小（字节）
  transcription TEXT, -- AI转录文本（可选）
  note TEXT, -- 用户备注
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- 创建RLS策略 - 用户只能访问自己的语音记录
ALTER TABLE public.voice_records ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的语音记录
CREATE POLICY "Users can view their own voice records" 
  ON public.voice_records 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 用户可以创建自己的语音记录
CREATE POLICY "Users can create their own voice records" 
  ON public.voice_records 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的语音记录
CREATE POLICY "Users can update their own voice records" 
  ON public.voice_records 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 用户可以删除自己的语音记录
CREATE POLICY "Users can delete their own voice records" 
  ON public.voice_records 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 管理员可以查看所有用户的语音记录元数据（但不能访问音频文件）
CREATE POLICY "Admins can view voice records metadata" 
  ON public.voice_records 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- 创建存储桶用于语音文件
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-records', 'voice-records', false);

-- 语音文件存储策略 - 只有文件所有者可以访问
CREATE POLICY "Users can upload their own voice files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-records' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own voice files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-records' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own voice files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-records' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 自动删除过期的语音记录
CREATE OR REPLACE FUNCTION delete_expired_voice_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 删除过期的语音记录
  DELETE FROM public.voice_records 
  WHERE expires_at < now();
END;
$$;

-- 创建定时任务来清理过期记录（需要pg_cron扩展，如果没有就手动运行）
-- SELECT cron.schedule('delete-expired-voice-records', '0 2 * * *', 'SELECT delete_expired_voice_records();');

-- 为英语学习内容表添加管理员编辑权限
-- 管理员可以管理英语名言
CREATE POLICY "Admins can manage english quotes" 
  ON public.english_quotes 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 管理员可以管理英语单词
CREATE POLICY "Admins can manage english words" 
  ON public.english_words 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 管理员可以管理英语短语
CREATE POLICY "Admins can manage english phrases" 
  ON public.english_phrases 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 管理员可以管理英语听力内容
CREATE POLICY "Admins can manage english listening" 
  ON public.english_listening 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 创建更新时间触发器
CREATE TRIGGER update_voice_records_updated_at
  BEFORE UPDATE ON public.voice_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
