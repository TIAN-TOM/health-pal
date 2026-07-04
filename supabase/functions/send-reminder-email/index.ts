// Send a single reminder email through Resend Gateway.
// Called by the daily-reminder-scheduler; not exposed directly to the browser.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  to: z.string().email(),
  userName: z.string().min(1).max(120).default('您'),
  reminders: z
    .array(
      z.object({
        type: z.enum(['checkin_streak', 'medication', 'medical_followup', 'family_calendar']),
        title: z.string().min(1).max(200),
        detail: z.string().max(500).optional(),
      }),
    )
    .min(1)
    .max(10),
});

const TITLE_MAP: Record<string, string> = {
  checkin_streak: '📅 打卡提醒',
  medication: '💊 用药提醒',
  medical_followup: '🏥 复诊提醒',
  family_calendar: '👨‍👩‍👧 家庭日程',
};

function renderHtml(userName: string, items: z.infer<typeof BodySchema>['reminders']) {
  const rows = items
    .map(
      (r) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #eef2f7;vertical-align:top;">
            <div style="font-size:14px;color:#1f2937;font-weight:600;">${TITLE_MAP[r.type] ?? r.type}</div>
            <div style="font-size:14px;color:#111827;margin-top:4px;">${r.title}</div>
            ${r.detail ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">${r.detail}</div>` : ''}
          </td>
        </tr>`,
    )
    .join('');
  return `<!doctype html><html><body style="margin:0;background:#f6f9fc;font-family:-apple-system,'PingFang SC',sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
        <div style="padding:20px 20px 12px;background:linear-gradient(135deg,#3b82f6,#10b981);color:#fff;">
          <div style="font-size:18px;font-weight:700;">健康生活伴侣 · 今日提醒</div>
          <div style="font-size:13px;opacity:.92;margin-top:4px;">${userName}，以下事项别忘记 👇</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        <div style="padding:16px 20px;text-align:center;">
          <a href="https://health-pal.lovable.app/" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;">打开应用</a>
        </div>
      </div>
      <div style="text-align:center;color:#9ca3af;font-size:12px;margin-top:12px;">
        如不希望再收到提醒，可在应用「设置 → 通知偏好」中关闭。
      </div>
    </div>
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Allow either a valid user JWT or the service_role key (used by the scheduler).
    const token = authHeader.replace('Bearer ', '');
    const isService = token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!isService) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data, error } = await supabase.auth.getClaims(token);
      if (error || !data?.claims) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { to, userName, reminders } = parsed.data;

    const resp = await fetch('https://connector-gateway.lovable.dev/resend/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: '健康生活伴侣 <onboarding@resend.dev>',
        to: [to],
        subject: `今日提醒：${reminders.length} 项待办`,
        html: renderHtml(userName, reminders),
      }),
    });

    const result = await resp.json();
    if (!resp.ok) {
      console.error('Resend gateway error', resp.status, result);
      return new Response(JSON.stringify({ error: 'Send failed', detail: result }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-reminder-email error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
