import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Bomb, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BomberPopGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

// 地图格子类型
type CellType = 'empty' | 'wall' | 'box';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Bomb {
  id: number;
  x: number;
  y: number;
  timer: number; // 剩余帧数
  range: number;
  ownerId: 'player' | 'enemy';
}

interface Explosion {
  id: number;
  cells: { x: number; y: number }[];
  timer: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  dir: Direction;
  moveCooldown: number;
  alive: boolean;
}

const ROWS = 11;
const COLS = 13;
const TICK_MS = 120; // 主循环节奏
const BOMB_FUSE_TICKS = Math.round(2500 / TICK_MS); // ~2.5s
const EXPLOSION_TICKS = Math.round(500 / TICK_MS); // ~0.5s
const PLAYER_MOVE_TICKS = 1; // 每 tick 可移动
const ENEMY_MOVE_TICKS = 4; // 每 4 tick 移动一次
const BOMB_RANGE = 2;

// 生成关卡：边界为不可破坏墙、内部网格点为石柱、随机散布可破坏箱子
const generateMap = (): CellType[][] => {
  const map: CellType[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 'empty' as CellType)
  );

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 外围墙
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1) {
        map[r][c] = 'wall';
      } else if (r % 2 === 0 && c % 2 === 0) {
        // 内部固定石柱
        map[r][c] = 'wall';
      }
    }
  }

  // 随机箱子，避开玩家与敌人出生点周围
  const safeZones = [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 },
    { x: COLS - 2, y: ROWS - 2 }, { x: COLS - 3, y: ROWS - 2 }, { x: COLS - 2, y: ROWS - 3 },
    { x: COLS - 2, y: 1 }, { x: 1, y: ROWS - 2 },
  ];
  const isSafe = (x: number, y: number) => safeZones.some(s => s.x === x && s.y === y);

  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (map[r][c] === 'empty' && !isSafe(c, r) && Math.random() < 0.55) {
        map[r][c] = 'box';
      }
    }
  }
  return map;
};

const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // ignore
  }
};

