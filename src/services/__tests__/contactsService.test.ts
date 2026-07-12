import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    from: (...a: unknown[]) => fromMock(...a),
  },
}));

import { deleteContact } from "../contactsService";

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";

interface ChainResult {
  error: unknown;
  count?: number | null;
}

// 模拟 supabase delete().eq().eq() 链式调用，await 时返回给定结果
const makeDeleteChain = (result: ChainResult) => {
  const chain = {
    delete: vi.fn(),
    eq: vi.fn(),
    then: (
      resolve?: (value: ChainResult) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(resolve, reject),
  };
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  return chain;
};

beforeEach(() => {
  getUserMock.mockReset();
  fromMock.mockReset();
});

describe("contactsService.deleteContact", () => {
  it("短信日志删除失败时中止，不再删除联系人", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockReturnValueOnce(makeDeleteChain({ error: new Error("fk violation") }));

    await expect(deleteContact(VALID_ID)).rejects.toThrow("删除相关短信记录失败");
    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith("emergency_sms_logs");
  });

  it("依次删除短信日志与联系人记录", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock
      .mockReturnValueOnce(makeDeleteChain({ error: null }))
      .mockReturnValueOnce(makeDeleteChain({ error: null, count: 1 }));

    await expect(deleteContact(VALID_ID)).resolves.toBeUndefined();
    expect(fromMock).toHaveBeenNthCalledWith(1, "emergency_sms_logs");
    expect(fromMock).toHaveBeenNthCalledWith(2, "emergency_contacts");
  });
});
