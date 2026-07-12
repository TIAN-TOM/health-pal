import { describe, it, expect } from "vitest";
import type { z } from "zod";

import {
  contactSchema,
  familyMemberSchema,
  medicalRecordSchema,
  validateTextField,
  validatePhone,
  validateDate,
  validateUUID,
} from "../validation";

const messagesOf = (result: z.SafeParseReturnType<unknown, unknown>) =>
  result.success ? [] : result.error.issues.map((i) => i.message);

describe("contactSchema", () => {
  const validContact = { name: "张三", phone: "13800138000" };

  it.each<[string, Record<string, unknown>, boolean]>([
    ["基础有效联系人", validContact, true],
    ["带头像的联系人", { ...validContact, avatar: "👵" }, true],
    ["带国际区号和空格括号的电话", { name: "张三", phone: "+61 (2) 9876 5432" }, true],
    ["姓名恰好100字符", { ...validContact, name: "张".repeat(100) }, true],
    ["电话恰好20字符", { ...validContact, phone: "1".repeat(20) }, true],
    ["姓名101字符超限", { ...validContact, name: "张".repeat(101) }, false],
    ["电话21字符超限", { ...validContact, phone: "1".repeat(21) }, false],
    ["姓名为空", { ...validContact, name: "" }, false],
    ["姓名仅空白字符", { ...validContact, name: "   " }, false],
    ["电话为空", { ...validContact, phone: "" }, false],
    ["电话含字母", { ...validContact, phone: "138abc" }, false],
    ["电话为中文", { ...validContact, phone: "一三八" }, false],
    ["缺少电话字段", { name: "张三" }, false],
    ["缺少姓名字段", { phone: "13800138000" }, false],
    ["头像11字符超限", { ...validContact, avatar: "a".repeat(11) }, false],
  ])("%s -> %s", (_desc, input, expected) => {
    expect(contactSchema.safeParse(input).success).toBe(expected);
  });

  it("解析时去除姓名和电话的首尾空白", () => {
    const result = contactSchema.safeParse({
      name: " 张三 ",
      phone: " 13800138000 ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("张三");
      expect(result.data.phone).toBe("13800138000");
    }
  });

  it("电话格式错误时返回中文错误信息", () => {
    const result = contactSchema.safeParse({ name: "张三", phone: "abc" });
    expect(messagesOf(result)).toContain("电话号码格式不正确");
  });
});

describe("familyMemberSchema", () => {
  const validMember = { name: "妈妈", relationship: "母亲" };

  it.each<[string, Record<string, unknown>, boolean]>([
    ["仅必填字段", validMember, true],
    [
      "全部字段有效",
      {
        ...validMember,
        phone: "13800138000",
        birthday: "19580101",
        address: "北京市朝阳区",
        notes: "每周探望",
        avatar_url: "https://example.com/avatar.png",
      },
      true,
    ],
    // phone 用的是 * 量词，允许空字符串
    ["电话为空字符串", { ...validMember, phone: "" }, true],
    ["头像URL为空字符串", { ...validMember, avatar_url: "" }, true],
    ["关系恰好50字符", { ...validMember, relationship: "亲".repeat(50) }, true],
    ["生日为8位数字", { ...validMember, birthday: "19580101" }, true],
    ["缺少关系字段", { name: "妈妈" }, false],
    ["关系为空", { ...validMember, relationship: "" }, false],
    ["关系51字符超限", { ...validMember, relationship: "亲".repeat(51) }, false],
    ["生日带连字符", { ...validMember, birthday: "1958-01-01" }, false],
    ["生日仅6位", { ...validMember, birthday: "195801" }, false],
    ["电话含字母", { ...validMember, phone: "138abc" }, false],
    ["头像URL格式错误", { ...validMember, avatar_url: "not-a-url" }, false],
    ["备注1001字符超限", { ...validMember, notes: "备".repeat(1001) }, false],
    ["地址201字符超限", { ...validMember, address: "址".repeat(201) }, false],
  ])("%s -> %s", (_desc, input, expected) => {
    expect(familyMemberSchema.safeParse(input).success).toBe(expected);
  });

  it("生日格式错误时返回中文错误信息", () => {
    const result = familyMemberSchema.safeParse({
      ...validMember,
      birthday: "1958-01-01",
    });
    expect(messagesOf(result)).toContain("生日格式应为YYYYMMDD");
  });
});

describe("medicalRecordSchema", () => {
  const validRecord = { record_type: "visit", date: "2026-07-01" };

  it.each<[string, Record<string, unknown>, boolean]>([
    ["仅必填字段 visit", validRecord, true],
    ["记录类型 diagnosis", { ...validRecord, record_type: "diagnosis" }, true],
    ["记录类型 prescription", { ...validRecord, record_type: "prescription" }, true],
    [
      "全部字段有效",
      {
        ...validRecord,
        hospital: "北京协和医院",
        doctor: "王医生",
        department: "耳鼻喉科",
        diagnosis: "梅尼埃病",
        symptoms: "眩晕伴耳鸣",
        prescribed_medications: ["倍他司汀", "银杏叶片"],
        notes: "两周后复诊",
        next_appointment: "2026-08-01",
      },
      true,
    ],
    ["处方药物恰好50项", { ...validRecord, prescribed_medications: Array(50).fill("阿司匹林") }, true],
    ["未知记录类型", { ...validRecord, record_type: "surgery" }, false],
    ["缺少日期", { record_type: "visit" }, false],
    ["日期用斜杠分隔", { ...validRecord, date: "2026/07/01" }, false],
    ["日期无分隔符", { ...validRecord, date: "20260701" }, false],
    ["下次预约日期格式错误", { ...validRecord, next_appointment: "01-08-2026" }, false],
    ["处方药物51项超限", { ...validRecord, prescribed_medications: Array(51).fill("阿司匹林") }, false],
    ["单个药品名101字符超限", { ...validRecord, prescribed_medications: ["药".repeat(101)] }, false],
    ["诊断501字符超限", { ...validRecord, diagnosis: "诊".repeat(501) }, false],
  ])("%s -> %s", (_desc, input, expected) => {
    expect(medicalRecordSchema.safeParse(input).success).toBe(expected);
  });

  it("记录类型非法时返回中文错误信息", () => {
    const result = medicalRecordSchema.safeParse({
      ...validRecord,
      record_type: "surgery",
    });
    expect(messagesOf(result)).toContain("记录类型必须是就诊、诊断或处方之一");
  });
});

describe("validatePhone", () => {
  it.each<[string, boolean]>([
    ["13800138000", true],
    ["+86 138 0013 8000", true],
    ["(02) 9876 5432", true],
    ["0".repeat(20), true],
    ["0".repeat(21), false],
    ["", false],
    ["138abc", false],
    ["138_0013", false],
    // 全角数字不符合半角数字格式
    ["１３８００１３８０００", false],
  ])("%j -> %s", (input, expected) => {
    expect(validatePhone(input)).toBe(expected);
  });
});

describe("validateUUID", () => {
  it.each<[string, boolean]>([
    // v1
    ["123e4567-e89b-12d3-a456-426614174000", true],
    // v4
    ["9b2495d0-3c60-4f7a-9df3-2a2f5b0c2f1d", true],
    // 大小写不敏感
    ["123E4567-E89B-12D3-A456-426614174000", true],
    ["", false],
    ["not-a-uuid", false],
    // 缺少连字符
    ["123e4567e89b12d3a456426614174000", false],
    // 版本号必须是 1-5
    ["123e4567-e89b-62d3-a456-426614174000", false],
    ["123e4567-e89b-02d3-a456-426614174000", false],
    // 变体位必须是 8/9/a/b
    ["123e4567-e89b-12d3-c456-426614174000", false],
    // 全零 UUID 版本位为 0，不通过
    ["00000000-0000-0000-0000-000000000000", false],
    // 末段少一位
    ["123e4567-e89b-12d3-a456-42661417400", false],
    // 带前导空格
    [" 123e4567-e89b-12d3-a456-426614174000", false],
  ])("%j -> %s", (input, expected) => {
    expect(validateUUID(input)).toBe(expected);
  });
});

describe("validateDate", () => {
  it.each<[string, boolean]>([
    ["2026-07-05", true],
    ["2026-7-5", false],
    ["20260705", false],
    ["05-07-2026", false],
    ["", false],
    // 仅校验形状，不校验月份/日期取值范围
    ["2026-13-45", true],
  ])("%j -> %s", (input, expected) => {
    expect(validateDate(input)).toBe(expected);
  });
});

describe("validateTextField", () => {
  it.each<[string, string, number | undefined, boolean]>([
    ["普通文本", "今天状态不错", undefined, true],
    ["空字符串", "", undefined, false],
    ["仅空白字符", "   ", undefined, false],
    ["恰好默认上限500字符", "字".repeat(500), undefined, true],
    ["超出默认上限", "字".repeat(501), undefined, false],
    ["自定义上限内", "字".repeat(10), 10, true],
    ["超出自定义上限", "字".repeat(11), 10, false],
  ])("%s -> %s", (_desc, value, maxLength, expected) => {
    expect(validateTextField(value, maxLength)).toBe(expected);
  });
});
