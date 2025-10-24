// 简化服务，减少数据库操作，游戏移动通过 Broadcast 实时同步
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface GomokuGameState {
  board: (string | null)[][];
  currentPlayer: 'host' | 'guest';
  status: 'waiting' | 'playing' | 'finished' | 'abandoned';
  winner: 'host' | 'guest' | 'draw' | null;
  moveHistory: Array<{
    row: number;
    col: number;
    player: 'host' | 'guest';
    timestamp: string;
  }>;
  lastMove?: {
    row: number;
    col: number;
  };
}

export interface GomokuRoom {
  id: string;
  room_code: string;
  host_id: string;
  guest_id: string | null;
  game_state: GomokuGameState;
  status: 'waiting' | 'playing' | 'finished' | 'abandoned';
  created_at: string;
  updated_at: string;
}

// 生成6位随机房间码
export const generateRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// 初始化游戏状态
export const createInitialGameState = (): GomokuGameState => {
  return {
    board: Array(15).fill(null).map(() => Array(15).fill(null)),
    currentPlayer: 'host',
    status: 'waiting',
    winner: null,
    moveHistory: []
  };
};

// 创建游戏房间
export const createGomokuRoom = async (): Promise<{ room: GomokuRoom | null; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { room: null, error: '用户未登录' };
    }

    const roomCode = generateRoomCode();
    const gameState = createInitialGameState();

    console.log('🎮 创建房间 - 用户:', user.id, '房间码:', roomCode);

    const { data, error } = await supabase
      .from('gomoku_rooms')
      .insert({
        room_code: roomCode,
        host_id: user.id,
        game_state: gameState as unknown as Json,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ 创建房间失败:', error);
      return { room: null, error: '创建房间失败: ' + error.message };
    }

    const room: GomokuRoom = {
      ...data,
      game_state: data.game_state as unknown as GomokuGameState,
      status: data.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
    };

    console.log('✅ 房间创建成功:', room.room_code);
    return { room };
  } catch (err) {
    console.error('❌ 创建房间错误:', err);
    return { room: null, error: '创建房间失败' };
  }
};

// 加入游戏房间
export const joinGomokuRoom = async (roomCode: string): Promise<{ room: GomokuRoom | null; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { room: null, error: '用户未登录' };
    }

    console.log('🚪 加入房间 - 用户:', user.id, '房间码:', roomCode);

    // 查找房间
    const { data: rooms, error: findError } = await supabase
      .from('gomoku_rooms')
      .select()
      .eq('room_code', roomCode.toUpperCase())
      .order('created_at', { ascending: false });

    if (findError) {
      console.error('❌ 查找房间失败:', findError);
      return { room: null, error: '查找房间失败: ' + findError.message };
    }

    if (!rooms || rooms.length === 0) {
      return { room: null, error: '房间不存在' };
    }

    // 找到第一个可用房间
    const room = rooms.find(r => r.status === 'waiting' && !r.guest_id) || rooms[0];

    if (!room) {
      return { room: null, error: '没有找到可用房间' };
    }

    // 如果是房主，直接返回
    if (room.host_id === user.id) {
      const finalRoom: GomokuRoom = {
        ...room,
        game_state: room.game_state as unknown as GomokuGameState,
        status: room.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
      };
      return { room: finalRoom };
    }

    // 如果房间已满
    if (room.guest_id && room.guest_id !== user.id) {
      return { room: null, error: '房间已满' };
    }

    // 如果已经是成员，直接返回
    if (room.guest_id === user.id) {
      const finalRoom: GomokuRoom = {
        ...room,
        game_state: room.game_state as unknown as GomokuGameState,
        status: room.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
      };
      return { room: finalRoom };
    }

    // 加入房间并开始游戏
    const existingGameState = room.game_state as unknown as GomokuGameState;
    const newGameState: GomokuGameState = {
      ...existingGameState,
      status: 'playing'
    };

    console.log('➕ 添加客人并开始游戏');

    const { data: updatedRooms, error: updateError } = await supabase
      .from('gomoku_rooms')
      .update({
        guest_id: user.id,
        game_state: newGameState as unknown as Json,
        status: 'playing'
      })
      .eq('id', room.id)
      .select();

    if (updateError) {
      console.error('❌ 加入房间失败:', updateError);
      return { room: null, error: '加入房间失败: ' + updateError.message };
    }

    if (!updatedRooms || updatedRooms.length === 0) {
      return { room: null, error: '更新房间失败' };
    }

    const updatedRoom = updatedRooms[0];
    const finalRoom: GomokuRoom = {
      ...updatedRoom,
      game_state: updatedRoom.game_state as unknown as GomokuGameState,
      status: updatedRoom.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
    };

    console.log('✅ 成功加入房间');
    return { room: finalRoom };
  } catch (err) {
    console.error('❌ 加入房间错误:', err);
    return { room: null, error: '加入房间失败' };
  }
};

// 通过房间码获取房间信息
export const getRoomByCode = async (roomCode: string): Promise<{ room: GomokuRoom | null; error?: string }> => {
  try {
    console.log('🔍 查找房间:', roomCode.toUpperCase());

    const { data, error } = await supabase
      .from('gomoku_rooms')
      .select()
      .eq('room_code', roomCode.toUpperCase())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ 查找房间失败:', error);
      return { room: null, error: '查找房间失败: ' + error.message };
    }

    if (!data || data.length === 0) {
      console.log('⚠️ 房间不存在:', roomCode.toUpperCase());
      return { room: null, error: '房间不存在' };
    }

    const roomData = data[0];
    const room: GomokuRoom = {
      ...roomData,
      game_state: roomData.game_state as unknown as GomokuGameState,
      status: roomData.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
    };

    console.log('✅ 找到房间:', room.room_code);
    return { room };
  } catch (err) {
    console.error('❌ 获取房间错误:', err);
    return { room: null, error: '获取房间信息失败' };
  }
};

// 保存游戏结果（仅在游戏结束时调用）
export const finishGame = async (
  roomId: string, 
  gameState: GomokuGameState
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('💾 保存游戏结果:', { roomId, winner: gameState.winner });
    
    const { error } = await supabase
      .from('gomoku_rooms')
      .update({
        game_state: gameState as unknown as Json,
        status: gameState.status
      })
      .eq('id', roomId);

    if (error) {
      console.error('❌ 保存游戏结果失败:', error);
      return { success: false, error: '保存游戏结果失败' };
    }

    console.log('✅ 游戏结果已保存');
    return { success: true };
  } catch (err) {
    console.error('❌ 保存游戏结果错误:', err);
    return { success: false, error: '保存游戏结果失败' };
  }
};
