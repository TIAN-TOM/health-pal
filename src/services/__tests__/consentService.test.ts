import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    from: (...a: unknown[]) => fromMock(...a),
  },
}));

import {
  getHealthDataConsentStatus,
  recordHealthDataConsent,
  HEALTH_DATA_CONSENT_TYPE,
  HEALTH_DATA_CONSENT_VERSION,
} from "../consentService";

interface SelectResult {
  data: unknown;
  error: { code?: string; message?: string } | null;
}

// 模拟 select().eq().eq().order().limit() 链式调用，await 时返回给定结果
const makeSelectChain = (result: SelectResult) => {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    then: (
      resolve?: (value: SelectResult) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(resolve, reject),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  return chain;
};

beforeEach(() => {
  getUserMock.mockReset();
  fromMock.mockReset();
  getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
});

describe("getHealthDataConsentStatus", () => {
  it("当前版本已同意时返回 granted 与同意时间", async () => {
    fromMock.mockReturnValueOnce(
      makeSelectChain({
        data: [
          {
            consent_version: HEALTH_DATA_CONSENT_VERSION,
            granted: true,
            created_at: "2026-07-18T00:00:00Z",
          },
        ],
        error: null,
      })
    );

    await expect(getHealthDataConsentStatus()).resolves.toEqual({
      status: "granted",
      consentedAt: "2026-07-18T00:00:00Z",
    });
    expect(fromMock).toHaveBeenCalledWith("user_consents");
  });

  it("从未同意时返回 required", async () => {
    fromMock.mockReturnValueOnce(makeSelectChain({ data: [], error: null }));
    await expect(getHealthDataConsentStatus()).resolves.toEqual({ status: "required" });
  });

  it("同意的是旧版本时返回 required", async () => {
    fromMock.mockReturnValueOnce(
      makeSelectChain({
        data: [{ consent_version: "2025-01-01", granted: true, created_at: "x" }],
        error: null,
      })
    );
    await expect(getHealthDataConsentStatus()).resolves.toEqual({ status: "required" });
  });

  it("已撤回（granted=false）时返回 required", async () => {
    fromMock.mockReturnValueOnce(
      makeSelectChain({
        data: [
          { consent_version: HEALTH_DATA_CONSENT_VERSION, granted: false, created_at: "x" },
        ],
        error: null,
      })
    );
    await expect(getHealthDataConsentStatus()).resolves.toEqual({ status: "required" });
  });

  it("user_consents 表不存在（迁移未应用）时返回 unavailable 而不是抛错", async () => {
    fromMock.mockReturnValueOnce(
      makeSelectChain({
        data: null,
        error: {
          code: "PGRST205",
          message: "Could not find the table 'public.user_consents' in the schema cache",
        },
      })
    );
    await expect(getHealthDataConsentStatus()).resolves.toEqual({ status: "unavailable" });
  });

  it("其他查询错误按约定抛出", async () => {
    fromMock.mockReturnValueOnce(
      makeSelectChain({ data: null, error: { code: "500", message: "boom" } })
    );
    await expect(getHealthDataConsentStatus()).rejects.toBeTruthy();
  });
});

describe("recordHealthDataConsent", () => {
  it("写入带类型、版本与 user_id 的同意记录", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValueOnce({ insert: insertMock });

    await expect(recordHealthDataConsent(true)).resolves.toBeUndefined();
    expect(fromMock).toHaveBeenCalledWith("user_consents");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "u1",
        consent_type: HEALTH_DATA_CONSENT_TYPE,
        consent_version: HEALTH_DATA_CONSENT_VERSION,
        granted: true,
      })
    );
  });

  it("撤回同意时写入 granted=false 的新记录", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValueOnce({ insert: insertMock });

    await recordHealthDataConsent(false);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ granted: false }));
  });

  it("未登录时抛错，不写入", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    await expect(recordHealthDataConsent(true)).rejects.toThrow("用户未登录");
    expect(fromMock).not.toHaveBeenCalled();
  });
});
