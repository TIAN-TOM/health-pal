import type { LevelConfig } from './types';

export const buildLevel = (level: number): LevelConfig => {
  const clamped = Math.max(1, level);
  const enemyCount = Math.min(2 + Math.floor((clamped - 1) / 1.5), 6);
  let intelligence: 0 | 1 | 2 = 0;
  if (clamped >= 2) intelligence = 1;
  if (clamped >= 4) intelligence = 2;
  const enemyMoveTicks = Math.max(2, 6 - Math.floor(clamped / 2));
  const boxRate = Math.min(0.45 + clamped * 0.04, 0.7);
  const timeLimitSec = Math.max(60, 150 - clamped * 10);
  const powerUpRate = Math.min(0.2 + clamped * 0.02, 0.4);
  return { level: clamped, enemyCount, enemyIntelligence: intelligence, enemyMoveTicks, boxRate, timeLimitSec, powerUpRate };
};
