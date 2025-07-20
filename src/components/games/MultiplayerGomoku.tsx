import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Share2, Copy, UserCheck, Clock, Trophy, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  createGomokuRoom, 
  joinGomokuRoom, 
  makeMove, 
  leaveRoom,
  getRoomByCode,
  GomokuRoom, 
  GomokuGameState 
} from '@/services/gomokuRoomService';

interface MultiplayerGomokuProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

type GameMode = 'menu' | 'lobby' | 'game';

const BOARD_SIZE = 15;

const MultiplayerGomoku = ({ onBack, soundEnabled = true }: MultiplayerGomokuProps) => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [room, setRoom] = useState<GomokuRoom | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [playerRole, setPlayerRole] = useState<'host' | 'guest'>('host');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 获取当前用户
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        console.log('当前用户ID:', user.id);
      } else {
        toast({
          title: "需要登录",
          description: "请先登录后再进行游戏",
          variant: "destructive",
        });
      }
    };
    getCurrentUser();
  }, [toast]);

  // 音效函数
  const playSound = useCallback((frequency: number, duration: number) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio context not available');
    }
  }, [soundEnabled]);

  // 实时订阅房间更新
  useEffect(() => {
    if (!room || !currentUserId) return;

    console.log('订阅房间更新:', room.id);
    setConnectionStatus('connecting');
    
    const channel = supabase
      .channel(`gomoku-room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gomoku_rooms',
          filter: `id=eq.${room.id}`
        },
        (payload) => {
          console.log('收到房间更新:', payload);
          const updatedRoom = payload.new as GomokuRoom;
          setRoom(updatedRoom);
          
          // 检查是否轮到当前玩家
          const role = updatedRoom.host_id === currentUserId ? 'host' : 'guest';
          setPlayerRole(role);
          setIsMyTurn(updatedRoom.game_state.currentPlayer === role);
          
          // 如果游戏状态从waiting变为playing，切换到游戏界面
          if (room.game_state.status === 'waiting' && updatedRoom.game_state.status === 'playing') {
            setGameMode('game');
            
            // 根据用户角色显示不同的消息
            const isHost = updatedRoom.host_id === currentUserId;
            toast({
              title: "🎮 游戏开始！",
              description: isHost ? "对手已加入，开始对战！" : "成功加入房间，开始对战！",
            });
          }
          
          // 播放下棋音效
          if (updatedRoom.game_state.moveHistory.length > room.game_state.moveHistory.length) {
            playSound(440, 0.1);
          }
          
          // 检查游戏结束
          if (updatedRoom.game_state.status === 'finished') {
            if (updatedRoom.game_state.winner === role) {
              playSound(523, 0.5);
              toast({
                title: "🎉 恭喜获胜！",
                description: "你在多人对战中获得了胜利！",
              });
            } else if (updatedRoom.game_state.winner === 'draw') {
              toast({
                title: "🤝 平局",
                description: "这是一场精彩的对局！",
              });
            } else {
              playSound(196, 0.5);
              toast({
                title: "😔 游戏结束",
                description: "对手获得了胜利，再试一次吧！",
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('订阅状态:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      console.log('取消订阅房间:', room.id);
      supabase.removeChannel(channel);
      setConnectionStatus('disconnected');
    };
  }, [room, currentUserId, playSound, toast]);

  // 创建房间
  const handleCreateRoom = async () => {
    if (!currentUserId) {
      toast({
        title: "需要登录",
        description: "请先登录后再创建房间",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('开始创建房间...');
    
    const { room: newRoom, error } = await createGomokuRoom();
    
    setIsLoading(false);
    
    if (error || !newRoom) {
      toast({
        title: "创建房间失败",
        description: error || '未知错误',
        variant: "destructive",
      });
      return;
    }

    setRoom(newRoom);
    setPlayerRole('host');
    setGameMode('lobby');
    console.log('房间创建成功:', newRoom);
    toast({
      title: "房间创建成功！",
      description: `房间码: ${newRoom.room_code}`,
    });
  };

  // 加入房间
  const handleJoinRoom = async () => {
    if (!currentUserId) {
      toast({
        title: "需要登录",
        description: "请先登录后再加入房间",
        variant: "destructive",
      });
      return;
    }

    if (!roomCodeInput.trim()) {
      toast({
        title: "请输入房间码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('尝试加入房间:', roomCodeInput.trim());

    // 首先检查房间是否存在
    const { room: existingRoom, error: checkError } = await getRoomByCode(roomCodeInput.trim());
    
    if (checkError || !existingRoom) {
      setIsLoading(false);
      toast({
        title: "房间不存在",
        description: "请检查房间码是否正确",
        variant: "destructive",
      });
      return;
    }

    console.log('找到房间:', existingRoom);

    const { room: joinedRoom, error } = await joinGomokuRoom(roomCodeInput.trim());
    
    setIsLoading(false);
    
    if (error || !joinedRoom) {
      toast({
        title: "加入房间失败",
        description: error || '未知错误',
        variant: "destructive",
      });
      return;
    }

    setRoom(joinedRoom);
    setPlayerRole('guest');
    
    // 根据游戏状态设置模式
    if (joinedRoom.game_state.status === 'playing') {
      setGameMode('game');
      const role = joinedRoom.host_id === currentUserId ? 'host' : 'guest';
      setPlayerRole(role);
      setIsMyTurn(joinedRoom.game_state.currentPlayer === role);
    } else {
      setGameMode('lobby');
    }
    
    console.log('成功加入房间:', joinedRoom);
    toast({
      title: "成功加入房间！",
      description: joinedRoom.game_state.status === 'playing' ? "游戏进行中" : "等待游戏开始",
    });
  };

  // 复制房间码
  const handleCopyRoomCode = async () => {
    if (!room) return;
    
    try {
      await navigator.clipboard.writeText(room.room_code);
      toast({
        title: "房间码已复制！",
        description: "分享给朋友加入游戏",
      });
    } catch (err) {
      // 降级处理
      const textArea = document.createElement('textarea');
      textArea.value = room.room_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "房间码已复制！",
        description: "分享给朋友加入游戏",
      });
    }
  };

  // 下棋
  const handleCellClick = async (row: number, col: number) => {
    if (!room || !isMyTurn || room.game_state.status !== 'playing') return;
    if (room.game_state.board[row][col] !== null) return;

    console.log('尝试下棋:', row, col, playerRole);
    const { success, error } = await makeMove(room.id, row, col, playerRole);
    if (!success) {
      toast({
        title: "下棋失败",
        description: error,
        variant: "destructive",
      });
    }
  };

  // 离开房间
  const handleLeaveRoom = async () => {
    if (!room) return;

    const { success, error } = await leaveRoom(room.id);
    if (!success) {
      toast({
        title: "离开房间失败",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setRoom(null);
    setGameMode('menu');
    toast({
      title: "已离开房间",
    });
  };

  // 检查游戏是否开始
  useEffect(() => {
    if (room && room.game_state.status === 'playing' && gameMode === 'lobby') {
      setGameMode('game');
      const role = room.host_id === currentUserId ? 'host' : 'guest';
      setPlayerRole(role);
      setIsMyTurn(room.game_state.currentPlayer === role);
    }
  }, [room, gameMode, currentUserId]);

  // 渲染主菜单
  if (gameMode === 'menu') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              多人五子棋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCreateRoom} 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isLoading || !currentUserId}
            >
              {isLoading ? '创建中...' : '创建房间'}
            </Button>
            
            <div className="space-y-2">
              <Input
                placeholder="输入房间码"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg tracking-wider"
                disabled={isLoading}
              />
              <Button 
                onClick={handleJoinRoom} 
                variant="outline" 
                className="w-full"
                disabled={!roomCodeInput.trim() || isLoading || !currentUserId}
              >
                {isLoading ? '加入中...' : '加入房间'}
              </Button>
            </div>

            {!currentUserId && (
              <div className="text-center text-sm text-red-600 p-2 bg-red-50 rounded">
                请先登录账号才能进行多人游戏
              </div>
            )}

            <div className="text-center text-sm text-gray-600 space-y-1">
              <p>• 创建房间后分享房间码给朋友</p>
              <p>• 朋友输入房间码即可加入对战</p>
              <p>• 黑子先手，连续5子获胜</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染等待大厅
  if (gameMode === 'lobby' && room) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">等待对手加入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Share2 className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">房间码</span>
              </div>
              
              <div 
                className="text-3xl font-bold tracking-wider cursor-pointer bg-gray-50 py-3 px-6 rounded-lg border-2 border-dashed hover:bg-gray-100"
                onClick={handleCopyRoomCode}
              >
                {room.room_code}
              </div>
              
              <Button 
                onClick={handleCopyRoomCode} 
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                复制房间码
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Clock className="h-4 w-4 animate-pulse" />
              <span className="text-sm">等待对手加入...</span>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleLeaveRoom} 
                variant="outline" 
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                离开房间
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染游戏界面
  if (gameMode === 'game' && room) {
    const gameState = room.game_state;
    const isHost = playerRole === 'host';
    const opponentConnected = room.guest_id !== null;

    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                  {connectionStatus === 'connected' ? '已连接' : '连接中...'}
                </Badge>
                <span className="text-sm text-gray-600">房间: {room.room_code}</span>
              </div>
              
              <CardTitle className="text-center">多人五子棋</CardTitle>
              
              <Button 
                onClick={handleLeaveRoom} 
                variant="outline" 
                size="sm"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-black rounded-full border"></div>
                  <span>{isHost ? '你' : '对手'}</span>
                  {isHost && <UserCheck className="h-3 w-3 text-green-500" />}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-400"></div>
                  <span>{isHost ? '对手' : '你'}</span>
                  {!isHost && <UserCheck className="h-3 w-3 text-green-500" />}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {gameState.status === 'finished' && (
              <div className="text-center mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {gameState.winner === playerRole ? '🎉 你获胜了！' : 
                   gameState.winner === 'draw' ? '🤝 平局！' : '😔 对手获胜了'}
                </h3>
              </div>
            )}

            {!opponentConnected && (
              <div className="text-center mb-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-700">等待对手重新连接...</p>
              </div>
            )}
            
            {gameState.status === 'playing' && opponentConnected && (
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  {isMyTurn ? 
                    `轮到你了 (${isHost ? '黑子' : '白子'})` : 
                    `对手思考中... (${isHost ? '白子' : '黑子'})`
                  }
                </p>
                {gameState.lastMove && (
                  <p className="text-xs text-blue-600 mt-1">
                    上一步：{gameState.lastMove.row + 1}行 {gameState.lastMove.col + 1}列
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-center mb-4">
              <div className="relative bg-amber-100 p-4 rounded-lg border-2 border-amber-200">
                <svg 
                  width="300" 
                  height="300" 
                  className="border border-amber-300 bg-amber-50"
                  viewBox="0 0 300 300"
                >
                  {/* 绘制棋盘网格线 */}
                  {Array.from({ length: BOARD_SIZE }, (_, i) => (
                    <g key={`line-${i}`}>
                      {/* 横线 */}
                      <line
                        x1="10"
                        y1={10 + i * 20}
                        x2="290"
                        y2={10 + i * 20}
                        stroke="#8B4513"
                        strokeWidth="1"
                      />
                      {/* 竖线 */}
                      <line
                        x1={10 + i * 20}
                        y1="10"
                        x2={10 + i * 20}
                        y2="290"
                        stroke="#8B4513"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                  
                  {/* 绘制棋子 */}
                  {gameState.board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      if (cell === null) return null;
                      
                      const x = 10 + colIndex * 20;
                      const y = 10 + rowIndex * 20;
                      const isBlack = cell === 'host';
                      
                      return (
                        <circle
                          key={`piece-${rowIndex}-${colIndex}`}
                          cx={x}
                          cy={y}
                          r="8"
                          fill={isBlack ? '#000000' : '#FFFFFF'}
                          stroke={isBlack ? '#333333' : '#666666'}
                          strokeWidth="1"
                        />
                      );
                    })
                  )}
                  
                  {/* 交互区域 */}
                  {gameState.board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const x = 10 + colIndex * 20;
                      const y = 10 + rowIndex * 20;
                      
                      return (
                        <circle
                          key={`click-${rowIndex}-${colIndex}`}
                          cx={x}
                          cy={y}
                          r="10"
                          fill="transparent"
                          className="cursor-pointer hover:fill-blue-100 hover:fill-opacity-30"
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          style={{
                            pointerEvents: gameState.status !== 'playing' || !isMyTurn || !opponentConnected ? 'none' : 'auto'
                          }}
                        />
                      );
                    })
                  )}
                </svg>
              </div>
            </div>

            <div className="text-center text-xs text-gray-600">
              <p>在线条交叉点放置棋子，连续5个即可获胜</p>
              <p>步数: {gameState.moveHistory.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default MultiplayerGomoku;
