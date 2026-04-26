import React from 'react';
import { Bomb, Flame, Footprints, Zap, Shield, Heart, Snowflake, Radio, Trophy, Clock, Skull } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { GameMode, ThemeKind } from './types';

interface Props {
  mode: GameMode;
  levelNum: number;
  theme: ThemeKind;
  isBoss: boolean;
  score: number;
  bestScore: number;
  hp: number;
  maxBombs: number;
  bombRange: number;
  hasKick: boolean;
  speedLevel: number;
  hasPierce: boolean;
  hasShield: boolean;
  isRemote: boolean;
  freezeTicks: number;
  enemiesAlive: number;
  totalEnemies: number;
  timeLeft: number;
  timeLimit: number;
  // battle
  battleScore?: { player: number; cpu: number };
  // survival
  survivalSec?: number;
  bestSurvivalSec?: number;
  onRestart: () => void;
}

const THEME_LABEL: Record<ThemeKind, string> = {
  forest: '🌿 森林',
  beach: '🏖️ 沙滩',
  ice: '❄️ 冰原',
  volcano: '🔥 火山',
};

const Hud: React.FC<Props> = (p) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2 text-xs sm:text-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          {p.mode === 'arcade' && (
            <span className="font-bold">
              第 {p.levelNum} 关 {p.isBoss && <span className="text-red-600 ml-1">BOSS</span>}
            </span>
          )}
          {p.mode === 'survival' && <span className="font-bold">第 {p.levelNum} 波</span>}
          {p.mode === 'battle' && (
            <span className="font-bold">
              对战 {p.battleScore?.player ?? 0} : {p.battleScore?.cpu ?? 0}
            </span>
          )}
          <span className="text-muted-foreground">{THEME_LABEL[p.theme]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1" title="得分">
            <Trophy className="h-3.5 w-3.5 text-yellow-500" /> {p.score}
          </span>
          <Button variant="outline" size="sm" onClick={p.onRestart}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> 重开
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* HP */}
        <span className="flex items-center gap-0.5" title="生命值">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`h-3.5 w-3.5 ${i < p.hp ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground/30'}`}
            />
          ))}
        </span>
        <span className="flex items-center gap-1" title="炸弹数">
          <Bomb className="h-3.5 w-3.5 text-red-500" /> {p.maxBombs}
        </span>
        <span className="flex items-center gap-1" title="爆炸范围">
          <Flame className="h-3.5 w-3.5 text-orange-500" /> {p.bombRange}
        </span>
        {p.hasKick && <Footprints className="h-3.5 w-3.5 text-blue-500" />}
        {p.speedLevel > 0 && (
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-yellow-500" /> {p.speedLevel}
          </span>
        )}
        {p.hasPierce && <Sparkle />}
        {p.isRemote && <Radio className="h-3.5 w-3.5 text-cyan-500" title="遥控引爆 (R)" />}
        {p.hasShield && <Shield className="h-3.5 w-3.5 text-sky-500" title="护盾激活" />}
        {p.freezeTicks > 0 && (
          <span className="flex items-center gap-1 text-cyan-600 font-medium">
            <Snowflake className="h-3.5 w-3.5" /> {Math.ceil(p.freezeTicks / 10)}s
          </span>
        )}
        <span className="text-muted-foreground flex items-center gap-1">
          <Skull className="h-3.5 w-3.5" /> {p.enemiesAlive}
        </span>
      </div>

      {/* 时间条：街机和竞技用，生存模式显示存活时间 */}
      {(p.mode === 'arcade' || p.mode === 'battle') && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <Progress value={(p.timeLeft / p.timeLimit) * 100} className="h-2" />
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{p.timeLeft}s</span>
        </div>
      )}
      {p.mode === 'survival' && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-mono text-sm">{formatTime(p.survivalSec ?? 0)}</span>
          {p.bestSurvivalSec !== undefined && p.bestSurvivalSec > 0 && (
            <span className="text-xs text-muted-foreground">最佳 {formatTime(p.bestSurvivalSec)}</span>
          )}
        </div>
      )}
    </div>
  );
};

const Sparkle = () => (
  <svg className="h-3.5 w-3.5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
  </svg>
);

export default Hud;
