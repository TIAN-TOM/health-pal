
-- 创建短信记录表，用于记录紧急短信发送历史
CREATE TABLE public.emergency_sms_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  contact_id uuid REFERENCES public.emergency_contacts(id) NOT NULL,
  message text NOT NULL,
  location_data jsonb,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.emergency_sms_logs ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view their own SMS logs" 
  ON public.emergency_sms_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SMS logs" 
  ON public.emergency_sms_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 为profiles表添加可编辑姓名的功能
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建profiles表的RLS策略
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
