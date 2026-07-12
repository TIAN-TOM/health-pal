import { describe, it, expect } from "vitest";

import {
  formatSeverity,
  formatDuration,
  formatStress,
  formatSleepQuality,
  formatSaltPreference,
  formatGender,
  formatDate,
  formatDateTime,
  formatMoodScore,
  getRecordTypeText,
} from "../FormatUtils";

// 这些映射文案会直接出现在给医生的导出文本里，用表驱动锁定每一项。

describe("formatSeverity", () => {
  it.each([
    ["mild", "轻微"],
    ["moderate", "中度"],
    ["severe", "严重"],
    ["very-severe", "非常严重"],
    // 未知值（含 UI 直接存中文的历史数据）原样返回
    ["重度", "重度"],
  ])("%s -> %s", (input, expected) => {
    expect(formatSeverity(input)).toBe(expected);
  });
});

describe("formatDuration", () => {
  it.each([
    ["few-minutes", "几分钟"],
    ["few-hours", "几小时"],
    ["half-day", "半天"],
    ["full-day", "一整天"],
    ["multiple-days", "多天"],
    ["不到5分钟", "不到5分钟"],
  ])("%s -> %s", (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });
});

describe("formatStress", () => {
  it.each([
    ["none", "无压力"],
    ["low", "轻微压力"],
    ["moderate", "中等压力"],
    ["high", "较大压力"],
    ["severe", "重度压力"],
  ])("%s -> %s", (input, expected) => {
    expect(formatStress(input)).toBe(expected);
  });
});

describe("formatSleepQuality", () => {
  it.each([
    ["excellent", "非常好"],
    ["good", "良好"],
    ["fair", "一般"],
    ["poor", "较差"],
    ["very-poor", "很差"],
  ])("%s -> %s", (input, expected) => {
    expect(formatSleepQuality(input)).toBe(expected);
  });
});

describe("formatSaltPreference", () => {
  it.each([
    ["light", "清淡"],
    ["normal", "适中"],
    ["salty", "偏咸"],
    ["very-salty", "很咸"],
  ])("%s -> %s", (input, expected) => {
    expect(formatSaltPreference(input)).toBe(expected);
  });
});

describe("formatGender", () => {
  it.each([
    ["male", "男"],
    ["female", "女"],
    ["other", "其他"],
    ["unknown", "unknown"],
  ])("%s -> %s", (input, expected) => {
    expect(formatGender(input)).toBe(expected);
  });
});

describe("formatMoodScore", () => {
  // 边界：>=5 非常好, >=4 良好, >=3 一般, >=2 较差, 其余 很差
  it.each([
    [5, "5/5 (非常好)"],
    [4, "4/5 (良好)"],
    [3, "3/5 (一般)"],
    [2, "2/5 (较差)"],
    [1, "1/5 (很差)"],
    [0, "0/5 (很差)"],
  ])("%d -> %s", (score, expected) => {
    expect(formatMoodScore(score)).toBe(expected);
  });
});

describe("formatDate / formatDateTime", () => {
  it("按 Asia/Shanghai 时区格式化日期", () => {
    expect(formatDate("2026-07-05")).toBe("2026/07/05");
  });

  it("UTC 时间转换为北京时间", () => {
    expect(formatDateTime("2026-07-05T06:30:00Z")).toBe("2026/07/05 14:30");
  });

  it("UTC 晚间时间跨日转换到北京时间次日", () => {
    expect(formatDateTime("2026-07-04T20:00:00Z")).toBe("2026/07/05 04:00");
  });

  it("带 +08:00 偏移的时间保持同一天", () => {
    expect(formatDateTime("2026-07-05T18:05:00+08:00")).toBe(
      "2026/07/05 18:05",
    );
  });
});

describe("getRecordTypeText", () => {
  it.each([
    ["dizziness", "眩晕症状"],
    ["lifestyle", "饮食作息"],
    ["medication", "用药记录"],
    ["voice", "语音记录"],
    ["checkin", "每日打卡"],
    ["medical", "医疗记录"],
    ["custom", "custom"],
  ])("%s -> %s", (input, expected) => {
    expect(getRecordTypeText(input)).toBe(expected);
  });
});
