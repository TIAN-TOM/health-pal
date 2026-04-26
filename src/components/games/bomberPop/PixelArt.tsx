import React from 'react';
import { Bomb, Flame, Footprints, Zap, Shield, Heart, Snowflake, Radio, Sparkles } from 'lucide-react';
import type { PowerUpType, ThemeKind, SpecialCellKind, CharacterId, EnemyKind } from './types';
import { getCharacter } from './characters';

const THEME_GRASS: Record<ThemeKind, { base: string; dot: string }> = {
  forest: { base: '#a7f3d0', dot: '#6ee7b7' },
  beach: { base: '#fde68a', dot: '#fbbf24' },
  ice: { base: '#bae6fd', dot: '#7dd3fc' },
  volcano: { base: '#fecaca', dot: '#f87171' },
};

const THEME_WALL: Record<ThemeKind, { base: string; light: string; dark: string; mid: string }> = {
  forest: { base: '#475569', light: '#64748b', dark: '#1e293b', mid: '#334155' },
  beach: { base: '#a16207', light: '#ca8a04', dark: '#713f12', mid: '#854d0e' },
  ice: { base: '#0e7490', light: '#0891b2', dark: '#155e75', mid: '#0e7490' },
  volcano: { base: '#7f1d1d', light: '#991b1b', dark: '#450a0a', mid: '#7f1d1d' },
};

