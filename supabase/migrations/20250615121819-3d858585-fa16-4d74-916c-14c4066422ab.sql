
-- 创建紧急联系人表
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建常用药物表
CREATE TABLE public.user_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily', -- daily, twice_daily, three_times_daily, as_needed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 为联系人表启用行级安全
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的联系人
CREATE POLICY "Users can view own contacts" ON public.emergency_contacts
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的联系人
CREATE POLICY "Users can create own contacts" ON public.emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的联系人
CREATE POLICY "Users can update own contacts" ON public.emergency_contacts
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的联系人
CREATE POLICY "Users can delete own contacts" ON public.emergency_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- 为药物表启用行级安全
ALTER TABLE public.user_medications ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的药物
CREATE POLICY "Users can view own medications" ON public.user_medications
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的药物
CREATE POLICY "Users can create own medications" ON public.user_medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的药物
CREATE POLICY "Users can update own medications" ON public.user_medications
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的药物
CREATE POLICY "Users can delete own medications" ON public.user_medications
  FOR DELETE USING (auth.uid() = user_id);
