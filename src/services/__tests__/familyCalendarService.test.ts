import { describe, it, expect, vi, beforeEach } from "vitest";

const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...a: unknown[]) => fromMock(...a),
  },
}));

import { familyCalendarService } from "../familyCalendarService";

beforeEach(() => {
  fromMock.mockReset();
});

describe("familyCalendarService.updateFamilyCalendarEvent", () => {
  it("显式传入 null 时会写入 update 载荷，用于清空全天事件的时间列", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "e1", start_time: null, end_time: null, color: null },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    // FamilyCalendarEventUpdate 类型必须接受显式 null（编译期回归检查）
    const result = await familyCalendarService.updateFamilyCalendarEvent("e1", {
      is_all_day: true,
      start_time: null,
      end_time: null,
    });

    expect(fromMock).toHaveBeenCalledWith("family_calendar_events");
    expect(update).toHaveBeenCalledWith({
      is_all_day: true,
      start_time: null,
      end_time: null,
    });
    expect(eq).toHaveBeenCalledWith("id", "e1");
    // color 为空时回退默认蓝色
    expect(result.color).toBe("#3B82F6");
  });
});
