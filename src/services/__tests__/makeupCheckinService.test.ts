import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const fromMock = vi.fn();
const rpcMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    from: (...a: unknown[]) => fromMock(...a),
    rpc: (...a: unknown[]) => rpcMock(...a),
  },
}));
vi.mock("@/utils/beijingTime", () => ({
  getBeijingTimeISO: () => "2026-07-03T00:00:00+08:00",
}));
vi.mock("@/services/adminNotificationService", () => ({
  notifyAdminActivity: vi.fn().mockResolvedValue(undefined),
  ACTIVITY_TYPES: { MAKEUP_CHECKIN: "makeup_checkin" },
  MODULE_NAMES: { CHECKIN: "checkin" },
}));

import {
  createMakeupCheckin,
  getUserMakeupCards,
  consumeMakeupCard,
} from "../makeupCheckinService";

const makeBuilder = (final: unknown) => {
  const b: any = {};
  ["select", "eq", "gte", "lte", "insert"].forEach((m) => {
    b[m] = vi.fn(() => b);
  });
  b.maybeSingle = vi.fn().mockResolvedValue(final);
  b.single = vi.fn().mockResolvedValue(final);
  return b;
};

beforeEach(() => {
  getUserMock.mockReset();
  fromMock.mockReset();
  rpcMock.mockReset();
});

describe("makeupCheckinService", () => {
  it("createMakeupCheckin rejects unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(createMakeupCheckin("2026-07-01")).rejects.toThrow("用户未登录");
  });

  it("createMakeupCheckin rejects future dates", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValueOnce(makeBuilder({ data: null, error: null }));
    await expect(createMakeupCheckin("2999-01-01")).rejects.toThrow(
      "不能补签未来的日期"
    );
  });

  it("createMakeupCheckin rejects duplicate", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValueOnce(makeBuilder({ data: { id: "c1" }, error: null }));
    await expect(createMakeupCheckin("2026-06-01")).rejects.toThrow(
      "该日期已有打卡记录"
    );
  });

  it("getUserMakeupCards returns quantity, 0 when missing", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValueOnce(makeBuilder({ data: { quantity: 3 }, error: null }));
    await expect(getUserMakeupCards()).resolves.toBe(3);

    fromMock.mockReturnValueOnce(makeBuilder({ data: null, error: null }));
    await expect(getUserMakeupCards()).resolves.toBe(0);
  });

  it("consumeMakeupCard false when no inventory", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValueOnce(
      makeBuilder({ data: { item_id: "i1", quantity: 0 }, error: null })
    );
    await expect(consumeMakeupCard()).resolves.toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("consumeMakeupCard calls consume_inventory_item and returns success", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValueOnce(
      makeBuilder({ data: { item_id: "i1", quantity: 2 }, error: null })
    );
    rpcMock.mockResolvedValue({ data: { success: true }, error: null });
    await expect(consumeMakeupCard()).resolves.toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("consume_inventory_item", {
      p_item_id: "i1",
      p_quantity: 1,
    });
  });
});
