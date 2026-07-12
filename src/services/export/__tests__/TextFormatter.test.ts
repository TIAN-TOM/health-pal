import { describe, it, expect } from "vitest";

import { generateTextFormat } from "../TextFormatter";
import type { ExportData } from "../EnhancedDataFetcher";

// 导出文本是直接交给医生看的，此处用显式期望字符串锁定关键措辞，
// 防止映射文案 / 小节标题 / 日期格式被无意改动。
// 时间均使用 Asia/Shanghai 时区（zh-CN locale，Node 输出形如 2026/07/05 14:30）。

const emptyData = (): ExportData => ({
  meniereRecords: [],
  dailyCheckins: [],
  diabetesRecords: [],
  emergencyContacts: [],
  medicalRecords: [],
  userMedications: [],
});

const buildFixture = (): ExportData => ({
  ...emptyData(),
  meniereRecords: [
    {
      // 个人信息记录：由 PersonalInfoHandler 提取
      type: "checkin",
      timestamp: "2026-07-01T00:00:00Z",
      data: {
        record_type: "user_profile",
        age: 68,
        gender: "female",
        height: 160,
        weight: 55,
        medical_history: ["高血压"],
        allergies: ["青霉素"],
      },
    },
    {
      type: "dizziness",
      // 北京时间 2026/07/05 14:30
      timestamp: "2026-07-05T06:30:00Z",
      duration: "不到5分钟",
      severity: "重度",
      symptoms: ["旋转性眩晕", "耳鸣"],
      note: "起床时发作",
    },
    {
      type: "lifestyle",
      // UTC 前一天 20:00 → 北京时间 2026/07/05 04:00（跨日转换）
      timestamp: "2026-07-04T20:00:00Z",
      diet: ["清淡饮食", "低盐"],
      sleep: "良好",
      stress: "中等压力",
      note: "晚饭后散步",
    },
    {
      type: "medication",
      timestamp: "2026-07-05T06:30:00Z",
      medications: ["倍他司汀", "地芬尼多"],
      dosage: "每次一片",
      note: "按时服药",
    },
  ],
  dailyCheckins: [
    { checkin_date: "2026-07-06", mood_score: 5, note: "今天感觉不错" },
    { checkin_date: "2026-07-07", mood_score: 1 },
  ],
  diabetesRecords: [
    {
      timestamp: "2026-07-05T06:30:00Z",
      blood_sugar: 6.2,
      measurement_time: "fasting",
      insulin_dose: "10单位",
      medication: "二甲双胍",
      diet: "早餐清淡",
      exercise: "散步30分钟",
      note: "状态平稳",
    },
    {
      timestamp: "2026-07-05T10:00:00Z",
      blood_sugar: 7.8,
      measurement_time: "after_meal",
    },
  ],
  medicalRecords: [
    {
      date: "2026-07-01",
      record_type: "visit",
      hospital: "北京协和医院",
      doctor: "王医生",
      department: "耳鼻喉科",
      diagnosis: "梅尼埃病",
      symptoms: "眩晕伴耳鸣",
      prescribed_medications: ["倍他司汀", "银杏叶片"],
      notes: "两周后复诊",
      next_appointment: "2026-08-01",
    },
  ],
  emergencyContacts: [{ name: "张紧急", phone: "13800138000" }],
  medications: [
    {
      name: "倍他司汀片",
      dosage: "6mg",
      frequency: "每日三次",
      duration: "一个月",
      instructions: "饭后服用",
      side_effects: "偶有胃部不适",
    },
  ],
  userProfile: {
    full_name: "李奶奶",
    age: 68,
    gender: "female",
    height: 160,
    weight: 55,
    medical_history: ["高血压", "糖尿病"],
    allergies: ["青霉素"],
  },
});

