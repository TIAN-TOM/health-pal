import { describe, it, expect } from "vitest";
import { getNextBreathingPhase } from "../breathing";

describe("getNextBreathingPhase", () => {
  it("cycles through all four phases for 4-4-4-4", () => {
    const p = { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
    expect(getNextBreathingPhase(p, "inhale")).toBe("hold1");
    expect(getNextBreathingPhase(p, "hold1")).toBe("exhale");
    expect(getNextBreathingPhase(p, "exhale")).toBe("hold2");
    expect(getNextBreathingPhase(p, "hold2")).toBe("inhale");
  });

  it("skips the zero-length second hold in 4-7-8-0", () => {
    const p = { inhale: 4, hold1: 7, exhale: 8, hold2: 0 };
    expect(getNextBreathingPhase(p, "inhale")).toBe("hold1");
    expect(getNextBreathingPhase(p, "hold1")).toBe("exhale");
    expect(getNextBreathingPhase(p, "exhale")).toBe("inhale");
  });

  it("skips both holds in 6-0-6-0", () => {
    const p = { inhale: 6, hold1: 0, exhale: 6, hold2: 0 };
    expect(getNextBreathingPhase(p, "inhale")).toBe("exhale");
    expect(getNextBreathingPhase(p, "exhale")).toBe("inhale");
  });

  it("falls back to inhale for an all-zero pattern", () => {
    const p = { inhale: 0, hold1: 0, exhale: 0, hold2: 0 };
    expect(getNextBreathingPhase(p, "exhale")).toBe("inhale");
  });
});