// === 像素美术：8x8 SVG 块（无外部资源） ===
export const PixelTile: React.FC<{ kind: 'grass' | 'wall' | 'box'; theme?: ThemeKind }> = ({ kind, theme = 'forest' }) => {
  if (kind === 'grass') {
    const c = THEME_GRASS[theme];
    return (
      <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" shapeRendering="crispEdges">
        <rect width="8" height="8" fill={c.base} />
        <rect x="1" y="2" width="1" height="1" fill={c.dot} />
        <rect x="5" y="1" width="1" height="1" fill={c.dot} />
        <rect x="3" y="5" width="1" height="1" fill={c.dot} />
        <rect x="6" y="6" width="1" height="1" fill={c.dot} />
      </svg>
    );
  }
  if (kind === 'wall') {
    const c = THEME_WALL[theme];
    return (
      <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" shapeRendering="crispEdges">
        <rect width="8" height="8" fill={c.base} />
        <rect x="0" y="0" width="8" height="1" fill={c.light} />
        <rect x="0" y="0" width="1" height="8" fill={c.light} />
        <rect x="7" y="0" width="1" height="8" fill={c.dark} />
        <rect x="0" y="7" width="8" height="1" fill={c.dark} />
        <rect x="3" y="3" width="2" height="2" fill={c.mid} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" shapeRendering="crispEdges">
      <rect width="8" height="8" fill="#fbbf24" />
      <rect x="0" y="0" width="8" height="1" fill="#fcd34d" />
      <rect x="0" y="0" width="1" height="8" fill="#fcd34d" />
      <rect x="7" y="0" width="1" height="8" fill="#b45309" />
      <rect x="0" y="7" width="8" height="1" fill="#b45309" />
      <rect x="2" y="2" width="4" height="1" fill="#92400e" />
      <rect x="2" y="5" width="4" height="1" fill="#92400e" />
      <rect x="2" y="3" width="1" height="2" fill="#92400e" />
      <rect x="5" y="3" width="1" height="2" fill="#92400e" />
    </svg>
  );
};

export const PixelSpecialCell: React.FC<{ kind: SpecialCellKind }> = ({ kind }) => {
  if (kind === 'sand') {
    return (
      <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#fcd34d" opacity="0.6" />
        <rect x="1" y="3" width="2" height="1" fill="#b45309" opacity="0.5" />
        <rect x="4" y="5" width="2" height="1" fill="#b45309" opacity="0.5" />
        <rect x="2" y="6" width="1" height="1" fill="#b45309" opacity="0.5" />
        <rect x="5" y="2" width="1" height="1" fill="#b45309" opacity="0.5" />
      </svg>
    );
  }
  if (kind === 'ice') {
    return (
      <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#e0f2fe" opacity="0.85" />
        <rect x="1" y="1" width="6" height="1" fill="#bae6fd" />
        <rect x="1" y="6" width="6" height="1" fill="#bae6fd" />
        <rect x="3" y="3" width="2" height="2" fill="#ffffff" opacity="0.8" />
      </svg>
    );
  }
  // lava-vent
  return (
    <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full pointer-events-none animate-pulse" preserveAspectRatio="none" shapeRendering="crispEdges">
      <rect width="8" height="8" fill="#7f1d1d" opacity="0.5" />
      <rect x="2" y="2" width="4" height="4" fill="#dc2626" />
      <rect x="3" y="3" width="2" height="2" fill="#fbbf24" />
      <rect x="3" y="3" width="1" height="1" fill="#fef08a" />
    </svg>
  );
};

export const PixelBomb: React.FC<{ remote?: boolean }> = ({ remote }) => (
  <svg viewBox="0 0 8 8" className={`absolute inset-1 w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] ${remote ? '' : 'animate-pulse'}`} preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
    <rect x="2" y="2" width="4" height="4" fill="#1f2937" />
    <rect x="1" y="3" width="6" height="2" fill="#1f2937" />
    <rect x="2" y="2" width="1" height="1" fill="#6b7280" />
    <rect x="3" y="1" width="2" height="1" fill="#374151" />
    <rect x="4" y="0" width="1" height="1" fill={remote ? '#22d3ee' : '#f59e0b'} />
  </svg>
);

export const PixelExplosion: React.FC = () => (
  <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" shapeRendering="crispEdges">
    <rect width="8" height="8" fill="#fb923c" />
    <rect x="1" y="1" width="6" height="6" fill="#fde047" />
    <rect x="2" y="2" width="4" height="4" fill="#fff" opacity="0.8" />
  </svg>
);

export const PixelPlayer: React.FC<{ characterId?: CharacterId; hasShield?: boolean }> = ({ characterId = 'rabbit', hasShield }) => {
  const ch = getCharacter(characterId);
  return (
    <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
      {/* 耳/角配饰 */}
      <rect x="2" y="0" width="1" height="2" fill={ch.primary} />
      <rect x="5" y="0" width="1" height="2" fill={ch.primary} />
      <rect x="2" y="1" width="1" height="1" fill={ch.accent} />
      <rect x="5" y="1" width="1" height="1" fill={ch.accent} />
      {/* 头 */}
      <rect x="1" y="2" width="6" height="3" fill={ch.primary} />
      <rect x="2" y="3" width="1" height="1" fill="#1f2937" />
      <rect x="5" y="3" width="1" height="1" fill="#1f2937" />
      <rect x="3" y="4" width="2" height="1" fill={ch.accent} />
      {/* 身 */}
      <rect x="2" y="5" width="4" height="2" fill={ch.primary} />
      <rect x="1" y="7" width="2" height="1" fill={ch.primary} />
      <rect x="5" y="7" width="2" height="1" fill={ch.primary} />
      {/* 护盾光圈 */}
      {hasShield && (
        <rect x="0" y="0" width="8" height="8" fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.9" />
      )}
    </svg>
  );
};

const ENEMY_COLORS: Record<EnemyKind, string> = {
  normal: '#a78bfa',
  fast: '#22d3ee',
  tank: '#f59e0b',
  boss: '#dc2626',
};

export const PixelEnemy: React.FC<{ intelligence: 0 | 1 | 2; kind?: EnemyKind; frozen?: boolean }> = ({ intelligence, kind = 'normal', frozen }) => {
  let color = ENEMY_COLORS[kind];
  if (kind === 'normal') {
    const intColors: Record<number, string> = { 0: '#a78bfa', 1: '#f472b6', 2: '#ef4444' };
    color = intColors[intelligence] ?? color;
  }
  return (
    <svg viewBox="0 0 8 8" className={`absolute inset-0 w-full h-full ${frozen ? 'opacity-70' : ''}`} preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
      <rect x="2" y="0" width="4" height="1" fill={color} />
      <rect x="1" y="1" width="6" height="5" fill={color} />
      <rect x="0" y="6" width="2" height="1" fill={color} />
      <rect x="3" y="6" width="2" height="1" fill={color} />
      <rect x="6" y="6" width="2" height="1" fill={color} />
      <rect x="2" y="2" width="2" height="2" fill="#fff" />
      <rect x="4" y="2" width="2" height="2" fill="#fff" />
      <rect x="3" y="3" width="1" height="1" fill="#1f2937" />
      <rect x="5" y="3" width="1" height="1" fill="#1f2937" />
      {kind === 'tank' && <rect x="3" y="0" width="2" height="1" fill="#854d0e" />}
      {kind === 'boss' && (
        <>
          <rect x="2" y="-1" width="1" height="1" fill="#fbbf24" />
          <rect x="5" y="-1" width="1" height="1" fill="#fbbf24" />
        </>
      )}
      {frozen && (
        <rect x="0" y="0" width="8" height="8" fill="#bae6fd" opacity="0.4" />
      )}
    </svg>
  );
};

export const PowerUpIcon: React.FC<{ type: PowerUpType }> = ({ type }) => {
  const cls = 'absolute inset-0 m-auto w-3/4 h-3/4 drop-shadow';
  if (type === 'bomb') return <Bomb className={`${cls} text-red-600`} />;
  if (type === 'range') return <Flame className={`${cls} text-orange-600`} />;
  if (type === 'kick') return <Footprints className={`${cls} text-blue-600`} />;
  if (type === 'speed') return <Zap className={`${cls} text-yellow-600`} />;
  if (type === 'pierce') return <Sparkles className={`${cls} text-purple-600`} />;
  if (type === 'remote') return <Radio className={`${cls} text-cyan-600`} />;
  if (type === 'shield') return <Shield className={`${cls} text-sky-600`} />;
  if (type === 'life') return <Heart className={`${cls} text-rose-600`} />;
  return <Snowflake className={`${cls} text-cyan-500`} />;
};
