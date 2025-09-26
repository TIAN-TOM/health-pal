-- 为管理员添加更新用户资料的权限，特别是状态字段
CREATE POLICY "Admins can update user profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));