describe("generateTextFormat", () => {
  const output = generateTextFormat(buildFixture());

  it("没有任何数据时返回空字符串", () => {
    expect(generateTextFormat(emptyData())).toBe("");
  });

  it("从梅尼埃记录中提取患者基本信息（性别映射为 女）", () => {
    expect(output).toContain(
      "【患者基本信息】\n" +
        "年龄: 68岁\n" +
        "性别: 女\n" +
        "身高: 160cm\n" +
        "体重: 55kg\n" +
        "既往病史: 高血压\n" +
        "过敏史: 青霉素",
    );
  });

  it("渲染个人基本资料小节（性别映射为 女性）", () => {
    expect(output).toContain(
      "【个人基本资料】\n" +
        "姓名: 李奶奶\n" +
        "年龄: 68岁\n" +
        "性别: 女性\n" +
        "身高: 160cm\n" +
        "体重: 55kg\n" +
        "既往病史: 高血压, 糖尿病\n" +
        "过敏史: 青霉素",
    );
  });

  it("渲染常用药物管理小节", () => {
    expect(output).toContain(
      "=== 常用药物管理 ===\n" +
        "1. 倍他司汀片\n" +
        "   剂量: 6mg\n" +
        "   频率: 每日三次\n" +
        "   疗程: 一个月\n" +
        "   用法: 饭后服用\n" +
        "   副作用: 偶有胃部不适",
    );
  });

  it("渲染血糖记录并把测量时间映射为中文", () => {
    expect(output).toContain(
      "=== 血糖管理记录 ===\n" +
        "1. 2026/07/05 14:30\n" +
        "   血糖值: 6.2 mmol/L (空腹)\n" +
        "   胰岛素剂量: 10单位\n" +
        "   药物: 二甲双胍\n" +
        "   饮食: 早餐清淡\n" +
        "   运动: 散步30分钟\n" +
        "   备注: 状态平稳",
    );
    expect(output).toContain("   血糖值: 7.8 mmol/L (餐后)");
  });

  it("未知的测量时间原样输出", () => {
    const data = {
      ...emptyData(),
      diabetesRecords: [
        {
          timestamp: "2026-07-05T06:30:00Z",
          blood_sugar: 5.5,
          measurement_time: "midnight_snack",
        },
      ],
    };
    expect(generateTextFormat(data)).toContain(
      "   血糖值: 5.5 mmol/L (midnight_snack)",
    );
  });

  it("渲染眩晕症状记录（日期时间为北京时间）", () => {
    expect(output).toContain(
      "=== 眩晕症状记录 ===\n" +
        "1. 2026/07/05 14:30\n" +
        "   持续时间: 不到5分钟\n" +
        "   严重程度: 重度\n" +
        "   症状: 旋转性眩晕, 耳鸣\n" +
        "   备注: 起床时发作",
    );
  });

  it("渲染饮食与作息记录（UTC 时间跨日转换到北京时间）", () => {
    expect(output).toContain(
      "=== 饮食与作息记录 ===\n" +
        "1. 2026/07/05 04:00\n" +
        "   饮食: 清淡饮食, 低盐\n" +
        "   睡眠: 良好\n" +
        "   压力水平: 中等压力\n" +
        "   备注: 晚饭后散步",
    );
  });

  it("渲染用药记录小节", () => {
    expect(output).toContain(
      "=== 用药记录 ===\n" +
        "1. 2026/07/05 14:30\n" +
        "   药物: 倍他司汀, 地芬尼多\n" +
        "   剂量: 每次一片\n" +
        "   备注: 按时服药",
    );
  });

  it("渲染每日打卡记录并映射心情评分", () => {
    expect(output).toContain(
      "=== 每日打卡记录 ===\n" +
        "1. 2026/07/06\n" +
        "   心情评分: 5/5 (非常好)\n" +
        "   感想: 今天感觉不错\n" +
        "\n" +
        "2. 2026/07/07\n" +
        "   心情评分: 1/5 (很差)",
    );
  });

  it("渲染医疗记录并把记录类型映射为中文", () => {
    expect(output).toContain(
      "=== 医疗记录 ===\n" +
        "1. 2026/07/01 - 就诊\n" +
        "   医院: 北京协和医院\n" +
        "   医生: 王医生\n" +
        "   科室: 耳鼻喉科\n" +
        "   诊断: 梅尼埃病\n" +
        "   症状: 眩晕伴耳鸣\n" +
        "   处方药物: 倍他司汀, 银杏叶片\n" +
        "   备注: 两周后复诊\n" +
        "   下次预约: 2026/08/01",
    );
  });

  it("未知的医疗记录类型原样输出", () => {
    const data = {
      ...emptyData(),
      medicalRecords: [{ date: "2026-07-02", record_type: "surgery" }],
    };
    expect(generateTextFormat(data)).toContain("1. 2026/07/02 - surgery");
  });

  it("各小节按固定顺序输出", () => {
    const headers = [
      "【患者基本信息】",
      "【个人基本资料】",
      "=== 常用药物管理 ===",
      "=== 血糖管理记录 ===",
      "=== 眩晕症状记录 ===",
      "=== 饮食与作息记录 ===",
      "=== 用药记录 ===",
      "=== 每日打卡记录 ===",
      "=== 医疗记录 ===",
    ];
    const positions = headers.map((h) => output.indexOf(h));
    positions.forEach((pos, i) => {
      expect(pos, `缺少小节: ${headers[i]}`).toBeGreaterThanOrEqual(0);
      if (i > 0) {
        expect(pos, `小节顺序错误: ${headers[i]}`).toBeGreaterThan(
          positions[i - 1],
        );
      }
    });
  });

  it("没有对应记录时不输出该小节标题", () => {
    const data = {
      ...emptyData(),
      dailyCheckins: [{ checkin_date: "2026-07-06", mood_score: 3 }],
    };
    const result = generateTextFormat(data);
    expect(result).toContain("=== 每日打卡记录 ===");
    expect(result).toContain("   心情评分: 3/5 (一般)");
    expect(result).not.toContain("=== 血糖管理记录 ===");
    expect(result).not.toContain("=== 眩晕症状记录 ===");
    expect(result).not.toContain("=== 医疗记录 ===");
  });

  it("不泄露紧急联系人隐私信息", () => {
    expect(output).not.toContain("13800138000");
    expect(output).not.toContain("张紧急");
    expect(output).not.toContain("紧急联系人");
  });
});
