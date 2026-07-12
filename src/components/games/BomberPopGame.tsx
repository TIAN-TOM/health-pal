import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RotateCcw, Bomb, ArrowUp, ArrowDown,
  ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon,
  Flame, Coins, Radio, Home,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { awardGameCompletionBonus } from '@/services/pointsService';
import { toast } from '@/hooks/use-toast';
import {
  ROWS, COLS, TICK_MS, BOMB_FUSE_TICKS, EXPLOSION_TICKS,
  PLAYER_BASE_MOVE_TICKS,
  FREEZE_DURATION_TICKS, LAVA_INTERVAL_TICKS, HP_MAX,
  POWER_UP_LABEL,
  type CellType, type Direction, type PowerUp, type BombEntity,
  type Explosion, type Enemy, type Cpu, type LevelConfig, type GameMode,
  type CharacterId, type SpecialCell, type FloatingText,
} from '@/components/games/bomberPop/types';
import { buildLevel } from '@/components/games/bomberPop/levelConfig';
import { generateMap } from '@/components/games/bomberPop/mapGenerator';
import { computeDangerCells } from '@/components/games/bomberPop/explosion';
import { stepEnemy, stepCpu } from '@/components/games/bomberPop/ai';
import { stepKickedBombs, resolveDetonations } from '@/components/games/bomberPop/bombs';
import { playSfx } from '@/components/games/bomberPop/sound';
import { findSpecial } from '@/components/games/bomberPop/specialCells';
import { ARCADE_TOTAL_LEVELS, BATTLE_BEST_OF, SURVIVAL_WAVE_INTERVAL_SEC } from '@/components/games/bomberPop/modes';
import { getCharacter } from '@/components/games/bomberPop/characters';
import {
  PixelTile, PixelBomb, PixelExplosion, PixelPlayer, PixelEnemy,
  PowerUpIcon, PixelSpecialCell,
} from '@/components/games/bomberPop/PixelArt';
import StartScreen from '@/components/games/bomberPop/StartScreen';
import Hud from '@/components/games/bomberPop/Hud';
import FloatingTextLayer from '@/components/games/bomberPop/FloatingText';

interface BomberPopGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

const SPAWN_PLAYER = { x: 1, y: 1 };
const CPU_SPAWNS = [
  { x: COLS - 2, y: 1 },
  { x: 1, y: ROWS - 2 },
  { x: COLS - 2, y: ROWS - 2 },
];

