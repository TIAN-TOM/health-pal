import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHighScore } from "../useHighScore";

const KEY = "test-high-score";

describe("useHighScore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to 0 when nothing is stored", () => {
    const { result } = renderHook(() => useHighScore(KEY));
    expect(result.current.highScore).toBe(0);
  });

  it("reads the stored record on mount", () => {
    localStorage.setItem(KEY, "120");
    const { result } = renderHook(() => useHighScore(KEY));
    expect(result.current.highScore).toBe(120);
  });

  it("falls back to 0 for corrupted stored values", () => {
    localStorage.setItem(KEY, "not-a-number");
    const { result } = renderHook(() => useHighScore(KEY));
    expect(result.current.highScore).toBe(0);
  });

  it("persists and updates when the score beats the record", () => {
    const { result } = renderHook(() => useHighScore(KEY));

    let isNewRecord = false;
    act(() => {
      isNewRecord = result.current.reportScore(50);
    });

    expect(isNewRecord).toBe(true);
    expect(result.current.highScore).toBe(50);
    expect(localStorage.getItem(KEY)).toBe("50");
  });

  it("ignores scores at or below the record", () => {
    localStorage.setItem(KEY, "100");
    const { result } = renderHook(() => useHighScore(KEY));

    let isNewRecord = true;
    act(() => {
      isNewRecord = result.current.reportScore(100);
    });

    expect(isNewRecord).toBe(false);
    expect(result.current.highScore).toBe(100);
    expect(localStorage.getItem(KEY)).toBe("100");
  });

  it("compares against the latest record across successive reports", () => {
    const { result } = renderHook(() => useHighScore(KEY));

    act(() => {
      result.current.reportScore(30);
      result.current.reportScore(20);
      result.current.reportScore(40);
    });

    expect(result.current.highScore).toBe(40);
    expect(localStorage.getItem(KEY)).toBe("40");
  });
});
