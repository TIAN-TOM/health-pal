export type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export type BreathingPhaseDurations = Record<BreathingPhase, number>;

const PHASE_ORDER: BreathingPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];

/**
 * Next phase in the breathing cycle, skipping phases the pattern sets to 0
 * (e.g. 4-7-8 has no second hold). Falls back to 'inhale' if every duration
 * is zero so a malformed pattern cannot spin forever.
 */
export function getNextBreathingPhase(
  durations: BreathingPhaseDurations,
  current: BreathingPhase
): BreathingPhase {
  if (PHASE_ORDER.every((p) => durations[p] === 0)) return 'inhale';
  let next = (PHASE_ORDER.indexOf(current) + 1) % PHASE_ORDER.length;
  while (durations[PHASE_ORDER[next]] === 0) {
    next = (next + 1) % PHASE_ORDER.length;
  }
  return PHASE_ORDER[next];
}
