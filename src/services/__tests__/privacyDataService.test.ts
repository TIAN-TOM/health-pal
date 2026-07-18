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
  collectFullExport,
  deleteAllEmergencySmsLogs,
} from "../privacyDataService";

interface QueryOutcome {
  data?: unknown;
  error?: { code?: string; message: string } | null;
  count?: number | null;
}

// 模拟 select()/delete().eq() 链式调用，await 时返回给定结果
const makeChain = (result: QueryOutcome) => {
  const chain = {
    select: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    then: (
      resolve?: (value: QueryOutcome) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve({ data: null, error: null, count: null, ...result }).then(resolve, reject),
  };
  chain.select.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  return chain;
};

beforeEach(() => {
  getUserMock.mockReset();
  fromMock.mockReset();
  getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
});

describe("collectFullExport", () => {
  it("汇总各表数据；单表失败与未启用的表分别记为错误与跳过", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "diabetes_records") {
        return makeChain({ error: { code: "500", message: "boom" } });
      }
      if (table === "user_consents") {
        return makeChain({
          error: { code: "PGRST205", message: "Could not find the table in the schema cache" },
        });
      }
      return makeChain({ data: [{ id: `${table}-row` }] });
    });

    const result = await collectFullExport();

    expect(result.user_id).toBe("u1");
    expect(result.tables.meniere_records).toEqual([{ id: "meniere_records-row" }]);
    expect(result.tables.family_messages).toEqual([{ id: "family_messages-row" }]);
    // 失败的表不进 tables，而是如实进入 export_errors
    expect(result.tables).not.toHaveProperty("diabetes_records");
    expect(result.export_errors).toContainEqual({ table: "diabetes_records", message: "boom" });
    // 未启用（表不存在）的表既不导出也不算错误
    expect(result.tables).not.toHaveProperty("user_consents");
    expect(result.export_errors.some((e) => e.table === "user_consents")).toBe(false);
  });

  it("导出覆盖健康、家庭、积分与资料等核心表", async () => {
    fromMock.mockImplementation(() => makeChain({ data: [] }));
    const result = await collectFullExport();

    for (const table of [
      "profiles",
      "meniere_records",
      "diabetes_records",
      "daily_checkins",
      "user_medications",
      "voice_records",
      "emergency_sms_logs",
      "ai_weekly_reports",
      "user_points",
      "family_members",
    ]) {
      expect(result.tables).toHaveProperty(table);
    }
  });
});

describe("deleteAllEmergencySmsLogs", () => {
  it("删除后复查剩余 0 条视为成功", async () => {
    fromMock
      .mockReturnValueOnce(makeChain({ error: null }))
      .mockReturnValueOnce(makeChain({ count: 0 }));

    await expect(deleteAllEmergencySmsLogs()).resolves.toEqual({ remaining: 0 });
    expect(fromMock).toHaveBeenNthCalledWith(1, "emergency_sms_logs");
    expect(fromMock).toHaveBeenNthCalledWith(2, "emergency_sms_logs");
  });

  it("RLS 无 DELETE 策略时删除静默无效，remaining 如实反映残留", async () => {
    fromMock
      .mockReturnValueOnce(makeChain({ error: null }))
      .mockReturnValueOnce(makeChain({ count: 3 }));

    await expect(deleteAllEmergencySmsLogs()).resolves.toEqual({ remaining: 3 });
  });

  it("删除报错时按约定抛出", async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: { message: "denied" } }));
    await expect(deleteAllEmergencySmsLogs()).rejects.toBeTruthy();
  });
});
