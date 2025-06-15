
-- 创建公告表
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 启用行级安全
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 所有用户都可以查看活跃的公告
CREATE POLICY "Everyone can view active announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (is_active = true);

-- 只有管理员可以创建、更新和删除公告
CREATE POLICY "Admins can manage announcements" 
  ON public.announcements 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建管理员通知表
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用行级安全
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 管理员只能查看自己的通知
CREATE POLICY "Admins can view their own notifications" 
  ON public.admin_notifications 
  FOR SELECT 
  USING (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- 管理员可以更新自己的通知状态
CREATE POLICY "Admins can update their own notifications" 
  ON public.admin_notifications 
  FOR UPDATE 
  USING (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
