-- 添加用户删除自己打卡记录的权限
CREATE POLICY "Users can delete their own checkins" 
ON public.daily_checkins 
FOR DELETE 
USING (auth.uid() = user_id);