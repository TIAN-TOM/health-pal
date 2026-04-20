/**
 * 简单的程序化音效。封装为 noop-on-error，避免在不支持 AudioContext 的环境抛异常。
 * 与原内联实现完全相同。
 */
export const playSound = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine'
) => {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
    // ignore audio errors silently
  }
};
