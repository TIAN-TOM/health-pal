import { describe, it, expect, vi, afterEach } from "vitest";
import { getBeijingTimeISO, getBeijingDateString } from "../beijingTime";

// 进程内无法切换真实时区，这里通过 mock getTimezoneOffset 与本地历法 getters
// 来模拟固定偏移的设备时区（不含 DST）：本地历法字段等价于按偏移平移后的 UTC 历法字段。
// 必须在 vi.useFakeTimers() 之后调用，且每个用例结束后由 afterEach 恢复。
const mockDeviceTimezone = (offsetMinutes: number) => {
  const shiftMs = -offsetMinutes * 60000;
  vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(offsetMinutes);
  vi.spyOn(Date.prototype, "getFullYear").mockImplementation(function (this: Date) {
    return new Date(this.getTime() + shiftMs).getUTCFullYear();
  });
  vi.spyOn(Date.prototype, "getMonth").mockImplementation(function (this: Date) {
    return new Date(this.getTime() + shiftMs).getUTCMonth();
  });
  vi.spyOn(Date.prototype, "getDate").mockImplementation(function (this: Date) {
    return new Date(this.getTime() + shiftMs).getUTCDate();
  });
};

// [设备名, getTimezoneOffset 返回值]
const DEVICES: Array<[string, number]> = [
  ["上海 UTC+8", -480],
  ["悉尼 UTC+10", -600],
  ["UTC+0", 0],
];

const simulateDeviceAt = (instantISO: string, offsetMinutes: number) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(instantISO));
  mockDeviceTimezone(offsetMinutes);
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("getBeijingTimeISO", () => {
  it.each(DEVICES)("在 %s 设备上返回真 UTC 时间戳", (_name, offset) => {
    const instant = "2026-07-12T16:30:00.000Z";
    simulateDeviceAt(instant, offset);
    expect(getBeijingTimeISO()).toBe(instant);
  });

  it.each(DEVICES)("在 %s 设备上跨北京日界仍为真 UTC", (_name, offset) => {
    // 北京时间 2026-07-13 07:59（UTC 前一天 23:59），旧实现会偏差 (8h - 设备偏移)
    const instant = "2026-07-12T23:59:00.000Z";
    simulateDeviceAt(instant, offset);
    expect(getBeijingTimeISO()).toBe(instant);
  });
});

describe("getBeijingDateString", () => {
  it.each(DEVICES)("在 %s 设备上，北京 00:30 返回北京次日", (_name, offset) => {
    // 2026-07-12T16:30Z = 北京时间 2026-07-13 00:30（刚过北京零点）
    simulateDeviceAt("2026-07-12T16:30:00.000Z", offset);
    expect(getBeijingDateString()).toBe("2026-07-13");
  });

  it.each(DEVICES)("在 %s 设备上，北京 23:59 仍返回北京当日", (_name, offset) => {
    // 2026-07-12T15:59Z = 北京时间 2026-07-12 23:59（北京零点前一分钟）
    simulateDeviceAt("2026-07-12T15:59:00.000Z", offset);
    expect(getBeijingDateString()).toBe("2026-07-12");
  });
});
