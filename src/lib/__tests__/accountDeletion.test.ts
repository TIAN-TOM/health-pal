import { describe, it, expect } from "vitest";

import {
  DELETION_SPECS,
  USER_STORAGE_BUCKETS,
  STORAGE_PAGE_SIZE,
  isMissingTableError,
  deleteUserRows,
  listAllObjectPaths,
  removeUserStorageObjects,
  type DeletionError,
  type StorageBucketApi,
  type StorageObjectEntry,
} from "../../../supabase/functions/_shared/account-deletion.ts";

// ---- mock 工具 ----

const makeDeletionClient = (
  errorFor: (table: string, column: string) => DeletionError | null,
) => {
  const calls: Array<{ table: string; column: string; value: string }> = [];
  const client = {
    from: (table: string) => ({
      delete: () => ({
        eq: (column: string, value: string) => {
          calls.push({ table, column, value });
          return Promise.resolve({ error: errorFor(table, column) });
        },
      }),
    }),
  };
  return { client, calls };
};

// pages: 目录路径 -> 依次返回的页（超出后返回空页）
const makeBucket = (pages: Record<string, StorageObjectEntry[][]>) => {
  const listCalls: Array<{ path: string; offset: number }> = [];
  const removed: string[][] = [];
  const servedCount: Record<string, number> = {};
  const bucket: StorageBucketApi = {
    list: (path, options) => {
      listCalls.push({ path, offset: options.offset });
      const pageIndex = servedCount[path] ?? 0;
      servedCount[path] = pageIndex + 1;
      const page = (pages[path] ?? [])[pageIndex] ?? [];
      return Promise.resolve({ data: page, error: null });
    },
    remove: (paths) => {
      removed.push(paths);
      return Promise.resolve({ error: null });
    },
  };
  return { bucket, listCalls, removed };
};

const file = (name: string): StorageObjectEntry => ({ name, id: `id-${name}` });
const folder = (name: string): StorageObjectEntry => ({ name, id: null });

// ---- 删除规格 ----

describe("DELETION_SPECS", () => {
  it("gomoku_rooms 按 host_id 与 guest_id 各删一遍（房间行不得在注销后残留）", () => {
    const gomoku = DELETION_SPECS.filter((s) => s.table === "gomoku_rooms").map((s) => s.column);
    expect(gomoku.sort()).toEqual(["guest_id", "host_id"]);
  });

  it("admin_notifications 用真实列 admin_id，而不是不存在的 user_id", () => {
    const specs = DELETION_SPECS.filter((s) => s.table === "admin_notifications");
    expect(specs).toEqual([{ table: "admin_notifications", column: "admin_id" }]);
  });

  it("profiles 按主键 id 删除", () => {
    expect(DELETION_SPECS).toContainEqual({ table: "profiles", column: "id" });
  });

  it("覆盖全部既有业务表（防止提取共享列表时漏表）", () => {
    const tables = new Set(DELETION_SPECS.map((s) => s.table));
    for (const table of [
      "meniere_records",
      "daily_checkins",
      "diabetes_records",
      "emergency_contacts",
      "emergency_sms_logs",
      "medical_records",
      "user_medications",
      "user_feedback",
      "user_item_inventory",
      "user_purchases",
      "user_points",
      "user_preferences",
      "user_roles",
      "voice_records",
      "weather_alerts",
      "points_transactions",
      "admin_notifications",
      "family_calendar_events",
      "family_expenses",
      "family_members",
      "family_messages",
      "family_reminders",
      "gomoku_rooms",
      "profiles",
    ]) {
      expect(tables).toContain(table);
    }
  });
});

// ---- 错误分类 ----

describe("isMissingTableError", () => {
  it("表不存在的各种形态可容忍（迁移未应用时不阻塞注销）", () => {
    expect(isMissingTableError({ code: "42P01", message: "boom" })).toBe(true);
    expect(isMissingTableError({ code: "PGRST205", message: "boom" })).toBe(true);
    expect(
      isMissingTableError({ message: 'relation "public.user_consents" does not exist' }),
    ).toBe(true);
    expect(
      isMissingTableError({
        message: "Could not find the table 'public.user_consents' in the schema cache",
      }),
    ).toBe(true);
  });

  it("列不存在必须上报：宽泛正则曾把 admin_notifications 的清理吞成静默 no-op", () => {
    expect(
      isMissingTableError({
        code: "42703",
        message: "column admin_notifications.user_id does not exist",
      }),
    ).toBe(false);
  });

  it("其他错误一律上报", () => {
    expect(isMissingTableError({ message: "permission denied" })).toBe(false);
  });
});

// ---- 逐条删除 ----

