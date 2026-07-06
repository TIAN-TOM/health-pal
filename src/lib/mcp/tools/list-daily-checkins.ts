import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function client(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_daily_checkins",
  title: "List daily check-ins",
  description: "List the signed-in user's daily health check-in records, most recent first.",
  inputSchema: {
    limit: z.number().int().min(1).max(90).default(14).describe("Maximum number of records to return (1-90)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await client(ctx)
      .from("daily_checkins")
      .select("*")
      .eq("user_id", ctx.getUserId())
      .order("checkin_date", { ascending: false })
      .limit(limit);
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { rows: data ?? [] } };
  },
});
