import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const fromMock = vi.fn();
const functionsInvokeMock = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    from: (...a: unknown[]) => fromMock(...a),
    functions: { invoke: (...a: unknown[]) => functionsInvokeMock(...a) },
  },
}));

vi.mock("@/utils/beijingTime", () => ({
  getBeijingDateString: () => "20260703",
  getBeijingTimeISO: () => "2026-07-03T00:00:00+08:00",
}));

import {
  createCheckin,
  getTodayCheckin,
  cancelCheckin,
} from "../dailyCheckinService";

// Table builder helper
const makeBuilder = (final: unknown) => {
  const b: any = {};
  ["select", "eq", "gte", "lte", "order", "limit", "insert", "delete"].forEach((m) => {
    b[m] = vi.fn(() => b);
  });
  b.maybeSingle = vi.fn().mockResolvedValue(final);
  b.single = vi.fn().mockResolvedValue(final);
  b.then = (onOk: any) => Promise.resolve(final).then(onOk);
  return b;
};

beforeEach(() => {
  getUserMock.mockReset();
  fromMock.mockReset();
  functionsInvokeMock.mockClear();
});

describe("dailyCheckinService", () => {
  it("createCheckin throws when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(createCheckin(3, "hi")).rejects.toThrow("用户未登录");
  });

  it("createCheckin refuses duplicate same-day checkin", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    // First from() call → existing checkin lookup returns a row
    const existingBuilder = makeBuilder({ data: { id: "c1" }, error: null });
    fromMock.mockReturnValueOnce(existingBuilder);
    await expect(createCheckin(3)).rejects.toThrow("今日已完成打卡");
  });

  it("createCheckin inserts row and notifies admin on success", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    // 1: existing checkin lookup → none
    fromMock.mockReturnValueOnce(makeBuilder({ data: null, error: null }));
    // 2: insert().select().single() → new row
    fromMock.mockReturnValueOnce(
      makeBuilder({ data: { id: "new1", mood_score: 4 }, error: null })
    );
    // 3: profile lookup
    fromMock.mockReturnValueOnce(
      makeBuilder({ data: { full_name: "Tester" }, error: null })
    );
    const row = await createCheckin(4, "note");
    expect(row).toMatchObject({ id: "new1" });
    expect(functionsInvokeMock).toHaveBeenCalledWith(
      "notify-admin-checkin",
      expect.objectContaining({
        body: expect.objectContaining({ checkin_date: "20260703", mood_score: 4 }),
      })
    );
  });

  it("getTodayCheckin returns null when not authed", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(getTodayCheckin()).resolves.toBeNull();
  });

  it("cancelCheckin throws when not authed", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(cancelCheckin("c1")).rejects.toThrow("用户未登录");
  });

  it("cancelCheckin surfaces supabase error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    const b: any = {
      delete: vi.fn(() => b),
      eq: vi.fn(() => b),
      then: (onOk: any) => Promise.resolve({ error: { message: "denied" } }).then(onOk),
    };
    fromMock.mockReturnValue(b);
    await expect(cancelCheckin("c1")).rejects.toThrow(/denied/);
  });
});
