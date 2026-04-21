import React from 'react';
import { Bomb, Flame, Footprints, Zap } from 'lucide-react';
import type { PowerUpType } from './types';

// === 像素美术：8x8 SVG 块（无外部资源） ===
export const PixelTile: React.FC<{ kind: 'grass' | 'wall' | 'box' }> = ({ kind }) => {
  if (kind === 'grass') {
    return (
      <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#a7f3d0" />
        <rect x="1" y="2" width="1" height="1" fill="#6ee7b7" />
        <rect x="5" y="1" width="1" height="1" fill="#6ee7b7" />
        <rect x="3" y="5" width="1" height="1" fill="#6ee7b7" />
        <rect x="6" y="6" width="1" height="1" fill="#6ee7b7" />
      </svg>
    );
  }
  if (kind === 'wall') {
    return (
      <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#475569" />
        <rect x="0" y="0" width="8" height="1" fill="#64748b" />
        <rect x="0" y="0" width="1" height="8" fill="#64748b" />
        <rect x="7" y="0" width="1" height="8" fill="#1e293b" />
        <rect x="0" y="7" width="8" height="1" fill="#1e293b" />
        <rect x="3" y="3" width="2" height="2" fill="#334155" />
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

export const PixelBomb: React.FC = () => (
  <svg viewBox="0 0 8 8" className="absolute inset-1 w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] animate-pulse" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
    <rect x="2" y="2" width="4" height="4" fill="#1f2937" />
    <rect x="1" y="3" width="6" height="2" fill="#1f2937" />
    <rect x="2" y="2" width="1" height="1" fill="#6b7280" />
    <rect x="3" y="1" width="2" height="1" fill="#374151" />
    <rect x="4" y="0" width="1" height="1" fill="#f59e0b" />
  </svg>
);

export const PixelExplosion: React.FC = () => (
  <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" shapeRendering="crispEdges">
    <rect width="8" height="8" fill="#fb923c" />
    <rect x="1" y="1" width="6" height="6" fill="#fde047" />
    <rect x="2" y="2" width="4" height="4" fill="#fff" opacity="0.8" />
  </svg>
);

export const PixelPlayer: React.FC = () => (
  <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
    {/* 兔耳 */}
    <rect x="2" y="0" width="1" height="2" fill="#fff" />
    <rect x="5" y="0" width="1" height="2" fill="#fff" />
    <rect x="2" y="1" width="1" height="1" fill="#fbcfe8" />
    <rect x="5" y="1" width="1" height="1" fill="#fbcfe8" />
    {/* 头 */}
    <rect x="1" y="2" width="6" height="3" fill="#fff" />
    <rect x="2" y="3" width="1" height="1" fill="#1f2937" />
    <rect x="5" y="3" width="1" height="1" fill="#1f2937" />
    <rect x="3" y="4" width="2" height="1" fill="#f472b6" />
    {/* 身 */}
    <rect x="2" y="5" width="4" height="2" fill="#fff" />
    <rect x="1" y="7" width="2" height="1" fill="#fff" />
    <rect x="5" y="7" width="2" height="1" fill="#fff" />
  </svg>
);

export const PixelEnemy: React.FC<{ intelligence: 0 | 1 | 2 }> = ({ intelligence }) => {
  const colors: Record<number, string> = { 0: '#a78bfa', 1: '#f472b6', 2: '#ef4444' };
  const color = colors[intelligence] ?? '#a78bfa';
  return (
    <svg viewBox="0 0 8 8" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
      <rect x="2" y="0" width="4" height="1" fill={color} />
      <rect x="1" y="1" width="6" height="5" fill={color} />
      <rect x="0" y="6" width="2" height="1" fill={color} />
      <rect x="3" y="6" width="2" height="1" fill={color} />
      <rect x="6" y="6" width="2" height="1" fill={color} />
      {/* 眼 */}
      <rect x="2" y="2" width="2" height="2" fill="#fff" />
      <rect x="4" y="2" width="2" height="2" fill="#fff" />
      <rect x="3" y="3" width="1" height="1" fill="#1f2937" />
      <rect x="5" y="3" width="1" height="1" fill="#1f2937" />
    </svg>
  );
};

export const PowerUpIcon: React.FC<{ type: PowerUpType }> = ({ type }) => {
  if (type === 'bomb') return <Bomb className="absolute inset-0 m-auto w-3/4 h-3/4 text-red-600 drop-shadow" />;
  if (type === 'range') return <Flame className="absolute inset-0 m-auto w-3/4 h-3/4 text-orange-600 drop-shadow" />;
  if (type === 'kick') return <Footprints className="absolute inset-0 m-auto w-3/4 h-3/4 text-blue-600 drop-shadow" />;
  return <Zap className="absolute inset-0 m-auto w-3/4 h-3/4 text-yellow-600 drop-shadow" />;
};
