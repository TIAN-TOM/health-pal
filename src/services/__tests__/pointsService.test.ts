import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();
const fromMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    rpc: (...a: unknown[]) => rpcMock(...a),
    from: (...a: unknown[]) => fromMock(...a),
  },
}));

import {
  getUserPoints,
  getEffectiveUserPoints,
  updatePointsForCheckin,
  spendPoints,
  claimBirthdayBonus,
  awardGameCompletionBonus,
} from "../pointsService";

beforeEach(() => {
  rpcMock.mockReset();
  fromMock.mockReset();
  getUserMock.mockReset();
});

describe("pointsService", () => {
  it("getUserPoints returns null when not authed", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(getUserPoints()).resolves.toBeNull();
  });

  it("getEffectiveUserPoints returns rpc value", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    rpcMock.mockResolvedValue({ data: 42, error: null });
    await expect(getEffectiveUserPoints()).resolves.toBe(42);
    expect(rpcMock).toHaveBeenCalledWith("get_effective_user_points", { check_user_id: "u1" });
  });

  it("getEffectiveUserPoints returns 0 on error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    rpcMock.mockResolvedValue({ data: null, error: { message: "fail" } });
    await expect(getEffectiveUserPoints()).resolves.toBe(0);
  });

  it("updatePointsForCheckin returns points+streak on success", async () => {
    rpcMock.mockResolvedValue({
      data: { success: true, points_awarded: 10, streak: 3 },
      error: null,
    });
    await expect(updatePointsForCheckin()).resolves.toEqual({ points: 10, streak: 3 });
  });

  it("updatePointsForCheckin returns null when success=false", async () => {
    rpcMock.mockResolvedValue({ data: { success: false, error: "dup" }, error: null });
    await expect(updatePointsForCheckin()).resolves.toBeNull();
  });

  it("spendPoints returns true only when server confirms", async () => {
    rpcMock.mockResolvedValue({ data: { success: true }, error: null });
    await expect(spendPoints(5, "buy")).resolves.toBe(true);
    rpcMock.mockResolvedValue({ data: { success: false }, error: null });
    await expect(spendPoints(5, "buy")).resolves.toBe(false);
    rpcMock.mockResolvedValue({ data: null, error: { message: "x" } });
    await expect(spendPoints(5, "buy")).resolves.toBe(false);
  });

  it("claimBirthdayBonus proxies to award_birthday_bonus", async () => {
    rpcMock.mockResolvedValue({ data: { success: true }, error: null });
    await expect(claimBirthdayBonus()).resolves.toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("award_birthday_bonus");
  });

  it("awardGameCompletionBonus returns awarded + remaining", async () => {
    rpcMock.mockResolvedValue({
      data: { success: true, points_awarded: 20, daily_remaining: 80 },
      error: null,
    });
    await expect(awardGameCompletionBonus("g1", 20)).resolves.toEqual({
      awarded: 20,
      dailyRemaining: 80,
    });
  });
});
