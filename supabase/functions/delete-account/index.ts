// 安全注销账号：调用方需带 Authorization Bearer JWT。
// 函数用 service role 客户端删除当前用户的所有业务数据 + 写入 account_deletions 审计 + 删除 auth.users。
// 防御性：所有写入均按 user_id = 调用者 限制；任何错误立即返回，避免半删。

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DeletePayload {
  reason?: string;
  confirm?: string;
}

const TABLES_BY_USER_ID = [
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
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) 用调用者 JWT 校验身份
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as DeletePayload;
    if (body.confirm !== "DELETE_MY_ACCOUNT") {
      return new Response(JSON.stringify({ error: "Confirmation token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) service role 客户端做实际删除
    const admin = createClient(supabaseUrl, serviceKey);

    // 2a) 写审计（先写，确保丢失数据前留下痕迹）
    await admin.from("account_deletions").insert({
      user_id: user.id,
      user_email: user.email ?? "",
      deletion_reason: body.reason?.slice(0, 500) ?? null,
      deleted_by: user.id,
    });

    // 2b) 逐表删除（service role 绕过 RLS，但仍按 user_id 限定）
    const deleteBusinessTables = async (tables: string[]): Promise<string[]> => {
      const stillFailed: string[] = [];
      for (const table of tables) {
        const { error } = await admin.from(table).delete().eq("user_id", user.id);
        if (error && !/(does not exist|relation .* does not exist)/i.test(error.message)) {
          console.error(`[delete-account] table=${table} err=${error.message}`);
          stillFailed.push(table);
        }
      }
      return stillFailed;
    };

    let failed = await deleteBusinessTables(TABLES_BY_USER_ID);

    // profiles 主键是 id 而不是 user_id，必须单独按 id 删除/重试，不能混进按 user_id 删的批量逻辑。
    const deleteProfile = async (): Promise<boolean> => {
      const { error } = await admin.from("profiles").delete().eq("id", user.id);
      if (error && !/(does not exist|relation .* does not exist)/i.test(error.message)) {
        console.error(`[delete-account] table=profiles err=${error.message}`);
        return true;
      }
      return false;
    };
    let profileFailed = await deleteProfile();

    // 关键：删除 auth 账号是不可逆动作，必须在全部业务数据删除成功后才执行。
    // 若仍有失败，重试一次；再失败则中止（不删 auth/存储），返回 500，
    // 用户仍可登录后重试，避免"账号已注销但健康数据永久残留"的隐私违规。
    if (failed.length > 0) {
      failed = await deleteBusinessTables(failed);
    }
    if (profileFailed) profileFailed = await deleteProfile();
    if (failed.length > 0 || profileFailed) {
      const stillFailed = profileFailed ? [...failed, "profiles"] : failed;
      console.error("[delete-account] aborting auth deletion, tables still failed:", stillFailed);
      return new Response(
        JSON.stringify({
          success: false,
          error: "部分数据删除失败，账号未注销，请稍后重试",
          failed_tables: stillFailed,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2c) 删除存储桶中以 user.id 为前缀的对象（best-effort）
    for (const bucket of ["voice-records", "checkin-photos"]) {
      try {
        const { data: files } = await admin.storage.from(bucket).list(user.id, { limit: 1000 });
        if (files && files.length > 0) {
          await admin.storage.from(bucket).remove(files.map((f) => `${user.id}/${f.name}`));
        }
      } catch (e) {
        console.warn(`[delete-account] storage bucket=${bucket} err=`, e);
      }
    }

    // 2d) 删除 auth 账号（仅在全部业务数据删除成功后执行）
    const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
    if (authErr) {
      console.error("[delete-account] auth delete failed:", authErr.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to delete auth account",
          partial: true,
          failed_tables: failed,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, failed_tables: failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[delete-account] unexpected error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
