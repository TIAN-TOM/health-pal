-- 创建多人游戏房间表
CREATE TABLE public.gomoku_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  guest_id UUID NULL,
  game_state JSONB NOT NULL DEFAULT '{"board": [], "currentPlayer": "host", "status": "waiting", "winner": null, "moveHistory": []}',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.gomoku_rooms ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Players can view their game rooms" 
ON public.gomoku_rooms 
FOR SELECT 
USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Host can create rooms" 
ON public.gomoku_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Players can update their game rooms" 
ON public.gomoku_rooms 
FOR UPDATE 
USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Host can delete rooms" 
ON public.gomoku_rooms 
FOR DELETE 
USING (auth.uid() = host_id);

-- 创建更新时间触发器
CREATE TRIGGER update_gomoku_rooms_updated_at
BEFORE UPDATE ON public.gomoku_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 创建索引
CREATE INDEX idx_gomoku_rooms_room_code ON public.gomoku_rooms(room_code);
CREATE INDEX idx_gomoku_rooms_status ON public.gomoku_rooms(status);
CREATE INDEX idx_gomoku_rooms_host_id ON public.gomoku_rooms(host_id);
CREATE INDEX idx_gomoku_rooms_guest_id ON public.gomoku_rooms(guest_id);

-- 启用实时功能
ALTER TABLE public.gomoku_rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gomoku_rooms;