const BomberPopGame = ({ onBack, soundEnabled }: BomberPopGameProps) => {
  // === 模式与角色 ===
  const [mode, setMode] = useState<GameMode>('arcade');
  const [characterId, setCharacterId] = useState<CharacterId>(() => {
    const saved = localStorage.getItem('bomber-pop-character') as CharacterId | null;
    return saved ?? 'rabbit';
  });

  // 关卡 / 配置
  const [levelNum, setLevelNum] = useState(1);
  const levelCfgRef = useRef<LevelConfig>(buildLevel(1, 'arcade'));

  // 地图与对象
  const [map, setMap] = useState<CellType[][]>([]);
  const [hiddenPowerUps, setHiddenPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);
  const [specialCells, setSpecialCells] = useState<SpecialCell[]>([]);
  const [player, setPlayer] = useState({ x: 1, y: 1, alive: true });
  const [bombs, setBombs] = useState<BombEntity[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [cpus, setCpus] = useState<Cpu[]>([]);

  // 玩家能力
  const [hp, setHp] = useState(1);
  const [maxBombs, setMaxBombs] = useState(1);
  const [bombRange, setBombRange] = useState(1);
  const [hasKick, setHasKick] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(0);
  const [hasPierce, setHasPierce] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [isRemote, setIsRemote] = useState(false);
  const [freezeTicks, setFreezeTicks] = useState(0);
  const [hitInvuln, setHitInvuln] = useState(0);

  // 状态
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [survivalSec, setSurvivalSec] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose' | 'all-clear'>(null);
  const [bestScore, setBestScore] = useState<number>(() => parseInt(localStorage.getItem('bomber-pop-best') ?? '0', 10) || 0);
  const [maxLevelReached, setMaxLevelReached] = useState<number>(() => parseInt(localStorage.getItem('bomber-pop-max-level') ?? '1', 10) || 1);
  const [bestSurvivalSec, setBestSurvivalSec] = useState<number>(() => parseInt(localStorage.getItem('bomber-pop-best-survival') ?? '0', 10) || 0);
  const [battleWins, setBattleWins] = useState<number>(() => parseInt(localStorage.getItem('bomber-pop-battle-wins') ?? '0', 10) || 0);
  const [battleScore, setBattleScore] = useState<{ player: number; cpu: number }>({ player: 0, cpu: 0 });
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [stageBanner, setStageBanner] = useState<string | null>(null);

  const playerMoveCooldownRef = useRef(0);
  const heldKeyRef = useRef<Direction | null>(null);
  const lastFacingRef = useRef<Direction>('right');
  const slideDirRef = useRef<Direction | null>(null); // 沙地/冰面强制滑动
  const slideRemainingRef = useRef(0);
  const bombIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const enemyIdRef = useRef(0);
  const tickCounterRef = useRef(0);
  const lavaCooldownRef = useRef(LAVA_INTERVAL_TICKS);
  const floatingTextIdRef = useRef(0);
  const survivalWaveTickRef = useRef(0);
  const isMobile = useIsMobile();

  const sfx = useCallback((key: Parameters<typeof playSfx>[0]) => {
    if (soundEnabled) playSfx(key);
  }, [soundEnabled]);

  const playerMoveTicks = Math.max(1, PLAYER_BASE_MOVE_TICKS - speedLevel * 0.4);

  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    floatingTextIdRef.current += 1;
    const item: FloatingText = { id: floatingTextIdRef.current, x, y, text, color, bornAt: Date.now() };
    setFloatingTexts(prev => [...prev, item]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== item.id));
    }, 1000);
  }, []);

  const showStageBanner = useCallback((text: string) => {
    setStageBanner(text);
    setTimeout(() => setStageBanner(null), 1500);
  }, []);

  // === 关卡/波次初始化 ===
  const startLevel = useCallback((level: number, runMode: GameMode, keepStats: { score?: number; bombs?: number; range?: number; kick?: boolean; speed?: number; hp?: number; pierce?: boolean; remote?: boolean } = {}) => {
    const cfg = buildLevel(level, runMode);
    levelCfgRef.current = cfg;
    const enemyCount = runMode === 'battle' ? 0 : cfg.enemyCount;
    const { map: newMap, powerUpSpawns, enemyPositions, specialCells: spc } = generateMap(cfg, enemyCount);
    setMap(newMap);
    setHiddenPowerUps(powerUpSpawns);
    setActivePowerUps([]);
    setSpecialCells(spc);
    setPlayer({ x: SPAWN_PLAYER.x, y: SPAWN_PLAYER.y, alive: true });
    setBombs([]);
    setExplosions([]);

    // 角色初始化
    const ch = getCharacter(characterId);
    const initBombs = keepStats.bombs ?? (1 + (ch.bonus.bombs ?? 0));
    const initRange = keepStats.range ?? (1 + (ch.bonus.range ?? 0));
    const initSpeed = keepStats.speed ?? (ch.bonus.speed ?? 0);
    const initHp = keepStats.hp ?? Math.min(HP_MAX, 1 + (ch.bonus.hp ?? 0));

    setMaxBombs(Math.min(initBombs, 6));
    setBombRange(Math.min(initRange, 6));
    setHasKick(keepStats.kick ?? false);
    setSpeedLevel(Math.min(initSpeed, 3));
    setHp(initHp);
    setHasPierce(keepStats.pierce ?? false);
    setHasShield(false);
    setIsRemote(keepStats.remote ?? false);
    setFreezeTicks(0);
    setHitInvuln(0);

    // 敌人 / CPU
    if (runMode === 'battle') {
      setEnemies([]);
      setCpus(CPU_SPAWNS.map((p, idx) => ({
        id: idx + 1,
        x: p.x,
        y: p.y,
        dir: 'left',
        alive: true,
        moveCooldown: 0,
        bombCooldown: 30 + Math.floor(Math.random() * 20),
      })));
    } else {
      setCpus([]);
      setEnemies(enemyPositions.map((p) => {
        enemyIdRef.current += 1;
        const isBoss = cfg.isBoss;
        return {
          id: enemyIdRef.current,
          x: p.x,
          y: p.y,
          dir: 'left',
          moveCooldown: 0,
          alive: true,
          intelligence: cfg.enemyIntelligence,
          kind: isBoss ? 'boss' : 'normal',
          hp: isBoss ? 3 : 1,
          hitCooldown: 0,
        };
      }));
    }

    setScore(keepStats.score ?? 0);
    setTimeLeft(cfg.timeLimitSec);
    setGameOver(null);
    setLevelNum(level);
    setPointsAwarded(null);
    playerMoveCooldownRef.current = 0;
    heldKeyRef.current = null;
    slideDirRef.current = null;
    slideRemainingRef.current = 0;
    tickCounterRef.current = 0;
    lavaCooldownRef.current = LAVA_INTERVAL_TICKS;

    if (runMode === 'arcade' && level > maxLevelReached) {
      setMaxLevelReached(level);
      localStorage.setItem('bomber-pop-max-level', String(level));
    }

    // 关卡过场
    if (runMode === 'arcade') {
      const themeLabel: Record<string, string> = { forest: '🌿 FOREST', beach: '🏖️ BEACH', ice: '❄️ ICE', volcano: '🔥 VOLCANO' };
      const banner = cfg.isBoss
        ? `STAGE ${level} — BOSS!`
        : `STAGE ${level} — ${themeLabel[cfg.theme] ?? ''}`;
      showStageBanner(banner);
      if (cfg.isBoss) sfx('boss');
    } else if (runMode === 'survival') {
      showStageBanner(`WAVE ${level}`);
    }
  }, [characterId, maxLevelReached, showStageBanner, sfx]);

  const startNewGame = useCallback((newMode: GameMode, charId: CharacterId) => {
    setMode(newMode);
    setCharacterId(charId);
    localStorage.setItem('bomber-pop-character', charId);
    setGameStarted(true);
    setBattleScore({ player: 0, cpu: 0 });
    setSurvivalSec(0);
    survivalWaveTickRef.current = 0;
    startLevel(1, newMode);
  }, [startLevel]);

  const restart = useCallback(() => {
    setBattleScore({ player: 0, cpu: 0 });
    setSurvivalSec(0);
    survivalWaveTickRef.current = 0;
    startLevel(1, mode);
  }, [mode, startLevel]);

  const nextLevel = useCallback(() => {
    if (mode === 'arcade') {
      if (levelNum >= ARCADE_TOTAL_LEVELS) {
        setGameOver('all-clear');
        return;
      }
      startLevel(levelNum + 1, mode, {
        score, bombs: maxBombs, range: bombRange, kick: hasKick,
        speed: speedLevel, hp, pierce: hasPierce, remote: isRemote,
      });
    } else {
      restart();
    }
  }, [mode, levelNum, score, maxBombs, bombRange, hasKick, speedLevel, hp, hasPierce, isRemote, startLevel, restart]);

  // === 玩家移动（含沙/冰特殊处理） ===
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
          sfx('bomb_place');
        }
        return prev;
      }
      lastFacingRef.current = dir;

      // 触发沙/冰：进入特殊地块后排程额外滑动
      const sp = findSpecial(specialCells, x, y);
      if (sp?.kind === 'sand') {
        slideDirRef.current = dir;
        slideRemainingRef.current = 1; // 强制下一步沿同方向
      } else if (sp?.kind === 'ice') {
        slideDirRef.current = dir;
        slideRemainingRef.current = 1; // 惯性 +1
      }
      return { ...prev, x, y };
    });
  }, [map, bombs, hasKick, sfx, specialCells]);

  // === 放炸弹 ===
  const placeBomb = useCallback(() => {
    if (!player.alive || gameOver) return;
    setBombs(prev => {
      if (prev.some(b => b.x === player.x && b.y === player.y)) return prev;
      const playerBombCount = prev.filter(b => b.ownerId === 'player').length;
      if (playerBombCount >= maxBombs) return prev;
      bombIdRef.current += 1;
      sfx('bomb_place');
      return [...prev, {
        id: bombIdRef.current,
        x: player.x,
        y: player.y,
        timer: isRemote ? 9999 : BOMB_FUSE_TICKS,
        range: bombRange,
        ownerId: 'player',
        pierce: hasPierce,
        remote: isRemote,
      }];
    });
  }, [player, gameOver, maxBombs, bombRange, hasPierce, isRemote, sfx]);

  // === 遥控引爆 ===
  const detonateRemote = useCallback(() => {
    if (!isRemote) return;
    setBombs(prev => {
      const target = prev.find(b => b.ownerId === 'player' && b.remote);
      if (!target) return prev;
      return prev.map(b => b.id === target.id ? { ...b, timer: 0 } : b);
    });
  }, [isRemote]);

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
      else if (key === 'r') { e.preventDefault(); detonateRemote(); }
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
  }, [gameStarted, gameOver, placeBomb, detonateRemote]);

  // === 主循环 ===
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => {
      tickCounterRef.current += 1;

      // 倒计时（每 1000ms）
      const oneSecond = tickCounterRef.current % Math.round(1000 / TICK_MS) === 0;
      if (oneSecond) {
        if (mode === 'arcade' || mode === 'battle') {
          setTimeLeft(t => {
            const next = t - 1;
            if (next <= 0) {
              setGameOver('lose');
              sfx('lose');
              return 0;
            }
            return next;
          });
        }
        if (mode === 'survival') {
          setSurvivalSec(s => s + 1);
          survivalWaveTickRef.current += 1;
          if (survivalWaveTickRef.current >= SURVIVAL_WAVE_INTERVAL_SEC) {
            survivalWaveTickRef.current = 0;
            setLevelNum(l => {
              const nl = l + 1;
              const cfg = buildLevel(nl, 'survival');
              levelCfgRef.current = cfg;
              // 添加新一波敌人（保留旧的）
              setEnemies(prev => {
                const additions: Enemy[] = [];
                const positions = [{ x: COLS - 2, y: 1 }, { x: COLS - 2, y: ROWS - 2 }];
                positions.forEach(pos => {
                  enemyIdRef.current += 1;
                  additions.push({
                    id: enemyIdRef.current, x: pos.x, y: pos.y,
                    dir: 'left', moveCooldown: 0, alive: true,
                    intelligence: cfg.enemyIntelligence,
                    kind: nl % 3 === 0 ? 'fast' : 'normal',
                    hp: 1, hitCooldown: 0,
                  });
                });
                return [...prev, ...additions];
              });
              showStageBanner(`WAVE ${nl}`);
              return nl;
            });
          }
        }
      }

      // 冻结计时
      if (freezeTicks > 0) setFreezeTicks(f => Math.max(0, f - 1));
      if (hitInvuln > 0) setHitInvuln(h => Math.max(0, h - 1));

      // 玩家持续移动 / 沙冰强制滑动
      if (slideRemainingRef.current > 0 && slideDirRef.current) {
        if (playerMoveCooldownRef.current <= 0) {
          tryMovePlayer(slideDirRef.current);
          slideRemainingRef.current -= 1;
          playerMoveCooldownRef.current = playerMoveTicks;
        } else {
          playerMoveCooldownRef.current--;
        }
      } else if (heldKeyRef.current) {
        if (playerMoveCooldownRef.current <= 0) {
          tryMovePlayer(heldKeyRef.current);
          playerMoveCooldownRef.current = playerMoveTicks;
        } else {
          playerMoveCooldownRef.current--;
        }
      } else {
        playerMoveCooldownRef.current = 0;
        slideDirRef.current = null;
      }

      // 处理被踢动的炸弹移动
      setBombs(prevBombs => stepKickedBombs(prevBombs, { map, player, enemies }));

      // 炸弹倒计时 + 引爆（遥控弹由 detonateRemote 触发）
      setBombs(prevBombs => {
        const result = resolveDetonations(prevBombs, map, hiddenPowerUps, () => {
          explosionIdRef.current += 1;
          return explosionIdRef.current;
        });
        if (result.detonated) {
          sfx('explode');
          setMap(result.newMap);
          setExplosions(prev => [...prev, ...result.newExplosions]);
          if (result.destroyedBoxCount > 0) setScore(s => s + result.destroyedBoxCount * 10);
          if (result.revealedPowerUps.length > 0) {
            setActivePowerUps(prev => [...prev, ...result.revealedPowerUps]);
            setHiddenPowerUps(prev => prev.filter(p => !result.revealedPowerUps.some(r => r.x === p.x && r.y === p.y)));
          }
        }
        return result.remainingBombs;
      });

      setExplosions(prev => prev.map(e => ({ ...e, timer: e.timer - 1 })).filter(e => e.timer > 0));

      // === 智能敌人（冻结时跳过） ===
      if (freezeTicks <= 0) {
        const danger = computeDangerCells(bombs, map);
        const enemyMoveTicks = levelCfgRef.current.enemyMoveTicks;
        setEnemies(prev => prev.map(enemy =>
          stepEnemy(enemy, { map, bombs, danger, player, enemyMoveTicks })
        ));
      }

      // === CPU（竞技模式） ===
      if (mode === 'battle') {
        const danger = computeDangerCells(bombs, map);
        // setBombs 必须嵌套在 setCpus 更新器内：函数式更新器在 render 阶段才执行，
        // 若在外部同步读取放弹结果会永远为空（CPU 因此从不放炸弹）。用最新的 prev 决策。
        setCpus(prev => {
          const bombsToPlace: { x: number; y: number }[] = [];
          const nextCpus = prev.map(cpu => {
            const { cpu: nextCpu, placeBomb } = stepCpu(cpu, { map, bombs, danger });
            if (placeBomb) bombsToPlace.push({ x: cpu.x, y: cpu.y });
            return nextCpu;
          });
          if (bombsToPlace.length > 0) {
            setBombs(bs => [
              ...bs,
              ...bombsToPlace.map(pos => {
                bombIdRef.current += 1;
                return {
                  id: bombIdRef.current, x: pos.x, y: pos.y,
                  timer: BOMB_FUSE_TICKS, range: 2, ownerId: 'enemy' as const,
                };
              }),
            ]);
          }
          return nextCpus;
        });
      }

      // === 火山喷口 ===
      if (levelCfgRef.current.theme === 'volcano' && specialCells.length > 0) {
        lavaCooldownRef.current -= 1;
        if (lavaCooldownRef.current <= 0) {
          lavaCooldownRef.current = LAVA_INTERVAL_TICKS;
          const vent = specialCells[Math.floor(Math.random() * specialCells.length)];
          if (vent) {
            explosionIdRef.current += 1;
            setExplosions(prev => [...prev, {
              id: explosionIdRef.current,
              cells: [{ x: vent.x, y: vent.y }],
              timer: EXPLOSION_TICKS,
            }]);
            sfx('explode');
          }
        }
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, map, bombs, player, enemies, hiddenPowerUps, tryMovePlayer, sfx, playerMoveTicks, mode, freezeTicks, hitInvuln, specialCells, showStageBanner]);

  // === 道具拾取 ===
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const picked = activePowerUps.find(p => p.x === player.x && p.y === player.y);
    if (!picked) return;
    sfx('pickup');
    if (picked.type === 'bomb') setMaxBombs(b => Math.min(b + 1, 6));
    else if (picked.type === 'range') setBombRange(r => Math.min(r + 1, 6));
    else if (picked.type === 'kick') setHasKick(true);
    else if (picked.type === 'speed') setSpeedLevel(s => Math.min(s + 1, 3));
    else if (picked.type === 'pierce') setHasPierce(true);
    else if (picked.type === 'remote') setIsRemote(true);
    else if (picked.type === 'shield') setHasShield(true);
    else if (picked.type === 'life') setHp(h => Math.min(h + 1, HP_MAX));
    else if (picked.type === 'freeze') { setFreezeTicks(FREEZE_DURATION_TICKS); sfx('freeze'); }
    setScore(s => s + 30);
    spawnFloatingText(picked.x, picked.y, `+30 ${POWER_UP_LABEL[picked.type]}`, '#ec4899');
    setActivePowerUps(prev => prev.filter(p => !(p.x === picked.x && p.y === picked.y)));
  }, [player.x, player.y, activePowerUps, gameStarted, gameOver, sfx, spawnFloatingText]);

  // === 爆炸命中 ===
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const activeCells = explosions.flatMap(e => e.cells);
    if (activeCells.length === 0) return;

    if (player.alive && hitInvuln <= 0 && activeCells.some(c => c.x === player.x && c.y === player.y)) {
      sfx('hurt');
      if (hasShield) {
        setHasShield(false);
        setHitInvuln(10);
        spawnFloatingText(player.x, player.y, '盾!', '#38bdf8');
      } else {
        const newHp = hp - 1;
        if (newHp <= 0) {
          setPlayer(p => ({ ...p, alive: false }));
          setGameOver('lose');
        } else {
          setHp(newHp);
          setHitInvuln(15);
          spawnFloatingText(player.x, player.y, `-1 HP`, '#ef4444');
        }
      }
    }

    setEnemies(prev => {
      let killedBoss = 0;
      let killedNormal = 0;
      const next = prev.map(en => {
        if (!en.alive || en.hitCooldown > 0) return en;
        if (activeCells.some(c => c.x === en.x && c.y === en.y)) {
          const newHp = en.hp - 1;
          if (newHp <= 0) {
            if (en.kind === 'boss') killedBoss++; else killedNormal++;
            spawnFloatingText(en.x, en.y, en.kind === 'boss' ? '+500' : '+100', '#facc15');
            return { ...en, alive: false };
          }
          spawnFloatingText(en.x, en.y, `HP ${newHp}`, '#fb923c');
          return { ...en, hp: newHp, hitCooldown: 5 };
        }
        return en;
      });
      const totalScore = killedNormal * 100 + killedBoss * 500;
      if (totalScore > 0) { setScore(s => s + totalScore); sfx('explode'); }
      return next;
    });

    if (mode === 'battle') {
      setCpus(prev => prev.map(c => {
        if (!c.alive) return c;
        if (activeCells.some(cc => cc.x === c.x && cc.y === c.y)) {
          spawnFloatingText(c.x, c.y, 'KO', '#ef4444');
          return { ...c, alive: false };
        }
        return c;
      }));
    }
  }, [explosions, player.alive, player.x, player.y, gameStarted, gameOver, sfx, hp, hasShield, hitInvuln, mode, spawnFloatingText]);

  // 玩家碰敌人/CPU
  useEffect(() => {
    if (!gameStarted || gameOver || !player.alive || hitInvuln > 0) return;
    const enemyHit = enemies.some(e => e.alive && e.x === player.x && e.y === player.y);
    const cpuHit = cpus.some(c => c.alive && c.x === player.x && c.y === player.y);
    if (enemyHit || cpuHit) {
      sfx('hurt');
      if (hasShield) {
        setHasShield(false);
        setHitInvuln(10);
      } else {
        const newHp = hp - 1;
        if (newHp <= 0) {
          setPlayer(p => ({ ...p, alive: false }));
          setGameOver('lose');
        } else {
          setHp(newHp);
          setHitInvuln(15);
        }
      }
    }
  }, [enemies, cpus, player, gameStarted, gameOver, sfx, hp, hasShield, hitInvuln]);

  // 通关 / 对战胜负判断
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    if (mode === 'arcade') {
      if (enemies.length > 0 && enemies.every(e => !e.alive)) {
        const timeBonus = timeLeft * 5;
        setScore(s => s + 500 + timeBonus);
        sfx('win');
        setGameOver('win');
      }
    } else if (mode === 'battle') {
      const cpusAlive = cpus.filter(c => c.alive).length;
      if (cpus.length > 0 && cpusAlive === 0) {
        // 玩家本局胜
        const newPlayerScore = battleScore.player + 1;
        setBattleScore({ player: newPlayerScore, cpu: battleScore.cpu });
        sfx('win');
        if (newPlayerScore >= Math.ceil(BATTLE_BEST_OF / 2)) {
          setGameOver('win');
          const wins = battleWins + 1;
          setBattleWins(wins);
          localStorage.setItem('bomber-pop-battle-wins', String(wins));
        } else {
          showStageBanner(`你赢了第 ${newPlayerScore} 局！`);
          setTimeout(() => startLevel(1, 'battle'), 1500);
        }
      }
    }
  }, [enemies, cpus, gameStarted, gameOver, timeLeft, sfx, mode, battleScore, battleWins, startLevel, showStageBanner]);

  // 竞技模式：玩家死亡时 cpu 加分
  useEffect(() => {
    if (mode !== 'battle' || !gameStarted) return;
    if (gameOver === 'lose' && cpus.some(c => c.alive)) {
      const newCpuScore = battleScore.cpu + 1;
      if (newCpuScore < Math.ceil(BATTLE_BEST_OF / 2)) {
        setTimeout(() => {
          setBattleScore({ player: battleScore.player, cpu: newCpuScore });
          startLevel(1, 'battle');
        }, 1500);
      } else {
        setBattleScore({ player: battleScore.player, cpu: newCpuScore });
      }
    }
  }, [gameOver, mode, gameStarted, cpus, battleScore, startLevel]);

  // 最高分
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bomber-pop-best', String(score));
    }
  }, [score, bestScore]);

  // 生存最佳记录
  useEffect(() => {
    if (mode !== 'survival' || gameOver !== 'lose') return;
    if (survivalSec > bestSurvivalSec) {
      setBestSurvivalSec(survivalSec);
      localStorage.setItem('bomber-pop-best-survival', String(survivalSec));
    }
  }, [gameOver, mode, survivalSec, bestSurvivalSec]);

  // 通关积分（仅街机模式 + 生存模式）
  useEffect(() => {
    if (gameOver !== 'win' || pointsAwarded !== null) return;
    if (mode === 'arcade') {
      const reward = Math.min(5 + levelNum * 3, 50);
      setPointsAwarded(0);
      awardGameCompletionBonus('bomber-pop', reward, `泡泡堂第 ${levelNum} 关通关`).then(res => {
        if (res && res.awarded > 0) {
          setPointsAwarded(res.awarded);
          toast({ title: `🎉 +${res.awarded} 积分`, description: `第 ${levelNum} 关通关${res.dailyRemaining === 0 ? '（今日已达上限）' : ''}` });
        } else setPointsAwarded(0);
      });
    } else if (mode === 'battle') {
      // 竞技不发积分
      setPointsAwarded(0);
    }
  }, [gameOver, levelNum, pointsAwarded, mode]);

  // 生存模式通关（玩家死亡时检查是否破纪录给积分）
  useEffect(() => {
    if (mode !== 'survival' || gameOver !== 'lose' || pointsAwarded !== null) return;
    if (survivalSec > bestSurvivalSec && survivalSec >= 60) {
      const reward = Math.min(Math.floor(survivalSec / 30) * 5, 30);
      setPointsAwarded(0);
      awardGameCompletionBonus('bomber-pop', reward, `泡泡堂生存模式 ${survivalSec}s`).then(res => {
        if (res && res.awarded > 0) {
          setPointsAwarded(res.awarded);
          toast({ title: `🎉 +${res.awarded} 积分`, description: `生存 ${survivalSec}s 破纪录！` });
        }
      });
    } else {
      setPointsAwarded(0);
    }
  }, [gameOver, mode, survivalSec, bestSurvivalSec, pointsAwarded]);

  // === 渲染 ===
  const cellSize = useMemo(() => {
    // 用于 FloatingText 定位
    return 40;
  }, []);

  const renderCell = (cell: CellType, x: number, y: number) => {
    const isPlayer = player.alive && player.x === x && player.y === y;
    const enemyHere = enemies.find(e => e.alive && e.x === x && e.y === y);
    const cpuHere = cpus.find(c => c.alive && c.x === x && c.y === y);
    const bombHere = bombs.find(b => b.x === x && b.y === y);
    const explosionHere = explosions.some(e => e.cells.some(c => c.x === x && c.y === y));
    const powerUpHere = activePowerUps.find(p => p.x === x && p.y === y);
    const sp = findSpecial(specialCells, x, y);

    return (
      <div
        key={`${x}-${y}`}
        className="relative overflow-hidden"
        style={{ aspectRatio: '1 / 1' }}
      >
        <PixelTile kind={cell === 'wall' ? 'wall' : cell === 'box' ? 'box' : 'grass'} theme={levelCfgRef.current.theme} />
        {sp && cell === 'empty' && <PixelSpecialCell kind={sp.kind} />}
        {powerUpHere && cell === 'empty' && !explosionHere && <PowerUpIcon type={powerUpHere.type} />}
        {bombHere && !explosionHere && <PixelBomb remote={bombHere.remote} />}
        {explosionHere && <PixelExplosion />}
        {isPlayer && <PixelPlayer characterId={characterId} hasShield={hasShield} />}
        {enemyHere && !isPlayer && <PixelEnemy intelligence={enemyHere.intelligence} kind={enemyHere.kind} frozen={freezeTicks > 0} />}
        {cpuHere && !isPlayer && <PixelEnemy intelligence={2} kind="normal" />}
      </div>
    );
  };

  // === 开始页 ===
  if (!gameStarted) {
    return (
      <StartScreen
        bestScore={bestScore}
        maxLevelReached={maxLevelReached}
        bestSurvivalSec={bestSurvivalSec}
        battleWins={battleWins}
        defaultCharacter={characterId}
        onStart={startNewGame}
      />
    );
  }

  const cfg = levelCfgRef.current;
  const enemiesAlive = enemies.filter(e => e.alive).length + cpus.filter(c => c.alive).length;
  const totalEnemies = enemies.length + cpus.length;

  return (
    <div className="space-y-3">
      {/* HUD */}
      <Card>
        <CardContent className="p-3">
          <Hud
            mode={mode}
            levelNum={levelNum}
            theme={cfg.theme}
            isBoss={cfg.isBoss}
            score={score}
            bestScore={bestScore}
            hp={hp}
            maxBombs={maxBombs}
            bombRange={bombRange}
            hasKick={hasKick}
            speedLevel={speedLevel}
            hasPierce={hasPierce}
            hasShield={hasShield}
            isRemote={isRemote}
            freezeTicks={freezeTicks}
            enemiesAlive={enemiesAlive}
            totalEnemies={totalEnemies}
            timeLeft={timeLeft}
            timeLimit={cfg.timeLimitSec}
            battleScore={battleScore}
            survivalSec={survivalSec}
            bestSurvivalSec={bestSurvivalSec}
            onRestart={restart}
          />
        </CardContent>
      </Card>

      {/* 棋盘 */}
      <Card>
        <CardContent className="p-2 sm:p-3">
          <div className="relative">
            <div
              className="grid gap-0 mx-auto rounded-md overflow-hidden select-none ring-2 ring-emerald-300/50"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                maxWidth: 'min(100%, 640px)',
              }}
            >
              {map.flatMap((row, y) => row.map((cell, x) => renderCell(cell, x, y)))}
            </div>
            <FloatingTextLayer texts={floatingTexts} cellSize={cellSize} />
            {stageBanner && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-sm border-2 border-primary px-6 py-3 rounded-lg text-xl sm:text-2xl font-bold animate-fade-in shadow-xl">
                  {stageBanner}
                </div>
              </div>
            )}
          </div>

          {gameOver && (
            <div className="mt-4 text-center space-y-3">
              <div className="text-4xl">
                {gameOver === 'all-clear' ? '👑' : gameOver === 'win' ? '🎉' : '💀'}
              </div>
              <h3 className="text-xl font-bold">
                {gameOver === 'all-clear' && '全部通关！恭喜成为炸弹大师'}
                {gameOver === 'win' && mode === 'arcade' && `第 ${levelNum} 关通关！`}
                {gameOver === 'win' && mode === 'battle' && `对战获胜！(${battleScore.player}-${battleScore.cpu})`}
                {gameOver === 'lose' && mode === 'survival' && `生存了 ${survivalSec} 秒`}
                {gameOver === 'lose' && mode !== 'survival' && '游戏结束'}
              </h3>
              <p className="text-muted-foreground">本局得分：{score}</p>
              {pointsAwarded !== null && pointsAwarded > 0 && (
                <p className="text-yellow-600 flex items-center justify-center gap-1">
                  <Coins className="h-4 w-4" /> 已发放 {pointsAwarded} 积分
                </p>
              )}
              <div className="flex gap-2 justify-center flex-wrap">
                {gameOver === 'win' && mode === 'arcade' && levelNum < ARCADE_TOTAL_LEVELS && (
                  <Button onClick={nextLevel}>
                    <Flame className="h-4 w-4 mr-2" /> 下一关
                  </Button>
                )}
                <Button variant={gameOver === 'win' ? 'outline' : 'default'} onClick={restart}>
                  <RotateCcw className="h-4 w-4 mr-2" /> 重新开始
                </Button>
                <Button variant="outline" onClick={() => setGameStarted(false)}>
                  <Home className="h-4 w-4 mr-2" /> 模式选择
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
                <Button variant="outline" size="icon" aria-label="向上移动"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'up'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <div />
                <Button variant="outline" size="icon" aria-label="向左移动"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'left'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <div />
                <Button variant="outline" size="icon" aria-label="向右移动"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'right'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
                <div />
                <Button variant="outline" size="icon" aria-label="向下移动"
                  onTouchStart={(e) => { e.preventDefault(); heldKeyRef.current = 'down'; }}
                  onTouchEnd={() => { heldKeyRef.current = null; }}>
                  <ArrowDown className="h-5 w-5" />
                </Button>
                <div />
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  onClick={placeBomb} aria-label="放置炸弹">
                  <Bomb className="h-7 w-7" />
                </Button>
                {isRemote && (
                  <Button size="lg"
                    className="h-12 w-16 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg"
                    onClick={detonateRemote} aria-label="引爆遥控炸弹">
                    <Radio className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" size="sm" onClick={onBack} className="w-full">
        返回游戏列表
      </Button>
    </div>
  );
};

export default BomberPopGame;
