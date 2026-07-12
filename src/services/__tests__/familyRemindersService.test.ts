import { describe, it, expect, vi, beforeEach } from "vitest";

const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...a: unknown[]) => fromMock(...a),
  },
}));

import { familyRemindersService } from "../familyRemindersService";

beforeEach(() => {
  fromMock.mockReset();
});

describe("familyRemindersService.updateFamilyReminder", () => {
  it("显式传入 null 时会写入 update 载荷，用于清空 recurring_pattern", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "r1", is_recurring: false, recurring_pattern: null },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    // FamilyReminderUpdate 类型必须接受显式 null（编译期回归检查）
    await familyRemindersService.updateFamilyReminder("r1", {
      is_recurring: false,
      recurring_pattern: null,
    });

    expect(fromMock).toHaveBeenCalledWith("family_reminders");
    expect(update).toHaveBeenCalledWith({
      is_recurring: false,
      recurring_pattern: null,
    });
    expect(eq).toHaveBeenCalledWith("id", "r1");
  });
});
