
-- 修复教育文章表的行级安全策略
-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Anyone can read education articles" ON public.education_articles;

-- 重新创建正确的策略
-- 所有认证用户可以读取教育文章
CREATE POLICY "Authenticated users can read education articles" 
ON public.education_articles 
FOR SELECT 
TO authenticated 
USING (true);

-- 只有管理员可以创建、更新和删除教育文章
CREATE POLICY "Admins can manage education articles" 
ON public.education_articles 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
