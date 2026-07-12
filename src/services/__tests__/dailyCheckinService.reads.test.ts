import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    from: (...a: unknown[]) => fromMock(...a),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  },
}));

vi.mock("@/utils/beijingTime", () => ({
  getBeijingDateString: () => "2026-07-13",
  getBeijingTimeISO: () => "2026-07-13T00:00:00+08:00",
}));

import {
  getTodayCheckin,
  getRecentCheckins,
  getCheckinHistory,
  getCheckinsByDateRange,
} from "../dailyCheckinService";

// Table builder helper
const makeBuilder = (final: unknown) => {
  const b: any = {};
  ["select", "eq", "gte", "lte", "order", "limit"].forEach((m) => {
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
});

// 读函数必须在 supabase 出错时抛错（供 react-query 捕获），未登录时保持原有的空值返回
describe("dailyCheckinService read functions", () => {
  it("getTodayCheckin throws when supabase returns an error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValue(makeBuilder({ data: null, error: { message: "boom" } }));
    await expect(getTodayCheckin()).rejects.toThrow(/boom/);
  });

  it("getTodayCheckin returns the row on success", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValue(
      makeBuilder({ data: { id: "c1", checkin_date: "2026-07-13" }, error: null })
    );
    await expect(getTodayCheckin()).resolves.toMatchObject({ id: "c1" });
  });

  it("getRecentCheckins throws when supabase returns an error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValue(makeBuilder({ data: null, error: { message: "denied" } }));
    await expect(getRecentCheckins(10)).rejects.toThrow(/denied/);
  });

  it("getRecentCheckins returns [] when not authed", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(getRecentCheckins(10)).resolves.toEqual([]);
  });

  it("getCheckinHistory throws when supabase returns an error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValue(makeBuilder({ data: null, error: { message: "rls" } }));
    await expect(getCheckinHistory(90)).rejects.toThrow(/rls/);
  });

  it("getCheckinHistory returns rows on success", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValue(
      makeBuilder({ data: [{ id: "c1" }, { id: "c2" }], error: null })
    );
    await expect(getCheckinHistory(90)).resolves.toHaveLength(2);
  });

  it("getCheckinsByDateRange throws when supabase returns an error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValue(makeBuilder({ data: null, error: { message: "range" } }));
    await expect(
      getCheckinsByDateRange("2026-07-01", "2026-07-13")
    ).rejects.toThrow(/range/);
  });
});
