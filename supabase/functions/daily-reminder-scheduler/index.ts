// Scans all users' reminder conditions and dispatches emails.
// Called by pg_cron with the service_role key. verify_jwt = false in config.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Reminder {
  type: 'checkin_streak' | 'medication' | 'medical_followup' | 'family_calendar';
  title: string;
  detail?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const todayCST = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const tomorrowCST = new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const threeDaysAgoCST = new Date(Date.now() + 8 * 60 * 60 * 1000 - 3 * 86400_000)
    .toISOString()
    .slice(0, 10);

  // 拉取所有开启了邮件提醒的用户
  const { data: prefs, error: prefsErr } = await admin
    .from('user_notification_preferences')
    .select('*')
    .eq('email_reminders_enabled', true);

  if (prefsErr) {
    console.error('prefs fetch failed', prefsErr);
    return new Response(JSON.stringify({ error: prefsErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let dispatched = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of prefs ?? []) {
    try {
      const reminders: Reminder[] = [];

      // 1) 连续 3 天未打卡
      if (p.checkin_streak) {
        const { data: last } = await admin
          .from('daily_checkins')
          .select('checkin_date')
          .eq('user_id', p.user_id)
          .order('checkin_date', { ascending: false })
          .limit(1);
        const lastDate = last?.[0]?.checkin_date as string | undefined;
        if (!lastDate || lastDate < threeDaysAgoCST) {
          reminders.push({
            type: 'checkin_streak',
            title: '已连续 3 天未打卡',
            detail: '回来签到一下，保持你的健康记录节奏。',
          });
        }
      }

      // 2) 有已配置的用药
      if (p.medication) {
        const { data: meds } = await admin
          .from('user_medications')
          .select('name')
          .eq('user_id', p.user_id)
          .limit(3);
        if (meds && meds.length > 0) {
          reminders.push({
            type: 'medication',
            title: `今日别忘记服用：${meds.map((m: { name: string }) => m.name).join('、')}`,
          });
        }
      }

      // 3) 24 小时内的复诊记录（follow_up_date 字段）
      if (p.medical_followup) {
        const { data: followups } = await admin
          .from('medical_records')
          .select('title, follow_up_date')
          .eq('user_id', p.user_id)
          .gte('follow_up_date', todayCST)
          .lte('follow_up_date', tomorrowCST)
          .limit(3);
        for (const f of followups ?? []) {
          reminders.push({
            type: 'medical_followup',
            title: `${f.follow_up_date} 复诊：${f.title ?? '待就诊'}`,
          });
        }
      }

      // 4) 24 小时内的家庭日历事件
      if (p.family_calendar) {
        const { data: events } = await admin
          .from('family_calendar_events')
          .select('title, event_date, start_time')
          .eq('user_id', p.user_id)
          .gte('event_date', todayCST)
          .lte('event_date', tomorrowCST)
          .limit(5);
        for (const e of events ?? []) {
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

      // 24 小时防重发
      if (
        p.last_reminder_sent_at &&
        Date.now() - new Date(p.last_reminder_sent_at).getTime() < 20 * 3600_000
      ) {
        skipped++;
        continue;
      }

      // 取用户邮箱与姓名
      const { data: userInfo } = await admin.auth.admin.getUserById(p.user_id);
      const email = userInfo?.user?.email;
      if (!email) {
        skipped++;
        continue;
      }
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name')
        .eq('id', p.user_id)
        .single();

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-reminder-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
        body: JSON.stringify({
          to: email,
          userName: profile?.full_name || '您',
          reminders,
        }),
      });
      if (!resp.ok) {
        failed++;
        console.error('send failed for', p.user_id, await resp.text());
        continue;
      }

      await admin
        .from('user_notification_preferences')
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq('user_id', p.user_id);
      dispatched++;
    } catch (err) {
      failed++;
      console.error('user loop error', p.user_id, err);
    }
  }

  return new Response(
    JSON.stringify({ dispatched, skipped, failed, total: prefs?.length ?? 0 }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
