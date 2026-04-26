import type { LevelConfig, ThemeKind, GameMode } from './types';
import { ARCADE_TOTAL_LEVELS } from './modes';

const themeForLevel = (level: number): ThemeKind => {
  if (level <= 3) return 'forest';
  if (level <= 6) return 'beach';
  if (level <= 9) return 'ice';
  return 'volcano';
};

export const buildLevel = (level: number, mode: GameMode = 'arcade'): LevelConfig => {
  const clamped = Math.max(1, level);

  if (mode === 'battle') {
    return {
      level: clamped,
      enemyCount: 3,
      enemyIntelligence: 2,
      enemyMoveTicks: 3,
      boxRate: 0.5,
      timeLimitSec: 120,
      powerUpRate: 0.3,
      theme: 'forest',
      isBoss: false,
    };
  }

  if (mode === 'survival') {
    return {
      level: clamped,
      enemyCount: 2,
      enemyIntelligence: Math.min(2, Math.floor(clamped / 2)) as 0 | 1 | 2,
      enemyMoveTicks: Math.max(2, 5 - Math.floor(clamped / 3)),
      boxRate: 0.45,
      timeLimitSec: 9999, // 生存模式无时限
      powerUpRate: 0.25,
      theme: themeForLevel(clamped),
      isBoss: false,
    };
  }

  // arcade
  const isBoss = clamped % 5 === 0 && clamped <= ARCADE_TOTAL_LEVELS;
  const enemyCount = isBoss ? 1 : Math.min(2 + Math.floor((clamped - 1) / 1.5), 6);
  let intelligence: 0 | 1 | 2 = 0;
  if (clamped >= 2) intelligence = 1;
  if (clamped >= 4) intelligence = 2;
  const enemyMoveTicks = Math.max(2, 6 - Math.floor(clamped / 2));
  const boxRate = Math.min(0.45 + clamped * 0.04, 0.7);
  const timeLimitSec = Math.max(60, 150 - clamped * 10);
  const powerUpRate = Math.min(0.2 + clamped * 0.02, 0.4);

  return {
    level: clamped,
    enemyCount,
    enemyIntelligence: intelligence,
    enemyMoveTicks,
    boxRate,
    timeLimitSec,
    powerUpRate,
    theme: themeForLevel(clamped),
    isBoss,
    bossKind: isBoss ? 'tank' : undefined,
  };
};