const BomberPopGame = ({ onBack, soundEnabled }: BomberPopGameProps) => {
  const [map, setMap] = useState<CellType[][]>(() => generateMap());
  const [player, setPlayer] = useState({ x: 1, y: 1, alive: true });
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 1, x: COLS - 2, y: ROWS - 2, dir: 'left', moveCooldown: 0, alive: true },
    { id: 2, x: COLS - 2, y: 1, dir: 'down', moveCooldown: 0, alive: true },
  ]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('bomber-pop-best');
    return saved ? parseInt(saved, 10) : 0;
  });

  const playerMoveCooldownRef = useRef(0);
  const heldKeyRef = useRef<Direction | null>(null);
  const bombIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const isMobile = useIsMobile();

  const sfx = useCallback((freq: number, dur: number, type: OscillatorType = 'sine') => {
    if (soundEnabled) playSound(freq, dur, type);
  }, [soundEnabled]);

  // 重置游戏
  const resetGame = useCallback(() => {
    setMap(generateMap());
    setPlayer({ x: 1, y: 1, alive: true });
    setBombs([]);
    setExplosions([]);
    setEnemies([
      { id: 1, x: COLS - 2, y: ROWS - 2, dir: 'left', moveCooldown: 0, alive: true },
      { id: 2, x: COLS - 2, y: 1, dir: 'down', moveCooldown: 0, alive: true },
    ]);
    setScore(0);
    setGameOver(null);
    setGameStarted(true);
    playerMoveCooldownRef.current = 0;
    heldKeyRef.current = null;
  }, []);

  // 计算爆炸十字范围
  const computeExplosionCells = useCallback((bomb: Bomb, currentMap: CellType[][], currentBombs: Bomb[]) => {
    const cells: { x: number; y: number }[] = [{ x: bomb.x, y: bomb.y }];
    const destroyedBoxes: { x: number; y: number }[] = [];
    const triggeredBombs: Bomb[] = [];

    const directions: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of directions) {
      for (let i = 1; i <= bomb.range; i++) {
        const nx = bomb.x + dx * i;
        const ny = bomb.y + dy * i;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) break;
        const cell = currentMap[ny][nx];
        if (cell === 'wall') break;
        cells.push({ x: nx, y: ny });
        // 引爆链式炸弹
        const chained = currentBombs.find(b => b.id !== bomb.id && b.x === nx && b.y === ny);
        if (chained) triggeredBombs.push(chained);
        if (cell === 'box') {
          destroyedBoxes.push({ x: nx, y: ny });
          break;
        }
      }
    }
    return { cells, destroyedBoxes, triggeredBombs };
  }, []);

  // 引爆炸弹
  const detonateBomb = useCallback((bomb: Bomb, currentMap: CellType[][], currentBombs: Bomb[]): {
    newMap: CellType[][];
    explosionCells: { x: number; y: number }[];
    chainBombs: Bomb[];
    boxesDestroyed: number;
  } => {
    const { cells, destroyedBoxes, triggeredBombs } = computeExplosionCells(bomb, currentMap, currentBombs);
    const newMap = currentMap.map(row => [...row]);
    destroyedBoxes.forEach(({ x, y }) => {
      newMap[y][x] = 'empty';
    });
    return { newMap, explosionCells: cells, chainBombs: triggeredBombs, boxesDestroyed: destroyedBoxes.length };
  }, [computeExplosionCells]);

  // 玩家移动
  const movePlayer = useCallback((dir: Direction) => {
    setPlayer(prev => {
      if (!prev.alive) return prev;
      let { x, y } = prev;
      if (dir === 'up') y--;
      else if (dir === 'down') y++;
      else if (dir === 'left') x--;
      else if (dir === 'right') x++;
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return prev;
      if (map[y][x] !== 'empty') return prev;
      // 不能走到炸弹上（除非是当前位置）
      if (bombs.some(b => b.x === x && b.y === y)) return prev;
      return { ...prev, x, y };
    });
  }, [map, bombs]);

  // 放置炸弹
  const placeBomb = useCallback(() => {
    if (!player.alive || gameOver) return;
    setBombs(prev => {
      // 同格不能重复放
      if (prev.some(b => b.x === player.x && b.y === player.y)) return prev;
      // 玩家最多同时存在 2 颗
      const playerBombCount = prev.filter(b => b.ownerId === 'player').length;
      if (playerBombCount >= 2) return prev;
      bombIdRef.current += 1;
      sfx(220, 0.15, 'square');
      return [...prev, {
        id: bombIdRef.current,
        x: player.x,
        y: player.y,
        timer: BOMB_FUSE_TICKS,
        range: BOMB_RANGE,
        ownerId: 'player',
      }];
    });
  }, [player, gameOver, sfx]);

  // 键盘控制
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
      const map: Record<string, Direction> = {
        arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
        arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
      };
      if (map[key] && heldKeyRef.current === map[key]) heldKeyRef.current = null;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, placeBomb]);

  // 主游戏循环
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => {
      // 玩家持续移动
      if (heldKeyRef.current) {
        if (playerMoveCooldownRef.current <= 0) {
          movePlayer(heldKeyRef.current);
          playerMoveCooldownRef.current = PLAYER_MOVE_TICKS;
        } else {
          playerMoveCooldownRef.current--;
        }
      } else {
        playerMoveCooldownRef.current = 0;
      }

      // 处理炸弹倒计时与引爆
      setBombs(prevBombs => {
        let workingBombs = prevBombs.map(b => ({ ...b, timer: b.timer - 1 }));
        let workingMap = map;
        const newExplosions: Explosion[] = [];
        let totalBoxes = 0;

        // 找到所有应爆炸的炸弹（链式）
        const toDetonate = new Set<number>();
        workingBombs.filter(b => b.timer <= 0).forEach(b => toDetonate.add(b.id));

        let changed = true;
        while (changed) {
          changed = false;
          for (const bombId of Array.from(toDetonate)) {
            const bomb = workingBombs.find(b => b.id === bombId);
            if (!bomb) continue;
            const result = detonateBomb(bomb, workingMap, workingBombs);
            workingMap = result.newMap;
            totalBoxes += result.boxesDestroyed;
            explosionIdRef.current += 1;
            newExplosions.push({
              id: explosionIdRef.current,
              cells: result.explosionCells,
              timer: EXPLOSION_TICKS,
            });
            result.chainBombs.forEach(cb => {
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
          workingBombs = workingBombs.filter(b => !toDetonate.has(b.id));
        }
        return workingBombs;
      });

      // 爆炸特效倒计时
      setExplosions(prev => prev.map(e => ({ ...e, timer: e.timer - 1 })).filter(e => e.timer > 0));

      // 敌人移动
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.alive) return enemy;
        if (enemy.moveCooldown > 0) return { ...enemy, moveCooldown: enemy.moveCooldown - 1 };
        // 简单 AI：尝试当前方向，撞墙则随机换向
        const tryMove = (dir: Direction) => {
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
        const next = tryMove(enemy.dir);
        if (next) {
          return { ...enemy, x: next.x, y: next.y, moveCooldown: ENEMY_MOVE_TICKS };
        }
        const dirs: Direction[] = ['up', 'down', 'left', 'right'];
        const shuffled = dirs.sort(() => Math.random() - 0.5);
        for (const d of shuffled) {
          if (tryMove(d)) {
            return { ...enemy, dir: d, moveCooldown: ENEMY_MOVE_TICKS };
          }
        }
        return enemy;
      }));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, map, bombs, detonateBomb, movePlayer, sfx]);

  // 检测爆炸命中（玩家、敌人）
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const activeCells = explosions.flatMap(e => e.cells);
    if (activeCells.length === 0) return;

    // 玩家受伤
    if (player.alive && activeCells.some(c => c.x === player.x && c.y === player.y)) {
      sfx(120, 0.5, 'triangle');
      setPlayer(p => ({ ...p, alive: false }));
      setGameOver('lose');
    }

    // 敌人被炸
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

  // 玩家与敌人碰撞
  useEffect(() => {
    if (!gameStarted || gameOver || !player.alive) return;
    if (enemies.some(e => e.alive && e.x === player.x && e.y === player.y)) {
      sfx(120, 0.5, 'triangle');
      setPlayer(p => ({ ...p, alive: false }));
      setGameOver('lose');
    }
  }, [enemies, player, gameStarted, gameOver, sfx]);

  // 胜利判断
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    if (enemies.length > 0 && enemies.every(e => !e.alive)) {
      setGameOver('win');
      setScore(s => s + 500);
      sfx(660, 0.4, 'sine');
    }
  }, [enemies, gameStarted, gameOver, sfx]);

  // 最高分持久化
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bomber-pop-best', String(score));
    }
  }, [score, bestScore]);

  // 渲染单元格
  const renderCell = (cell: CellType, x: number, y: number) => {
    const isPlayer = player.alive && player.x === x && player.y === y;
    const enemyHere = enemies.find(e => e.alive && e.x === x && e.y === y);
    const bombHere = bombs.find(b => b.x === x && b.y === y);
    const explosionHere = explosions.some(e => e.cells.some(c => c.x === x && c.y === y));

    let bg = 'bg-emerald-100';
    if (cell === 'wall') bg = 'bg-slate-600';
    else if (cell === 'box') bg = 'bg-amber-400';
    if (explosionHere) bg = 'bg-orange-400';

    return (
      <div
        key={`${x}-${y}`}
        className={`relative ${bg} border border-emerald-200/40 flex items-center justify-center transition-colors`}
        style={{ aspectRatio: '1 / 1' }}
      >
        {cell === 'wall' && <div className="w-3/4 h-3/4 bg-slate-700 rounded-sm shadow-inner" />}
        {cell === 'box' && <div className="w-4/5 h-4/5 bg-amber-500 border-2 border-amber-700 rounded-md flex items-center justify-center text-xs">📦</div>}
        {explosionHere && <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-2xl animate-pulse">💥</div>}
        {bombHere && !explosionHere && (
          <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-2xl animate-bounce">💣</div>
        )}
        {isPlayer && (
          <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-2xl drop-shadow">🐰</div>
        )}
        {enemyHere && !isPlayer && (
          <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-2xl drop-shadow">👾</div>
        )}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-6xl">💣🐰</div>
          <h2 className="text-2xl font-bold">Q版泡泡堂</h2>
          <p className="text-muted-foreground text-sm">
            移动小兔子，放置泡泡炸弹炸毁箱子和敌人，消灭所有敌人即可获胜！
          </p>
          <div className="text-left bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p>🎮 <strong>键盘：</strong> 方向键 / WASD 移动，空格 / Enter 放炸弹</p>
            <p>📱 <strong>手机：</strong> 屏幕下方虚拟按键操作</p>
            <p>💥 炸弹 2.5 秒后爆炸，十字范围伤害</p>
            <p>📦 黄色箱子可破坏（+10），消灭敌人 +100，通关 +500</p>
            <p>⚠️ 小心被自己的炸弹炸到！</p>
          </div>
          {bestScore > 0 && (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" /> 最高分：{bestScore}
            </p>
          )}
          <Button onClick={resetGame} size="lg" className="w-full">
            <Bomb className="h-4 w-4 mr-2" />
            开始游戏
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" /> {score}
            </span>
            <span className="text-muted-foreground">最高 {bestScore}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>剩余敌人：{enemies.filter(e => e.alive).length}</span>
          </div>
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RotateCcw className="h-4 w-4 mr-1" /> 重玩
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2 sm:p-3">
          <div
            className="grid gap-0 mx-auto rounded-md overflow-hidden bg-emerald-50 select-none"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              maxWidth: 'min(100%, 640px)',
            }}
          >
            {map.flatMap((row, y) => row.map((cell, x) => renderCell(cell, x, y)))}
          </div>

          {gameOver && (
            <div className="mt-4 text-center space-y-3">
              <div className="text-4xl">{gameOver === 'win' ? '🎉' : '💀'}</div>
              <h3 className="text-xl font-bold">
                {gameOver === 'win' ? '胜利！' : '游戏结束'}
              </h3>
              <p className="text-muted-foreground">本局得分：{score}</p>
              <Button onClick={resetGame} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4 mr-2" /> 再玩一局
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 移动端虚拟按键 */}
      {isMobile && !gameOver && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onTouchStart={() => { heldKeyRef.current = 'up'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onTouchStart={() => { heldKeyRef.current = 'left'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onTouchStart={() => { heldKeyRef.current = 'right'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onTouchStart={() => { heldKeyRef.current = 'down'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
                <div />
              </div>
              <Button
                size="lg"
                className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white"
                onClick={placeBomb}
              >
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
