import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Trophy, Bomb, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, Clock, Flame, Zap, Footprints, Coins } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { awardGameCompletionBonus } from '@/services/pointsService';
import { toast } from '@/hooks/use-toast';
import {
  ROWS,
  COLS,
  TICK_MS,
  BOMB_FUSE_TICKS,
  EXPLOSION_TICKS,
  PLAYER_BASE_MOVE_TICKS,
  BOMB_KICK_MOVE_TICKS,
  POWER_UP_LABEL,
  type CellType,
  type Direction,
  type PowerUp,
  type BombEntity,
  type Explosion,
  type Enemy,
  type LevelConfig,
} from '@/components/games/bomberPop/types';
import { buildLevel } from '@/components/games/bomberPop/levelConfig';
import { generateMap } from '@/components/games/bomberPop/mapGenerator';
import { computeExplosionCells, computeDangerCells } from '@/components/games/bomberPop/explosion';
import { playSound } from '@/components/games/bomberPop/sound';
import {
  PixelTile,
  PixelBomb,
  PixelExplosion,
  PixelPlayer,
  PixelEnemy,
  PowerUpIcon,
} from '@/components/games/bomberPop/PixelArt';

interface BomberPopGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

const BomberPopGame = ({ onBack, soundEnabled }: BomberPopGameProps) => {
  // 关卡 / 配置
  const [levelNum, setLevelNum] = useState(1);
  const levelCfgRef = useRef<LevelConfig>(buildLevel(1));

  // 地图与对象
  const [map, setMap] = useState<CellType[][]>([]);
  const [hiddenPowerUps, setHiddenPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);
  const [player, setPlayer] = useState({ x: 1, y: 1, alive: true });
  const [bombs, setBombs] = useState<BombEntity[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  // 玩家能力
  const [maxBombs, setMaxBombs] = useState(1);
  const [bombRange, setBombRange] = useState(1);
  const [hasKick, setHasKick] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(0); // 每级 -0.4 tick

  // 状态
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // 秒
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose' | 'all-clear'>(null);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('bomber-pop-best');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [maxLevelReached, setMaxLevelReached] = useState<number>(() => {
    const saved = localStorage.getItem('bomber-pop-max-level');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);

  const playerMoveCooldownRef = useRef(0);
  const heldKeyRef = useRef<Direction | null>(null);
  const lastFacingRef = useRef<Direction>('right');
  const bombIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const tickCounterRef = useRef(0);
  const isMobile = useIsMobile();

  const sfx = useCallback((freq: number, dur: number, type: OscillatorType = 'sine') => {
    if (soundEnabled) playSound(freq, dur, type);
  }, [soundEnabled]);

  const playerMoveTicks = Math.max(1, PLAYER_BASE_MOVE_TICKS - speedLevel * 0.4);

  // === 关卡初始化 ===
  const startLevel = useCallback((level: number, keepStats: { score?: number; bombs?: number; range?: number; kick?: boolean; speed?: number } = {}) => {
    const cfg = buildLevel(level);
    levelCfgRef.current = cfg;
    const { map: newMap, powerUpSpawns, enemyPositions } = generateMap(cfg, cfg.enemyCount);
    setMap(newMap);
    setHiddenPowerUps(powerUpSpawns);
    setActivePowerUps([]);
    setPlayer({ x: 1, y: 1, alive: true });
    setBombs([]);
    setExplosions([]);
    setEnemies(enemyPositions.map((p, idx) => ({
      id: idx + 1,
      x: p.x,
      y: p.y,
      dir: 'left',
      moveCooldown: 0,
      alive: true,
      intelligence: cfg.enemyIntelligence,
    })));
    setMaxBombs(keepStats.bombs ?? 1);
    setBombRange(keepStats.range ?? 1);
    setHasKick(keepStats.kick ?? false);
    setSpeedLevel(keepStats.speed ?? 0);
    setScore(keepStats.score ?? 0);
    setTimeLeft(cfg.timeLimitSec);
    setGameOver(null);
    setLevelNum(level);
    setPointsAwarded(null);
    playerMoveCooldownRef.current = 0;
    heldKeyRef.current = null;
    tickCounterRef.current = 0;

    if (level > maxLevelReached) {
      setMaxLevelReached(level);
      localStorage.setItem('bomber-pop-max-level', String(level));
    }
  }, [maxLevelReached]);

  const startNewGame = useCallback(() => {
    setGameStarted(true);
    startLevel(1);
  }, [startLevel]);

  const nextLevel = useCallback(() => {
    startLevel(levelNum + 1, {
      score,
      bombs: maxBombs,
      range: bombRange,
      kick: hasKick,
      speed: speedLevel,
    });
  }, [levelNum, score, maxBombs, bombRange, hasKick, speedLevel, startLevel]);

  // === 玩家移动 ===
  const tryMovePlayer = useCallback((dir: Direction) => {
    setPlayer(prev => {
      if (!prev.alive) return prev;
      let { x, y } = prev;
      if (dir === 'up') y--;
      else if (dir === 'down') y++;
      else if (dir === 'left') x--;
      else if (dir === 'right') x++;
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return prev;
      if (map[y]?.[x] !== 'empty') return prev;

      // 撞炸弹：踢动 or 阻挡
      const bombHere = bombs.find(b => b.x === x && b.y === y);
      if (bombHere) {
        if (hasKick && !bombHere.vx && !bombHere.vy) {
          const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
          const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
          setBombs(prevBombs => prevBombs.map(b =>
            b.id === bombHere.id ? { ...b, vx: dx, vy: dy, moveCooldown: 0 } : b
          ));
          sfx(180, 0.1, 'square');
        }
        return prev;
      }
      lastFacingRef.current = dir;
      return { ...prev, x, y };
    });
  }, [map, bombs, hasKick, sfx]);

  // === 放炸弹 ===
  const placeBomb = useCallback(() => {
    if (!player.alive || gameOver) return;
    setBombs(prev => {
      if (prev.some(b => b.x === player.x && b.y === player.y)) return prev;
      const playerBombCount = prev.filter(b => b.ownerId === 'player').length;
      if (playerBombCount >= maxBombs) return prev;
      bombIdRef.current += 1;
      sfx(220, 0.12, 'square');
      return [...prev, {
        id: bombIdRef.current,
        x: player.x,
        y: player.y,
        timer: BOMB_FUSE_TICKS,
        range: bombRange,
        ownerId: 'player',
      }];
    });
  }, [player, gameOver, maxBombs, bombRange, sfx]);

  // === 键盘 ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      const key = e.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) { e.preventDefault(); heldKeyRef.current = 'up'; }
      else if (['arrowdown', 's'].includes(key)) { e.preventDefault(); heldKeyRef.current = 'down'; }
      else if (['arrowleft', 'a'].includes(key)) { e.preventDefault(); heldKeyRef.current = 'left'; }
      else if (['arrowright', 'd'].includes(key)) { e.preventDefault(); heldKeyRef.current = 'right'; }
      else if (key === ' ' || key === 'enter') { e.preventDefault(); placeBomb(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const dirMap: Record<string, Direction> = {
        arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
        arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
      };
      if (dirMap[key] && heldKeyRef.current === dirMap[key]) heldKeyRef.current = null;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, placeBomb]);

  // === 主循环 ===
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => {
      tickCounterRef.current += 1;

      // 倒计时（每 1000ms）
      if (tickCounterRef.current % Math.round(1000 / TICK_MS) === 0) {
        setTimeLeft(t => {
          const next = t - 1;
          if (next <= 0) {
            setGameOver('lose');
            sfx(80, 0.6, 'sawtooth');
            return 0;
          }
          return next;
        });
      }

      // 玩家持续移动
      if (heldKeyRef.current) {
        if (playerMoveCooldownRef.current <= 0) {
          tryMovePlayer(heldKeyRef.current);
          playerMoveCooldownRef.current = playerMoveTicks;
        } else {
          playerMoveCooldownRef.current--;
        }
      } else {
        playerMoveCooldownRef.current = 0;
      }

      // 处理被踢动的炸弹移动
      setBombs(prevBombs => prevBombs.map(b => {
        if (!b.vx && !b.vy) return b;
        const cd = (b.moveCooldown ?? 0) - 1;
        if (cd > 0) return { ...b, moveCooldown: cd };
        const nx = b.x + (b.vx ?? 0);
        const ny = b.y + (b.vy ?? 0);
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || map[ny][nx] !== 'empty') {
          return { ...b, vx: 0, vy: 0, moveCooldown: 0 };
        }
        // 撞炸弹/玩家/敌人 停下
        if (prevBombs.some(o => o.id !== b.id && o.x === nx && o.y === ny)) {
          return { ...b, vx: 0, vy: 0, moveCooldown: 0 };
        }
        if (player.alive && player.x === nx && player.y === ny) {
          return { ...b, vx: 0, vy: 0, moveCooldown: 0 };
        }
        if (enemies.some(e => e.alive && e.x === nx && e.y === ny)) {
          return { ...b, vx: 0, vy: 0, moveCooldown: 0 };
        }
        return { ...b, x: nx, y: ny, moveCooldown: BOMB_KICK_MOVE_TICKS };
      }));

      // 炸弹倒计时 + 引爆
      setBombs(prevBombs => {
        let workingBombs = prevBombs.map(b => ({ ...b, timer: b.timer - 1 }));
        let workingMap = map;
        const newExplosions: Explosion[] = [];
        let totalBoxes = 0;
        const revealedPowerUps: PowerUp[] = [];

        const toDetonate = new Set<number>();
        workingBombs.filter(b => b.timer <= 0).forEach(b => toDetonate.add(b.id));

        let changed = true;
        while (changed) {
          changed = false;
          for (const bombId of Array.from(toDetonate)) {
            const bomb = workingBombs.find(b => b.id === bombId);
            if (!bomb) continue;
            const { cells, destroyedBoxes, triggeredBombs } = computeExplosionCells(bomb, workingMap, workingBombs);
            const newMap = workingMap.map(row => [...row]);
            destroyedBoxes.forEach(({ x, y }) => {
              newMap[y][x] = 'empty';
              const hidden = hiddenPowerUps.find(p => p.x === x && p.y === y);
              if (hidden) revealedPowerUps.push(hidden);
            });
            workingMap = newMap;
            totalBoxes += destroyedBoxes.length;
            explosionIdRef.current += 1;
            newExplosions.push({
              id: explosionIdRef.current,
              cells,
              timer: EXPLOSION_TICKS,
            });
            triggeredBombs.forEach(cb => {
              if (!toDetonate.has(cb.id)) {
                toDetonate.add(cb.id);
                changed = true;
              }
            });
          }
        }

        if (toDetonate.size > 0) {
          sfx(80, 0.4, 'sawtooth');
          setMap(workingMap);
          setExplosions(prev => [...prev, ...newExplosions]);
          if (totalBoxes > 0) setScore(s => s + totalBoxes * 10);
          if (revealedPowerUps.length > 0) {
            setActivePowerUps(prev => [...prev, ...revealedPowerUps]);
            setHiddenPowerUps(prev => prev.filter(p => !revealedPowerUps.some(r => r.x === p.x && r.y === p.y)));
          }
          workingBombs = workingBombs.filter(b => !toDetonate.has(b.id));
        }
        return workingBombs;
      });

      setExplosions(prev => prev.map(e => ({ ...e, timer: e.timer - 1 })).filter(e => e.timer > 0));

      // === 智能敌人 ===
      setEnemies(prev => {
        const danger = computeDangerCells(bombs, map);
        return prev.map(enemy => {
          if (!enemy.alive) return enemy;
          if (enemy.moveCooldown > 0) return { ...enemy, moveCooldown: enemy.moveCooldown - 1 };

          const tryDir = (dir: Direction) => {
            let nx = enemy.x, ny = enemy.y;
            if (dir === 'up') ny--;
            else if (dir === 'down') ny++;
            else if (dir === 'left') nx--;
            else if (dir === 'right') nx++;
            if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return null;
            if (map[ny][nx] !== 'empty') return null;
            if (bombs.some(b => b.x === nx && b.y === ny)) return null;
            return { x: nx, y: ny };
          };

          const allDirs: Direction[] = ['up', 'down', 'left', 'right'];

          // 智能 1+：处于危险中，优先躲避
          if (enemy.intelligence >= 1 && danger.has(`${enemy.x},${enemy.y}`)) {
            const safeOptions = allDirs
              .map(d => ({ d, pos: tryDir(d) }))
              .filter(o => o.pos && !danger.has(`${o.pos.x},${o.pos.y}`));
            if (safeOptions.length > 0) {
              const choice = safeOptions[Math.floor(Math.random() * safeOptions.length)];
              return { ...enemy, dir: choice.d, x: choice.pos!.x, y: choice.pos!.y, moveCooldown: levelCfgRef.current.enemyMoveTicks };
            }
          }

          // 智能 2：朝玩家方向追击（贪心，只在同行/同列时）
          if (enemy.intelligence >= 2 && player.alive) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const preferred: Direction[] = [];
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx !== 0) preferred.push(dx > 0 ? 'right' : 'left');
              if (dy !== 0) preferred.push(dy > 0 ? 'down' : 'up');
            } else {
              if (dy !== 0) preferred.push(dy > 0 ? 'down' : 'up');
              if (dx !== 0) preferred.push(dx > 0 ? 'right' : 'left');
            }
            for (const d of preferred) {
              const pos = tryDir(d);
              if (pos && !danger.has(`${pos.x},${pos.y}`)) {
                return { ...enemy, dir: d, x: pos.x, y: pos.y, moveCooldown: levelCfgRef.current.enemyMoveTicks };
              }
            }
          }

          // 默认：当前方向
          const current = tryDir(enemy.dir);
          if (current && (enemy.intelligence === 0 || !danger.has(`${current.x},${current.y}`))) {
            return { ...enemy, x: current.x, y: current.y, moveCooldown: levelCfgRef.current.enemyMoveTicks };
          }
          // 随机换向
          const shuffled = [...allDirs].sort(() => Math.random() - 0.5);
          for (const d of shuffled) {
            const pos = tryDir(d);
            if (pos && (enemy.intelligence === 0 || !danger.has(`${pos.x},${pos.y}`))) {
              return { ...enemy, dir: d, x: pos.x, y: pos.y, moveCooldown: levelCfgRef.current.enemyMoveTicks };
            }
          }
          return enemy;
        });
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, map, bombs, player, enemies, hiddenPowerUps, tryMovePlayer, sfx, playerMoveTicks]);

  // === 道具拾取 ===
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const picked = activePowerUps.find(p => p.x === player.x && p.y === player.y);
    if (!picked) return;
    sfx(660, 0.18, 'sine');
    if (picked.type === 'bomb') setMaxBombs(b => Math.min(b + 1, 6));
    else if (picked.type === 'range') setBombRange(r => Math.min(r + 1, 6));
    else if (picked.type === 'kick') setHasKick(true);
    else if (picked.type === 'speed') setSpeedLevel(s => Math.min(s + 1, 3));
    setScore(s => s + 30);
    setActivePowerUps(prev => prev.filter(p => !(p.x === picked.x && p.y === picked.y)));
    toast({ title: '获得道具', description: POWER_UP_LABEL[picked.type] });
  }, [player.x, player.y, activePowerUps, gameStarted, gameOver, sfx]);

  // === 爆炸命中 ===
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const activeCells = explosions.flatMap(e => e.cells);
    if (activeCells.length === 0) return;

    if (player.alive && activeCells.some(c => c.x === player.x && c.y === player.y)) {
      sfx(120, 0.5, 'triangle');
      setPlayer(p => ({ ...p, alive: false }));
      setGameOver('lose');
    }

    setEnemies(prev => {
      let killed = 0;
      const next = prev.map(en => {
        if (!en.alive) return en;
        if (activeCells.some(c => c.x === en.x && c.y === en.y)) {
          killed++;
          return { ...en, alive: false };
        }
        return en;
      });
      if (killed > 0) {
        setScore(s => s + killed * 100);
        sfx(440, 0.2, 'triangle');
      }
      return next;
    });
  }, [explosions, player.alive, player.x, player.y, gameStarted, gameOver, sfx]);

  // 玩家碰敌人
  useEffect(() => {
    if (!gameStarted || gameOver || !player.alive) return;
    if (enemies.some(e => e.alive && e.x === player.x && e.y === player.y)) {
      sfx(120, 0.5, 'triangle');
      setPlayer(p => ({ ...p, alive: false }));
      setGameOver('lose');
    }
  }, [enemies, player, gameStarted, gameOver, sfx]);

  // 通关判断
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    if (enemies.length > 0 && enemies.every(e => !e.alive)) {
      const timeBonus = timeLeft * 5;
      setScore(s => s + 500 + timeBonus);
      sfx(660, 0.4, 'sine');
      setGameOver('win');
    }
  }, [enemies, gameStarted, gameOver, timeLeft, sfx]);

  // 最高分 + 通关积分
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bomber-pop-best', String(score));
    }
  }, [score, bestScore]);

  useEffect(() => {
    if (gameOver !== 'win' || pointsAwarded !== null) return;
    // 难度越高奖励越多：基础 5 + 关卡 * 3，封顶 50
    const reward = Math.min(5 + levelNum * 3, 50);
    setPointsAwarded(0); // 占位防止重复请求
    awardGameCompletionBonus('bomber-pop', reward, `泡泡堂第 ${levelNum} 关通关`).then(res => {
      if (res && res.awarded > 0) {
        setPointsAwarded(res.awarded);
        toast({
          title: `🎉 +${res.awarded} 积分`,
          description: `第 ${levelNum} 关通关奖励${res.dailyRemaining === 0 ? '（今日已达上限）' : ''}`,
        });
      } else {
        setPointsAwarded(0);
      }
    });
  }, [gameOver, levelNum, pointsAwarded]);

  // === 渲染 ===
  const renderCell = (cell: CellType, x: number, y: number) => {
    const isPlayer = player.alive && player.x === x && player.y === y;
    const enemyHere = enemies.find(e => e.alive && e.x === x && e.y === y);
    const bombHere = bombs.find(b => b.x === x && b.y === y);
    const explosionHere = explosions.some(e => e.cells.some(c => c.x === x && c.y === y));
    const powerUpHere = activePowerUps.find(p => p.x === x && p.y === y);

    return (
      <div
        key={`${x}-${y}`}
        className="relative overflow-hidden"
        style={{ aspectRatio: '1 / 1' }}
      >
        <PixelTile kind={cell === 'wall' ? 'wall' : cell === 'box' ? 'box' : 'grass'} />
        {powerUpHere && cell === 'empty' && !explosionHere && <PowerUpIcon type={powerUpHere.type} />}
        {bombHere && !explosionHere && <PixelBomb />}
        {explosionHere && <PixelExplosion />}
        {isPlayer && <PixelPlayer />}
        {enemyHere && !isPlayer && <PixelEnemy intelligence={enemyHere.intelligence} />}
      </div>
    );
  };

  // === 开始页 ===
  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center gap-2 text-5xl">
            <span>💣</span><span>🐰</span><span>👾</span>
          </div>
          <h2 className="text-2xl font-bold">Q版泡泡堂</h2>
          <p className="text-muted-foreground text-sm">
            操控小兔子放置泡泡炸弹，消灭所有敌人通关。多关卡逐步加难，通关有积分奖励！
          </p>
          <div className="text-left bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p>🎮 <strong>键盘：</strong>方向键/WASD 移动，空格/Enter 放炸弹</p>
            <p>📱 <strong>手机：</strong>屏幕下方虚拟按键</p>
            <p className="flex items-center gap-1"><Bomb className="h-3 w-3 text-red-500" /> 炸弹+1 &nbsp;
              <Flame className="h-3 w-3 text-orange-500" /> 范围+1 &nbsp;
              <Footprints className="h-3 w-3 text-blue-500" /> 踢炸弹 &nbsp;
              <Zap className="h-3 w-3 text-yellow-500" /> 速度+</p>
            <p>👾 紫=随机移动 / 粉=会躲炸弹 / 红=会追玩家</p>
            <p>⏱️ 关卡有倒计时，通关后保留所有道具进入下一关</p>
            <p className="flex items-center gap-1"><Coins className="h-3 w-3 text-yellow-600" /> 通关奖励真实积分（每日上限 100）</p>
          </div>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            {bestScore > 0 && (
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" /> 最高分 {bestScore}
              </span>
            )}
            {maxLevelReached > 1 && (
              <span>最高关卡 第 {maxLevelReached} 关</span>
            )}
          </div>
          <Button onClick={startNewGame} size="lg" className="w-full">
            <Bomb className="h-4 w-4 mr-2" /> 开始游戏
          </Button>
        </CardContent>
      </Card>
    );
  }

  const cfg = levelCfgRef.current;
  const timePct = (timeLeft / cfg.timeLimitSec) * 100;

  return (
    <div className="space-y-3">
      {/* HUD */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-3">
              <span className="font-bold">第 {levelNum} 关</span>
              <span className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" /> {score}
              </span>
              <span className="text-muted-foreground hidden sm:inline">最高 {bestScore}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" title="炸弹数量">
                <Bomb className="h-3.5 w-3.5 text-red-500" /> {maxBombs}
              </span>
              <span className="flex items-center gap-1" title="爆炸范围">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> {bombRange}
              </span>
              {hasKick && <Footprints className="h-3.5 w-3.5 text-blue-500" />}
              {speedLevel > 0 && (
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" /> {speedLevel}
                </span>
              )}
              <span className="text-muted-foreground">敌 {enemies.filter(e => e.alive).length}</span>
            </div>
            <Button variant="outline" size="sm" onClick={startNewGame}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> 重开
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <Progress value={timePct} className="h-2" />
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{timeLeft}s</span>
          </div>
        </CardContent>
      </Card>

      {/* 棋盘 */}
      <Card>
        <CardContent className="p-2 sm:p-3">
          <div
            className="grid gap-0 mx-auto rounded-md overflow-hidden select-none ring-2 ring-emerald-300/50"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              maxWidth: 'min(100%, 640px)',
            }}
          >
            {map.flatMap((row, y) => row.map((cell, x) => renderCell(cell, x, y)))}
          </div>

          {gameOver && (
            <div className="mt-4 text-center space-y-3">
              <div className="text-4xl">
                {gameOver === 'win' ? '🎉' : '💀'}
              </div>
              <h3 className="text-xl font-bold">
                {gameOver === 'win' ? `第 ${levelNum} 关通关！` : '游戏结束'}
              </h3>
              <p className="text-muted-foreground">本局得分：{score}</p>
              {gameOver === 'win' && pointsAwarded !== null && pointsAwarded > 0 && (
                <p className="text-yellow-600 flex items-center justify-center gap-1">
                  <Coins className="h-4 w-4" /> 已发放 {pointsAwarded} 积分
                </p>
              )}
              <div className="flex gap-2 justify-center flex-wrap">
                {gameOver === 'win' && (
                  <Button onClick={nextLevel}>
                    <Flame className="h-4 w-4 mr-2" /> 下一关
                  </Button>
                )}
                <Button variant={gameOver === 'win' ? 'outline' : 'default'} onClick={startNewGame}>
                  <RotateCcw className="h-4 w-4 mr-2" /> 重新开始
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 移动端控制 */}
      {isMobile && !gameOver && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <Button variant="outline" size="icon"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'up'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <div />
                <Button variant="outline" size="icon"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'left'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <div />
                <Button variant="outline" size="icon"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'right'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
                <div />
                <Button variant="outline" size="icon"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'down'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowDown className="h-5 w-5" />
                </Button>
                <div />
              </div>
              <Button size="lg"
                className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                onClick={placeBomb}>
                <Bomb className="h-8 w-8" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BomberPopGame;
