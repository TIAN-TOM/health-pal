-- 启用gomoku_rooms表的实时更新
ALTER TABLE public.gomoku_rooms REPLICA IDENTITY FULL;

-- 将gomoku_rooms表添加到实时发布
ALTER PUBLICATION supabase_realtime ADD TABLE public.gomoku_rooms;