import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import {
  finishGame,
  GomokuRoom,
  GomokuGameState,
} from '@/services/gomokuRoomService';

export type GomokuPlayerRole = 'host' | 'guest';
export type GomokuConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface UseGomokuRoomParams {
  room: GomokuRoom | null;
  currentUserId: string;
  playerRole: GomokuPlayerRole;
  /** Whether the in-game realtime channel should be active. */
  active: boolean;
  /** Whether to subscribe to lobby (waiting for guest) postgres updates. */
  lobbyActive: boolean;
  soundEnabled?: boolean;
  onMoveReceived?: (newState: GomokuGameState) => void;
  onLobbyStarted?: (room: GomokuRoom) => void;
}

const checkWinner = (
  board: (string | null)[][],
  row: number,
  col: number,
  player: string,
): boolean => {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dx, dy] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const r = row + dx * i;
      const c = col + dy * i;
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === player) count++;
      else break;
    }
    for (let i = 1; i < 5; i++) {
      const r = row - dx * i;
      const c = col - dy * i;
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === player) count++;
      else break;
    }
    if (count >= 5) return true;
  }
  return false;
};

const playSound = (frequency: number, duration: number, enabled: boolean) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
};

export const useGomokuRoom = ({
  room,
  currentUserId,
  playerRole,
  active,
  lobbyActive,
  soundEnabled = true,
  onMoveReceived,
  onLobbyStarted,
}: UseGomokuRoomParams) => {
  const [gameState, setGameState] = useState<GomokuGameState | null>(
    room?.game_state ?? null,
  );
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<GomokuConnectionStatus>('disconnected');
  const [opponentOnline, setOpponentOnline] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const gameStateRef = useRef<GomokuGameState | null>(null);
  const { toast } = useToast();

  // Sync ref with latest state for use inside broadcast callbacks
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Sync external room game_state into local state when room changes
  useEffect(() => {
    if (room?.game_state) {
      setGameState(room.game_state);
    }
  }, [room?.id]);

  // Realtime in-game channel (presence + broadcast)
  useEffect(() => {
    if (!room || !currentUserId || !active) return;

    console.log('🔌 建立实时连接:', room.room_code);
    setConnectionStatus('connecting');

    const channel = supabase.channel(`gomoku:${room.room_code}`, {
      config: {
        broadcast: { self: false },
        presence: { key: currentUserId },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = Object.keys(state);
        const opponentId = playerRole === 'host' ? room.guest_id : room.host_id;
        setOpponentOnline(onlineUsers.includes(opponentId || ''));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        const opponentId = playerRole === 'host' ? room.guest_id : room.host_id;
        if (key === opponentId) setOpponentOnline(true);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        const opponentId = playerRole === 'host' ? room.guest_id : room.host_id;
        if (key === opponentId) {
          setOpponentOnline(false);
          toast({
            title: '对手已离线',
            description: '等待对手重新连接...',
            variant: 'destructive',
          });
        }
      });

    channel.on('broadcast', { event: 'move' }, ({ payload }) => {
      const { row, col, player, moveIndex } = payload as {
        row: number;
        col: number;
        player: GomokuPlayerRole;
        moveIndex: number;
      };
      const currentState = gameStateRef.current;
      if (!currentState) return;
      if (currentState.moveHistory.length >= moveIndex + 1) return;

      const newBoard = currentState.board.map((r) => [...r]);
      newBoard[row][col] = player;

      const isWin = checkWinner(newBoard, row, col, player);
      const isBoardFull = newBoard.every((r) => r.every((cell) => cell !== null));

      const newGameState: GomokuGameState = {
        ...currentState,
        board: newBoard,
        currentPlayer: player === 'host' ? 'guest' : 'host',
        winner: isWin ? player : isBoardFull ? 'draw' : null,
        status: isWin || isBoardFull ? 'finished' : 'playing',
        lastMove: { row, col },
        moveHistory: [
          ...currentState.moveHistory,
          { row, col, player, timestamp: new Date().toISOString() },
        ],
      };

      setGameState(newGameState);
      setIsMyTurn(newGameState.currentPlayer === playerRole);
      playSound(440, 0.1, soundEnabled);

      if (newGameState.status === 'finished') {
        if (newGameState.winner === playerRole) {
          playSound(523, 0.5, soundEnabled);
          toast({ title: '🎉 恭喜获胜！', description: '你在多人对战中获得了胜利！' });
        } else if (newGameState.winner === 'draw') {
          toast({ title: '🤝 平局', description: '这是一场精彩的对局！' });
        } else {
          playSound(196, 0.5, soundEnabled);
          toast({ title: '😔 游戏结束', description: '对手获得了胜利，再试一次吧！' });
        }
        finishGame(room.id, newGameState);
      }

      onMoveReceived?.(newGameState);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: currentUserId,
          role: playerRole,
          online_at: new Date().toISOString(),
        });
        setConnectionStatus('connected');
      } else if (status === 'CLOSED') {
        setConnectionStatus('disconnected');
      }
    });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
      setConnectionStatus('disconnected');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, currentUserId, playerRole, active]);

  // Lobby channel: wait for guest to join via postgres_changes
  useEffect(() => {
    if (!room || !lobbyActive) return;

    const channel = supabase
      .channel(`gomoku-lobby:${room.room_code}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gomoku_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updatedRoom = payload.new as GomokuRoom;
          if (
            updatedRoom.game_state.status === 'playing' &&
            updatedRoom.guest_id
          ) {
            setGameState(updatedRoom.game_state);
            setIsMyTurn(updatedRoom.game_state.currentPlayer === playerRole);
            toast({
              title: '🎮 游戏开始！',
              description: '对手已加入，开始对战！',
            });
            onLobbyStarted?.(updatedRoom);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, lobbyActive, playerRole]);

  // Send a local move and broadcast
  const sendMove = useCallback(
    async (row: number, col: number): Promise<boolean> => {
      const current = gameStateRef.current;
      if (!current || !channelRef.current || !room) return false;
      if (current.status !== 'playing') return false;
      if (current.board[row][col] !== null) return false;

      setIsMyTurn(false);
      const newBoard = current.board.map((r) => [...r]);
      newBoard[row][col] = playerRole;
      const isWin = checkWinner(newBoard, row, col, playerRole);
      const isBoardFull = newBoard.every((r) => r.every((cell) => cell !== null));

      const newGameState: GomokuGameState = {
        ...current,
        board: newBoard,
        currentPlayer: playerRole === 'host' ? 'guest' : 'host',
        winner: isWin ? playerRole : isBoardFull ? 'draw' : null,
        status: isWin || isBoardFull ? 'finished' : 'playing',
        lastMove: { row, col },
        moveHistory: [
          ...current.moveHistory,
          { row, col, player: playerRole, timestamp: new Date().toISOString() },
        ],
      };

      setGameState(newGameState);
      playSound(440, 0.1, soundEnabled);

      try {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'move',
          payload: {
            row,
            col,
            player: playerRole,
            moveIndex: newGameState.moveHistory.length - 1,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('❌ 广播失败:', error);
        setGameState(current);
        setIsMyTurn(true);
        toast({
          title: '网络错误',
          description: '移动发送失败，请重试',
          variant: 'destructive',
        });
        return false;
      }

      if (newGameState.status === 'finished') {
        if (newGameState.winner === playerRole) {
          playSound(523, 0.5, soundEnabled);
          toast({ title: '🎉 恭喜获胜！', description: '你在多人对战中获得了胜利！' });
        } else if (newGameState.winner === 'draw') {
          toast({ title: '🤝 平局', description: '这是一场精彩的对局！' });
        }
        await finishGame(room.id, newGameState);
      } else {
        setIsMyTurn(newGameState.currentPlayer === playerRole);
      }
      return true;
    },
    [playerRole, room, soundEnabled, toast],
  );

  // Manually push state into the hook (e.g. on initial join with playing status)
  const initializeGameState = useCallback(
    (state: GomokuGameState, role: GomokuPlayerRole) => {
      setGameState(state);
      setIsMyTurn(state.currentPlayer === role);
    },
    [],
  );

  // Disconnect (used on leave)
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setOpponentOnline(false);
    setConnectionStatus('disconnected');
    setGameState(null);
    setIsMyTurn(false);
  }, []);

  return {
    gameState,
    isMyTurn,
    connectionStatus,
    opponentOnline,
    sendMove,
    initializeGameState,
    disconnect,
    setIsMyTurn,
  };
};