describe("deleteUserRows", () => {
  it("按规格逐条 delete().eq(column, userId)，全部成功时无失败项", async () => {
    const { client, calls } = makeDeletionClient(() => null);

    const failed = await deleteUserRows(client, "u1", DELETION_SPECS, "test");

    expect(failed).toEqual([]);
    expect(calls).toHaveLength(DELETION_SPECS.length);
    expect(calls).toContainEqual({ table: "gomoku_rooms", column: "host_id", value: "u1" });
    expect(calls).toContainEqual({ table: "gomoku_rooms", column: "guest_id", value: "u1" });
    expect(calls).toContainEqual({ table: "admin_notifications", column: "admin_id", value: "u1" });
    expect(calls).toContainEqual({ table: "profiles", column: "id", value: "u1" });
  });

  it("列不存在会进入失败列表（调用方据此中止 auth 删除），表不存在则跳过", async () => {
    const { client } = makeDeletionClient((table) => {
      if (table === "admin_notifications") {
        return { code: "42703", message: "column admin_notifications.user_id does not exist" };
      }
      if (table === "user_consents_like_missing") return { code: "42P01", message: "missing" };
      return null;
    });

    const failed = await deleteUserRows(
      client,
      "u1",
      [
        { table: "admin_notifications", column: "user_id" },
        { table: "user_consents_like_missing", column: "user_id" },
        { table: "profiles", column: "id" },
      ],
      "test",
    );

    expect(failed).toEqual([{ table: "admin_notifications", column: "user_id" }]);
  });
});

// ---- 存储清理 ----

describe("USER_STORAGE_BUCKETS", () => {
  it("包含公开的 family-avatars（注销后头像不得继续公网可访问）", () => {
    expect(USER_STORAGE_BUCKETS).toEqual(["voice-records", "checkin-photos", "family-avatars"]);
  });
});

describe("listAllObjectPaths", () => {
  it("翻页直到拿到空页，不因单页未满而提前停（服务端可能压低 limit）", async () => {
    const pageFull = Array.from({ length: STORAGE_PAGE_SIZE }, (_, i) => file(`a${i}.webm`));
    const { bucket, listCalls } = makeBucket({
      u1: [pageFull, [file("last.webm")], []],
    });

    const paths = await listAllObjectPaths(bucket, "u1");

    expect(paths).toHaveLength(STORAGE_PAGE_SIZE + 1);
    expect(paths).toContain("u1/last.webm");
    expect(listCalls.map((c) => c.offset)).toEqual([0, STORAGE_PAGE_SIZE, STORAGE_PAGE_SIZE + 1]);
  });

  it("递归收集子目录中的对象（旧实现只看顶层一层）", async () => {
    const { bucket } = makeBucket({
      u1: [[file("root.webm"), folder("2026")], []],
      "u1/2026": [[folder("07"), file("note.webm")], []],
      "u1/2026/07": [[file("deep.webm")], []],
    });

    const paths = await listAllObjectPaths(bucket, "u1");

    expect(paths.sort()).toEqual(["u1/2026/07/deep.webm", "u1/2026/note.webm", "u1/root.webm"]);
  });

  it("list 出错时抛出，由调用方按桶降级", async () => {
    const bucket: StorageBucketApi = {
      list: () => Promise.resolve({ data: null, error: { message: "boom" } }),
      remove: () => Promise.resolve({ error: null }),
    };
    await expect(listAllObjectPaths(bucket, "u1")).rejects.toThrow("boom");
  });
});

describe("removeUserStorageObjects", () => {
  it("默认清理全部三个桶，超过单批上限的路径分批 remove", async () => {
    const manyFiles = Array.from({ length: STORAGE_PAGE_SIZE }, (_, i) => file(`v${i}.webm`));
    const voice = makeBucket({ u1: [manyFiles, [file("extra.webm")], []] });
    const photos = makeBucket({ u1: [[file("p.jpg")], []] });
    const avatars = makeBucket({ u1: [[file("m1.png")], []] });
    const byName: Record<string, StorageBucketApi> = {
      "voice-records": voice.bucket,
      "checkin-photos": photos.bucket,
      "family-avatars": avatars.bucket,
    };
    const requested: string[] = [];
    const client = {
      storage: {
        from: (name: string) => {
          requested.push(name);
          return byName[name];
        },
      },
    };

    await removeUserStorageObjects(client, "u1", "test");

    expect(requested).toEqual(["voice-records", "checkin-photos", "family-avatars"]);
    // 1001 个对象拆成 1000 + 1 两批
    expect(voice.removed.map((batch) => batch.length)).toEqual([STORAGE_PAGE_SIZE, 1]);
    expect(photos.removed).toEqual([["u1/p.jpg"]]);
    expect(avatars.removed).toEqual([["u1/m1.png"]]);
  });

  it("单桶失败不影响其他桶（best-effort，与既有行为一致）", async () => {
    const broken: StorageBucketApi = {
      list: () => Promise.resolve({ data: null, error: { message: "boom" } }),
      remove: () => Promise.resolve({ error: null }),
    };
    const ok = makeBucket({ u1: [[file("m1.png")], []] });
    const client = {
      storage: {
        from: (name: string) => (name === "family-avatars" ? ok.bucket : broken),
      },
    };

    await removeUserStorageObjects(client, "u1", "test");

    expect(ok.removed).toEqual([["u1/m1.png"]]);
  });

  it("目录为空时不发起 remove 调用", async () => {
    const empty = makeBucket({});
    const client = { storage: { from: () => empty.bucket } };

    await removeUserStorageObjects(client, "u1", "test", ["voice-records"]);

    expect(empty.removed).toEqual([]);
  });
});
