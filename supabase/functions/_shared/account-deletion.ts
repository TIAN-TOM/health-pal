// delete-account 与 admin-delete-user 共享的级联删除规格与存储清理逻辑。
// 刻意不 import supabase-js：调用方注入客户端（结构化接口），
// 使该模块既能被 Deno edge function 相对导入，也能被仓库的 vitest/tsc 直接检查。

export interface DeletionError {
  code?: string;
  message: string;
}

export interface DeletionSpec {
  table: string;
  column: string;
}

// 用户在各业务表中的行，按 (table, column) 逐条删除。
// 非 user_id 键必须显式标注：admin_notifications 的列是 admin_id（按 user_id 删曾是静默 no-op）；
// gomoku_rooms 按 host/guest 各删一遍；profiles 主键是 id。
export const DELETION_SPECS: DeletionSpec[] = [
  { table: "meniere_records", column: "user_id" },
  { table: "daily_checkins", column: "user_id" },
  { table: "diabetes_records", column: "user_id" },
  { table: "emergency_contacts", column: "user_id" },
  { table: "emergency_sms_logs", column: "user_id" },
  { table: "medical_records", column: "user_id" },
  { table: "user_medications", column: "user_id" },
  { table: "user_feedback", column: "user_id" },
  { table: "user_item_inventory", column: "user_id" },
  { table: "user_purchases", column: "user_id" },
  { table: "user_points", column: "user_id" },
  { table: "user_preferences", column: "user_id" },
  { table: "user_roles", column: "user_id" },
  { table: "voice_records", column: "user_id" },
  { table: "weather_alerts", column: "user_id" },
  { table: "points_transactions", column: "user_id" },
  { table: "admin_notifications", column: "admin_id" },
  { table: "family_calendar_events", column: "user_id" },
  { table: "family_expenses", column: "user_id" },
  { table: "family_members", column: "user_id" },
  { table: "family_messages", column: "user_id" },
  { table: "family_reminders", column: "user_id" },
  { table: "gomoku_rooms", column: "host_id" },
  { table: "gomoku_rooms", column: "guest_id" },
  { table: "profiles", column: "id" },
];

// 用户对象所在的存储桶；对象路径均以 user id 作为顶层目录。
// family-avatars 是公开桶，遗留头像可被任意人访问，注销时必须一并清空。
export const USER_STORAGE_BUCKETS = ["voice-records", "checkin-photos", "family-avatars"];

// 只容忍"表整体不存在"（迁移未应用）。列不存在等其余错误必须上报：
// 宽泛的 /does not exist/ 曾把 "column admin_notifications.user_id does not exist"
// 一并吞掉，导致该表清理静默失效。
export const isMissingTableError = (error: DeletionError): boolean =>
  error.code === "42P01" ||
  error.code === "PGRST205" ||
  /relation .* does not exist/i.test(error.message ?? "") ||
  /could not find the table/i.test(error.message ?? "");

interface DeleteFilterBuilder {
  eq(column: string, value: string): PromiseLike<{ error: DeletionError | null }>;
}

export interface DeletionClient {
  from(table: string): { delete(): DeleteFilterBuilder };
}

// 逐条执行删除规格，返回仍然失败的规格（调用方可重试后决定是否中止 auth 删除）。
export async function deleteUserRows(
  client: DeletionClient,
  userId: string,
  specs: DeletionSpec[],
  logPrefix: string,
): Promise<DeletionSpec[]> {
  const stillFailed: DeletionSpec[] = [];
  for (const spec of specs) {
    const { error } = await client.from(spec.table).delete().eq(spec.column, userId);
    if (error && !isMissingTableError(error)) {
      console.error(`[${logPrefix}] table=${spec.table} column=${spec.column} err=${error.message}`);
      stillFailed.push(spec);
    }
  }
  return stillFailed;
}

export interface StorageObjectEntry {
  name: string;
  // Supabase list() 用 id=null 的条目表示子目录
  id: string | null;
}

export interface StorageBucketApi {
  list(
    path: string,
    options: { limit: number; offset: number },
  ): Promise<{ data: StorageObjectEntry[] | null; error: { message: string } | null }>;
  remove(paths: string[]): Promise<{ error: { message: string } | null }>;
}

export interface StorageClient {
  storage: { from(bucket: string): StorageBucketApi };
}

export const STORAGE_PAGE_SIZE = 1000;

// 递归 + 分页列出 prefix 目录下的全部对象路径。
// 终止条件是"拿到空页"而非"本页未满"：服务端可能把 limit 压到比请求值小，
// 按未满页提前退出会漏对象（旧实现只取第一页最多 1000 条，且不进子目录）。
export async function listAllObjectPaths(
  bucket: StorageBucketApi,
  prefix: string,
): Promise<string[]> {
  const paths: string[] = [];
  const pendingFolders: string[] = [prefix];
  while (pendingFolders.length > 0) {
    const folder = pendingFolders.pop()!;
    let offset = 0;
    for (;;) {
      const { data, error } = await bucket.list(folder, { limit: STORAGE_PAGE_SIZE, offset });
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;
      for (const entry of data) {
        if (entry.id === null) pendingFolders.push(`${folder}/${entry.name}`);
        else paths.push(`${folder}/${entry.name}`);
      }
      offset += data.length;
    }
  }
  return paths;
}

// 清空各桶中该用户的目录。best-effort：单桶失败只告警，不阻塞 auth 删除（与既有行为一致）。
export async function removeUserStorageObjects(
  client: StorageClient,
  userId: string,
  logPrefix: string,
  buckets: string[] = USER_STORAGE_BUCKETS,
): Promise<void> {
  for (const bucketName of buckets) {
    try {
      const bucket = client.storage.from(bucketName);
      const paths = await listAllObjectPaths(bucket, userId);
      for (let i = 0; i < paths.length; i += STORAGE_PAGE_SIZE) {
        const { error } = await bucket.remove(paths.slice(i, i + STORAGE_PAGE_SIZE));
        if (error) {
          console.warn(`[${logPrefix}] storage bucket=${bucketName} remove err=${error.message}`);
        }
      }
    } catch (e) {
      console.warn(`[${logPrefix}] storage bucket=${bucketName} err=`, e);
    }
  }
}
