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

interface DatabaseGomokuRoom {
  id: string;
  room_code: string;
  host_id: string;
  guest_id: string | null;
  game_state: Json;
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
export const createGomokuRoom = async (): Promise<{ room: GomokuRoom; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { room: null as any, error: '用户未登录' };
    }

    const roomCode = generateRoomCode();
    const gameState = createInitialGameState();

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
      console.error('创建房间失败:', error);
      return { room: null as any, error: '创建房间失败' };
    }

    const room: GomokuRoom = {
      ...data,
      game_state: data.game_state as unknown as GomokuGameState,
      status: data.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
    };

    return { room };
  } catch (err) {
    console.error('创建房间错误:', err);
    return { room: null as any, error: '创建房间失败' };
  }
};

// 加入游戏房间
export const joinGomokuRoom = async (roomCode: string): Promise<{ room: GomokuRoom; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { room: null as any, error: '用户未登录' };
    }

    // 先查找房间
    const { data: room, error: findError } = await supabase
      .from('gomoku_rooms')
      .select()
      .eq('room_code', roomCode.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (findError || !room) {
      return { room: null as any, error: '房间不存在或已开始游戏' };
    }

    if (room.host_id === user.id) {
      return { room: null as any, error: '不能加入自己创建的房间' };
    }

    if (room.guest_id) {
      return { room: null as any, error: '房间已满' };
    }

    // 更新房间，添加客人并开始游戏
    const existingGameState = room.game_state as unknown as GomokuGameState;
    const newGameState: GomokuGameState = {
      ...existingGameState,
      status: 'playing'
    };

    const { data: updatedRoom, error: updateError } = await supabase
      .from('gomoku_rooms')
      .update({
        guest_id: user.id,
        game_state: newGameState as unknown as Json,
        status: 'playing'
      })
      .eq('id', room.id)
      .select()
      .single();

    if (updateError) {
      console.error('加入房间失败:', updateError);
      return { room: null as any, error: '加入房间失败' };
    }

    const finalRoom: GomokuRoom = {
      ...updatedRoom,
      game_state: updatedRoom.game_state as unknown as GomokuGameState,
      status: updatedRoom.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
    };

    return { room: finalRoom };
  } catch (err) {
    console.error('加入房间错误:', err);
    return { room: null as any, error: '加入房间失败' };
  }
};

// 获取房间信息
export const getGomokuRoom = async (roomId: string): Promise<{ room: GomokuRoom; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('gomoku_rooms')
      .select()
      .eq('id', roomId)
      .single();

    if (error) {
      return { room: null as any, error: '获取房间信息失败' };
    }

    const room: GomokuRoom = {
      ...data,
      game_state: data.game_state as unknown as GomokuGameState,
      status: data.status as 'waiting' | 'playing' | 'finished' | 'abandoned'
    };

    return { room };
  } catch (err) {
    console.error('获取房间错误:', err);
    return { room: null as any, error: '获取房间信息失败' };
  }
};

// 更新游戏状态
export const updateGameState = async (
  roomId: string, 
  gameState: GomokuGameState
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('gomoku_rooms')
      .update({
        game_state: gameState as unknown as Json,
        status: gameState.status
      })
      .eq('id', roomId);

    if (error) {
      console.error('更新游戏状态失败:', error);
      return { success: false, error: '更新游戏状态失败' };
    }

    return { success: true };
  } catch (err) {
    console.error('更新游戏状态错误:', err);
    return { success: false, error: '更新游戏状态失败' };
  }
};

// 下棋
export const makeMove = async (
  roomId: string,
  row: number,
  col: number,
  player: 'host' | 'guest'
): Promise<{ success: boolean; newGameState?: GomokuGameState; error?: string }> => {
  try {
    // 获取当前游戏状态
    const { room, error: getRoomError } = await getGomokuRoom(roomId);
    if (getRoomError || !room) {
      return { success: false, error: '获取房间信息失败' };
    }

    const gameState = room.game_state;

    // 验证游戏状态
    if (gameState.status !== 'playing') {
      return { success: false, error: '游戏未开始或已结束' };
    }

    if (gameState.currentPlayer !== player) {
      return { success: false, error: '不是你的回合' };
    }

    if (gameState.board[row][col] !== null) {
      return { success: false, error: '该位置已有棋子' };
    }

    // 更新棋盘
    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = player;

    // 检查是否获胜
    const isWin = checkWinner(newBoard, row, col, player);
    const isBoardFull = newBoard.every(row => row.every(cell => cell !== null));

    const newGameState: GomokuGameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: player === 'host' ? 'guest' : 'host',
      winner: isWin ? player : (isBoardFull ? 'draw' : null),
      status: isWin || isBoardFull ? 'finished' : 'playing',
      lastMove: { row, col },
      moveHistory: [
        ...gameState.moveHistory,
        {
          row,
          col,
          player,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const { success, error } = await updateGameState(roomId, newGameState);
    if (!success) {
      return { success: false, error };
    }

    return { success: true, newGameState };
  } catch (err) {
    console.error('下棋错误:', err);
    return { success: false, error: '下棋失败' };
  }
};

// 检查获胜条件
const checkWinner = (board: (string | null)[][], row: number, col: number, player: string): boolean => {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    
    // 向一个方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
          board[newRow][newCol] === player) {
        count++;
      } else {
        break;
      }
    }
    
    // 向相反方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
          board[newRow][newCol] === player) {
        count++;
      } else {
        break;
      }
    }
    
    if (count >= 5) {
      return true;
    }
  }
  
  return false;
};

// 离开房间
export const leaveRoom = async (roomId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '用户未登录' };
    }

    const { room, error: getRoomError } = await getGomokuRoom(roomId);
    if (getRoomError || !room) {
      return { success: false, error: '获取房间信息失败' };
    }

    // 如果是房主离开，删除房间
    if (room.host_id === user.id) {
      const { error } = await supabase
        .from('gomoku_rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        return { success: false, error: '删除房间失败' };
      }
    } else {
      // 如果是客人离开，设置游戏为放弃状态
      const newGameState: GomokuGameState = {
        ...room.game_state,
        status: 'abandoned'
      };

      const { error } = await supabase
        .from('gomoku_rooms')
        .update({
          guest_id: null,
          game_state: newGameState as unknown as Json,
          status: 'abandoned'
        })
        .eq('id', roomId);

      if (error) {
        return { success: false, error: '离开房间失败' };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('离开房间错误:', err);
    return { success: false, error: '离开房间失败' };
  }
};