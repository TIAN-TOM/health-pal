import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    from: (...a: unknown[]) => fromMock(...a),
  },
}));
vi.mock("@/utils/beijingTime", () => ({
  getBeijingTimeISO: () => "2026-07-03T00:00:00+08:00",
}));
vi.mock("@/services/adminNotificationService", () => ({
  notifyAdminActivity: vi.fn().mockResolvedValue(undefined),
  ACTIVITY_TYPES: { CREATE: "create" },
  MODULE_NAMES: { MENIERE_RECORDS: "meniere" },
}));

import { saveMeniereRecord, getRecentRecords } from "../meniereRecordService";

beforeEach(() => {
  getUserMock.mockReset();
  fromMock.mockReset();
});

describe("meniereRecordService", () => {
  it("saveMeniereRecord throws when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(
      saveMeniereRecord({ type: "dizziness", severity: "mild" })
    ).rejects.toThrow("用户未登录");
  });

  it("saveMeniereRecord inserts with user id + timestamp", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    const insert = vi.fn().mockResolvedValue({ data: null, error: null });
    fromMock.mockReturnValue({ insert });
    await saveMeniereRecord({
      type: "dizziness",
      severity: "mild",
      duration: "10m",
      symptoms: ["旋转"],
    });
    expect(fromMock).toHaveBeenCalledWith("meniere_records");
    const payload = insert.mock.calls[0][0];
    expect(payload).toMatchObject({
      type: "dizziness",
      severity: "mild",
      duration: "10m",
      user_id: "u1",
      timestamp: "2026-07-03T00:00:00+08:00",
    });
  });

  it("saveMeniereRecord surfaces db error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: new Error("bad") }),
    });
    await expect(
      saveMeniereRecord({ type: "voice", note: "hi" })
    ).rejects.toThrow("bad");
  });

  it("getRecentRecords returns [] when not authed", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(getRecentRecords()).resolves.toEqual([]);
  });
});
