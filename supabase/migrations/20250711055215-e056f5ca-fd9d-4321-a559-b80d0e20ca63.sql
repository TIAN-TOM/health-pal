-- 确保管理员可以删除用户角色记录
CREATE POLICY "Admins can delete user roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));