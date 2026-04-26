export type SfxKey =
  | 'step'
  | 'bomb_place'
  | 'explode'
  | 'pickup'
  | 'hurt'
  | 'win'
  | 'lose'
  | 'freeze'
  | 'boss';

interface SfxPreset {
  freq: number;
  duration: number;
  type: OscillatorType;
}

export const SFX: Record<SfxKey, SfxPreset> = {
  step: { freq: 220, duration: 0.05, type: 'square' },
  bomb_place: { freq: 220, duration: 0.12, type: 'square' },
  explode: { freq: 80, duration: 0.4, type: 'sawtooth' },
  pickup: { freq: 660, duration: 0.18, type: 'sine' },
  hurt: { freq: 120, duration: 0.5, type: 'triangle' },
  win: { freq: 880, duration: 0.5, type: 'sine' },
  lose: { freq: 80, duration: 0.6, type: 'sawtooth' },
  freeze: { freq: 440, duration: 0.3, type: 'sine' },
  boss: { freq: 200, duration: 0.6, type: 'sawtooth' },
};

export const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
  } catch {
    // ignore
  }
};

export const playSfx = (key: SfxKey) => {
  const p = SFX[key];
  playSound(p.freq, p.duration, p.type);
};
