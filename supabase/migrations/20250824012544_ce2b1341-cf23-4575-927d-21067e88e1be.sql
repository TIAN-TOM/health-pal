-- 创建用户道具库存表，用于存储用户拥有的道具数量
CREATE TABLE public.user_item_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- 启用RLS
ALTER TABLE public.user_item_inventory ENABLE ROW LEVEL SECURITY;

-- 创建RLS政策
CREATE POLICY "Users can view their own inventory" 
ON public.user_item_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" 
ON public.user_item_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" 
ON public.user_item_inventory 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 管理员可以查看所有道具库存
CREATE POLICY "Admins can view all inventory" 
ON public.user_item_inventory 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 创建触发器更新updated_at
CREATE TRIGGER update_user_item_inventory_updated_at
BEFORE UPDATE ON public.user_item_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 修改daily_checkins表，添加补签标识
ALTER TABLE public.daily_checkins 
ADD COLUMN is_makeup BOOLEAN NOT NULL DEFAULT FALSE;