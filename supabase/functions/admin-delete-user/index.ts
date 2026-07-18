// 管理员删除用户：调用方需带 Authorization Bearer JWT，且必须具有 admin 角色。
// 复用 delete-account 的级联删除逻辑，但目标用户由 body.userId 指定。
// 防御性：先删全部业务数据，全部成功后才删除 auth 账号（不可逆）；禁止删除自己或其他管理员。

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  DELETION_SPECS,
  deleteUserRows,
  removeUserStorageObjects,
} from "../_shared/account-deletion.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AdminDeletePayload {
  userId?: string;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) 用调用者 JWT 校验身份
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerErr } = await userClient.auth.getUser();
    if (callerErr || !caller) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    // 2) 校验调用者具有 admin 角色
    const { data: callerRole, error: roleErr } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) return json({ error: "Failed to verify permissions" }, 500);
    if (!callerRole) return json({ error: "Forbidden: admin role required" }, 403);

    // 3) 校验目标用户
    const body = (await req.json().catch(() => ({}))) as AdminDeletePayload;
    const targetId = body.userId;
    if (!targetId) return json({ error: "userId is required" }, 400);
    if (targetId === caller.id) return json({ error: "不能删除自己的账号" }, 400);

    // 禁止删除其他管理员
    const { data: targetRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", targetId)
      .eq("role", "admin")
      .maybeSingle();
    if (targetRole) return json({ error: "不能删除其他管理员账号" }, 403);

    // 4) 写审计（先写，确保丢失数据前留下痕迹）
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", targetId)
      .maybeSingle();

    await admin.from("account_deletions").insert({
      user_id: targetId,
      user_email: targetProfile?.email ?? "",
      deletion_reason: "已被管理员删除",
      deleted_by: caller.id,
    });

    // 5) 逐条执行删除规格（service role 绕过 RLS，但仍按目标用户限定；
    //    规格覆盖 gomoku_rooms 的 host/guest、admin_notifications 的 admin_id、profiles 的 id）
    let failed = await deleteUserRows(admin, targetId, DELETION_SPECS, "admin-delete-user");

    // 关键：auth 账号删除不可逆，必须在全部业务数据删除成功后才执行。失败重试一次，仍失败则中止。
    if (failed.length > 0) failed = await deleteUserRows(admin, targetId, failed, "admin-delete-user");
    if (failed.length > 0) {
      const failedTables = [...new Set(failed.map((spec) => spec.table))];
      console.error("[admin-delete-user] aborting auth deletion, tables still failed:", failedTables);
      return json(
        { success: false, error: "部分数据删除失败，账号未注销，请稍后重试", failed_tables: failedTables },
        500,
      );
    }

    // 6) 清空存储桶中该目标用户的目录（best-effort；分页 + 递归子目录，含公开的 family-avatars）
    await removeUserStorageObjects(admin, targetId, "admin-delete-user");

    // 7) 删除 auth 账号（仅在全部业务数据删除成功后执行）
    const { error: authErr } = await admin.auth.admin.deleteUser(targetId);
    if (authErr) {
      console.error("[admin-delete-user] auth delete failed:", authErr.message);
      return json({ success: false, error: "Failed to delete auth account", partial: true }, 500);
    }

    return json({ success: true }, 200);
  } catch (e) {
    console.error("[admin-delete-user] unexpected error:", e);
    return json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
