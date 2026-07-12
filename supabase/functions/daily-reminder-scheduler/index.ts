// Scans all users' reminder conditions and dispatches emails.
// Called by pg_cron with the service_role key. verify_jwt = false in config.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Reminder {
  type: 'checkin_streak' | 'medication' | 'medical_followup' | 'family_calendar';
  title: string;
  detail?: string;
}

interface PrefRow {
  user_id: string;
  checkin_streak: boolean;
  medication: boolean;
  medical_followup: boolean;
  family_calendar: boolean;
  last_reminder_sent_at: string | null;
}

// 每页处理的偏好行数；页内 user_id 会拼进 .in() 查询，页太大 URL 会超长
const PAGE_SIZE = 100;
// 逐用户操作（取邮箱、发邮件）的并发上限
const CONCURRENCY = 5;

function groupByUser<T extends { user_id: string }>(rows: T[] | null | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows ?? []) {
    const list = map.get(row.user_id);
    if (list) list.push(row);
    else map.set(row.user_id, [row]);
  }
  return map;
}

async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
    }
  });
  await Promise.all(workers);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 仅接受 service_role 调用（pg_cron），拒绝匿名/普通用户
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader.replace('Bearer ', '') !== SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const todayCST = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const tomorrowCST = new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const threeDaysAgoCST = new Date(Date.now() + 8 * 60 * 60 * 1000 - 3 * 86400_000)
    .toISOString()
    .slice(0, 10);

  let dispatched = 0;
  let skipped = 0;
  let failed = 0;
  let total = 0;

  // 分页拉取所有开启了邮件提醒的用户，逐页批量处理
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data: prefs, error: prefsErr } = await admin
      .from('user_notification_preferences')
      .select('*')
      .eq('email_reminders_enabled', true)
      .order('user_id')
      .range(offset, offset + PAGE_SIZE - 1);

    if (prefsErr) {
      console.error('prefs fetch failed', prefsErr);
      if (total === 0) {
        return new Response(JSON.stringify({ error: prefsErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;
    }

    const page: PrefRow[] = prefs ?? [];
    if (page.length === 0) break;
    total += page.length;

    const streakIds = page.filter((p) => p.checkin_streak).map((p) => p.user_id);
    const medIds = page.filter((p) => p.medication).map((p) => p.user_id);
    const followupIds = page.filter((p) => p.medical_followup).map((p) => p.user_id);
    const calendarIds = page.filter((p) => p.family_calendar).map((p) => p.user_id);

    // 每张表整页只查一次，再在内存中按用户分组
    const emptyResult = { data: [], error: null };
    const [checkinRes, medsRes, followupRes, eventsRes] = await Promise.all([
      streakIds.length > 0
        ? admin
            .from('daily_checkins')
            .select('user_id')
            .in('user_id', streakIds)
            .gte('checkin_date', threeDaysAgoCST)
        : Promise.resolve(emptyResult),
      medIds.length > 0
        // order + 显式上限：避免 PostgREST 默认 1000 行截断时非确定性丢用户
        // （每页最多 100 用户，每人用药数很小，2000 远超实际）
        ? admin.from('user_medications').select('user_id, name').in('user_id', medIds).order('user_id').limit(2000)
        : Promise.resolve(emptyResult),
      followupIds.length > 0
        ? admin
            .from('medical_records')
            .select('user_id, title, follow_up_date')
            .in('user_id', followupIds)
            .gte('follow_up_date', todayCST)
            .lte('follow_up_date', tomorrowCST)
        : Promise.resolve(emptyResult),
      calendarIds.length > 0
        ? admin
            .from('family_calendar_events')
            .select('user_id, title, event_date, start_time')
            .in('user_id', calendarIds)
            .gte('event_date', todayCST)
            .lte('event_date', tomorrowCST)
        : Promise.resolve(emptyResult),
    ]);

    if (checkinRes.error) console.error('daily_checkins fetch failed', checkinRes.error);
    if (medsRes.error) console.error('user_medications fetch failed', medsRes.error);
    if (followupRes.error) console.error('medical_records fetch failed', followupRes.error);
    if (eventsRes.error) console.error('family_calendar_events fetch failed', eventsRes.error);

    // 近 3 天内有打卡的用户；查询失败时跳过打卡提醒，避免误报「未打卡」
    const recentCheckinUsers = new Set<string>(
      (checkinRes.data ?? []).map((r: { user_id: string }) => r.user_id),
    );
    const medsByUser = groupByUser<{ user_id: string; name: string }>(medsRes.data);
    const followupsByUser = groupByUser<{ user_id: string; title: string | null; follow_up_date: string }>(
      followupRes.data,
    );
    const eventsByUser = groupByUser<{ user_id: string; title: string; event_date: string; start_time: string | null }>(
      eventsRes.data,
    );

    const candidates: { pref: PrefRow; reminders: Reminder[] }[] = [];

    for (const p of page) {
      const reminders: Reminder[] = [];

      // 1) 连续 3 天未打卡
      if (p.checkin_streak && !checkinRes.error && !recentCheckinUsers.has(p.user_id)) {
        reminders.push({
          type: 'checkin_streak',
          title: '已连续 3 天未打卡',
          detail: '回来签到一下，保持你的健康记录节奏。',
        });
      }

      // 2) 有已配置的用药
      if (p.medication) {
        const meds = (medsByUser.get(p.user_id) ?? []).slice(0, 3);
        if (meds.length > 0) {
          reminders.push({
            type: 'medication',
            title: `今日别忘记服用：${meds.map((m) => m.name).join('、')}`,
          });
        }
      }

      // 3) 24 小时内的复诊记录（follow_up_date 字段）
      if (p.medical_followup) {
        for (const f of (followupsByUser.get(p.user_id) ?? []).slice(0, 3)) {
          reminders.push({
            type: 'medical_followup',
            title: `${f.follow_up_date} 复诊：${f.title ?? '待就诊'}`,
          });
        }
      }

      // 4) 24 小时内的家庭日历事件
      if (p.family_calendar) {
        for (const e of (eventsByUser.get(p.user_id) ?? []).slice(0, 5)) {
          reminders.push({
            type: 'family_calendar',
            title: `${e.event_date}${e.start_time ? ' ' + e.start_time : ''}：${e.title}`,
          });
        }
      }

      if (reminders.length === 0) {
        skipped++;
        continue;
      }

      // 20 小时防重发，容忍调度抖动
      if (
        p.last_reminder_sent_at &&
        Date.now() - new Date(p.last_reminder_sent_at).getTime() < 20 * 3600_000
      ) {
        skipped++;
        continue;
      }

      candidates.push({ pref: p, reminders });
    }

    if (candidates.length > 0) {
      // 只为待发送用户批量取姓名
      const { data: profiles, error: profilesErr } = await admin
        .from('profiles')
        .select('id, full_name')
        .in('id', candidates.map((c) => c.pref.user_id));
      if (profilesErr) console.error('profiles fetch failed', profilesErr);
      const nameById = new Map<string, string | null>(
        (profiles ?? []).map((r: { id: string; full_name: string | null }) => [r.id, r.full_name]),
      );

      // auth.admin 无法按 id 批量取邮箱，保持逐用户查询，用并发池限流；
      // 单个用户失败只计入 failed，不影响其余用户
      await runPool(candidates, CONCURRENCY, async ({ pref, reminders }) => {
        try {
          const { data: userInfo } = await admin.auth.admin.getUserById(pref.user_id);
          const email = userInfo?.user?.email;
          if (!email) {
            skipped++;
            return;
          }

          const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-reminder-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${SERVICE_ROLE}`,
            },
            body: JSON.stringify({
              to: email,
              userName: nameById.get(pref.user_id) || '您',
              reminders,
            }),
          });
          if (!resp.ok) {
            failed++;
            console.error('send failed for', pref.user_id, await resp.text());
            return;
          }

          await admin
            .from('user_notification_preferences')
            .update({ last_reminder_sent_at: new Date().toISOString() })
            .eq('user_id', pref.user_id);
          dispatched++;
        } catch (err) {
          failed++;
          console.error('user send error', pref.user_id, err);
        }
      });
    }

    if (page.length < PAGE_SIZE) break;
  }

  return new Response(
    JSON.stringify({ dispatched, skipped, failed, total }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
