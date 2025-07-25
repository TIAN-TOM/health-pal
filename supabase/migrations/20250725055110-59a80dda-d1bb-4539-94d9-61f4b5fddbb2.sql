-- 创建家庭管理系统相关数据表

-- 1. 家庭成员表
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  birthday DATE,
  address TEXT,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. 家庭支出记录表
CREATE TABLE public.family_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  payer TEXT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 家庭提醒事项表
CREATE TABLE public.family_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_to TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. 家庭日历事件表
CREATE TABLE public.family_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  participants TEXT[],
  color TEXT DEFAULT '#3B82F6',
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. 家庭消息表
CREATE TABLE public.family_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用所有表的RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_messages ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 家庭成员表
CREATE POLICY "Users can manage their family members" 
ON public.family_members 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 创建RLS策略 - 家庭支出表
CREATE POLICY "Users can manage their family expenses" 
ON public.family_expenses 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 创建RLS策略 - 家庭提醒表
CREATE POLICY "Users can manage their family reminders" 
ON public.family_reminders 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 创建RLS策略 - 家庭日历事件表
CREATE POLICY "Users can manage their family calendar events" 
ON public.family_calendar_events 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 创建RLS策略 - 家庭消息表
CREATE POLICY "Users can view and create family messages" 
ON public.family_messages 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 创建更新时间戳触发器
CREATE TRIGGER update_family_members_updated_at
BEFORE UPDATE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_expenses_updated_at
BEFORE UPDATE ON public.family_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_reminders_updated_at
BEFORE UPDATE ON public.family_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_calendar_events_updated_at
BEFORE UPDATE ON public.family_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 创建存储桶用于头像存储
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-avatars', 'family-avatars', true);

-- 创建存储策略
CREATE POLICY "Public access for family avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'family-avatars');

CREATE POLICY "Users can upload family avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'family-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their family avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'family-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their family avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'family-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);