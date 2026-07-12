import { useCallback, useRef, useState } from 'react';

/**
 * localStorage-backed high score shared by the mini games.
 * `reportScore` persists only when the score beats the stored record and
 * returns whether a new record was set; callers can report unconditionally.
 * Tracks the record in a ref so reports from stale game-loop closures still
 * compare against the latest value.
 */
export function useHighScore(storageKey: string) {
  const [highScore, setHighScore] = useState(() => {
    const saved = Number.parseInt(localStorage.getItem(storageKey) ?? '0', 10);
    return Number.isNaN(saved) ? 0 : saved;
  });
  const highScoreRef = useRef(highScore);

  const reportScore = useCallback(
    (score: number) => {
      if (score <= highScoreRef.current) return false;
      highScoreRef.current = score;
      localStorage.setItem(storageKey, String(score));
      setHighScore(score);
      return true;
    },
    [storageKey]
  );

  return { highScore, reportScore };
}
