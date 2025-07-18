-- 删除现有的查看策略
DROP POLICY IF EXISTS "Players can view their game rooms" ON public.gomoku_rooms;

-- 创建新的查看策略：玩家可以查看自己参与的房间，或者通过房间码查看等待状态的房间
CREATE POLICY "Players can view accessible rooms" 
ON public.gomoku_rooms 
FOR SELECT 
USING (
  (auth.uid() = host_id) OR 
  (auth.uid() = guest_id) OR 
  (status = 'waiting' AND guest_id IS NULL)
);