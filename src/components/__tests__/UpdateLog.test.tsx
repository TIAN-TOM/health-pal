import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UpdateLog from "../UpdateLog";
import { updates, getTypeColor, getTypeText } from "@/data/updateLog";

describe("UpdateLog data", () => {
  it("contains a non-empty list of versions", () => {
    expect(updates.length).toBeGreaterThan(30);
  });

  it("latest version is 2.9.15 (UI polish)", () => {
    expect(updates[0].version).toBe("2.9.15");
    expect(updates[0].type).toBe("界面优化");
  });

  it("every entry has required fields", () => {
    for (const u of updates) {
      expect(typeof u.version).toBe("string");
      expect(typeof u.type).toBe("string");
      expect(u.icon).toBeTruthy();
      expect(typeof u.color).toBe("string");
      expect(Array.isArray(u.items)).toBe(true);
      expect(u.items.length).toBeGreaterThan(0);
      for (const item of u.items) {
        expect(typeof item.title).toBe("string");
        expect(typeof item.description).toBe("string");
        expect(typeof item.type).toBe("string");
      }
    }
  });

  it("versions are unique", () => {
    const versions = updates.map((u) => u.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it("getTypeColor / getTypeText cover known types", () => {
    expect(getTypeText("feature")).toBe("新功能");
    expect(getTypeText("improvement")).toBe("优化");
    expect(getTypeText("fix")).toBe("修复");
    expect(getTypeText("anything-else")).toBe("更新");
    expect(getTypeColor("feature")).toContain("green");
    expect(getTypeColor("improvement")).toContain("blue");
    expect(getTypeColor("fix")).toContain("red");
    expect(getTypeColor("unknown")).toContain("gray");
  });
});

describe("UpdateLog component", () => {
  it("renders header and back button", () => {
    render(<UpdateLog onBack={() => {}} />);
    expect(screen.getByText("📝 更新日志")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /返回/ })).toBeInTheDocument();
  });

  it("renders all version cards", () => {
    render(<UpdateLog onBack={() => {}} />);
    for (const u of updates) {
      expect(screen.getByText(`版本 ${u.version}`)).toBeInTheDocument();
    }
  });

  it("renders the latest version's item titles", () => {
    render(<UpdateLog onBack={() => {}} />);
    for (const item of updates[0].items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });
});
