-- 更新gomoku_rooms的RLS策略，允许访客加入房间时更新
DROP POLICY IF EXISTS "Players can update their game rooms" ON public.gomoku_rooms;

CREATE POLICY "Players can update their game rooms" 
ON public.gomoku_rooms 
FOR UPDATE 
USING (
  auth.uid() = host_id OR 
  auth.uid() = guest_id OR 
  (status = 'waiting' AND guest_id IS NULL)
);