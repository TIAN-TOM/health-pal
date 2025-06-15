
-- 将您的账户设置为管理员
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'tys1328056247@gmail.com'
);

-- 如果上面的更新没有找到用户，插入管理员角色
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'tys1328056247@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id
);

-- 创建梅尼埃症记录表
CREATE TABLE public.meniere_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dizziness', 'lifestyle', 'medication', 'voice')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}',
  note TEXT,
  severity TEXT,
  duration TEXT,
  symptoms TEXT[],
  diet TEXT[],
  sleep TEXT,
  stress TEXT,
  medications TEXT[],
  dosage TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 为记录表启用行级安全
ALTER TABLE public.meniere_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的记录
CREATE POLICY "Users can view own records" ON public.meniere_records
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的记录
CREATE POLICY "Users can create own records" ON public.meniere_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的记录
CREATE POLICY "Users can update own records" ON public.meniere_records
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的记录
CREATE POLICY "Users can delete own records" ON public.meniere_records
  FOR DELETE USING (auth.uid() = user_id);

-- 管理员可以查看所有记录
CREATE POLICY "Admins can view all records" ON public.meniere_records
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 管理员可以管理所有记录
CREATE POLICY "Admins can manage all records" ON public.meniere_records
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
