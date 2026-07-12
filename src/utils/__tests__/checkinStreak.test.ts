import { describe, it, expect } from "vitest";

import { calculateStreak } from "../checkinStreak";

const recordsOf = (...dates: string[]) =>
  dates.map((checkin_date) => ({ checkin_date }));

describe("calculateStreak", () => {
  it.each([
    {
      name: "no records -> 0",
      records: recordsOf(),
      todayStr: "2026-07-13",
      expected: 0,
    },
    {
      name: "only today checked -> 1",
      records: recordsOf("2026-07-13"),
      todayStr: "2026-07-13",
      expected: 1,
    },
    {
      name: "today plus two previous consecutive days -> 3",
      records: recordsOf("2026-07-13", "2026-07-12", "2026-07-11"),
      todayStr: "2026-07-13",
      expected: 3,
    },
    {
      name: "gap breaks the streak",
      records: recordsOf("2026-07-13", "2026-07-12", "2026-07-10", "2026-07-09"),
      todayStr: "2026-07-13",
      expected: 2,
    },
    {
      name: "today not checked, streak counted from yesterday",
      records: recordsOf("2026-07-12", "2026-07-11"),
      todayStr: "2026-07-13",
      expected: 2,
    },
    {
      name: "today and yesterday both missing -> 0 even with older records",
      records: recordsOf("2026-07-11", "2026-07-10"),
      todayStr: "2026-07-13",
      expected: 0,
    },
    {
      name: "unsorted records still counted correctly",
      records: recordsOf("2026-07-11", "2026-07-13", "2026-07-12"),
      todayStr: "2026-07-13",
      expected: 3,
    },
    {
      name: "duplicate dates counted once",
      records: recordsOf("2026-07-13", "2026-07-13", "2026-07-12"),
      todayStr: "2026-07-13",
      expected: 2,
    },
    {
      name: "streak across a month boundary",
      records: recordsOf("2026-03-01", "2026-02-28", "2026-02-27"),
      todayStr: "2026-03-01",
      expected: 3,
    },
    {
      name: "streak across a year boundary",
      records: recordsOf("2026-01-01", "2025-12-31", "2025-12-30"),
      todayStr: "2026-01-01",
      expected: 3,
    },
    {
      name: "streak across a leap day",
      records: recordsOf("2024-03-01", "2024-02-29", "2024-02-28"),
      todayStr: "2024-03-01",
      expected: 3,
    },
    {
      name: "only a future-dated record relative to today -> 0",
      records: recordsOf("2026-07-14"),
      todayStr: "2026-07-13",
      expected: 0,
    },
  ])("$name", ({ records, todayStr, expected }) => {
    expect(calculateStreak(records, todayStr)).toBe(expected);
  });
});
