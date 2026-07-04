// Generates or returns a cached AI weekly health report for the current user.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

function mondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimErr } = await supabase.auth.getClaims(token);
    if (claimErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claims.claims.sub;
    const weekStart = mondayOf(new Date());

    // 已有本周报表？直接返回
    const { data: existing } = await supabase
      .from('ai_weekly_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ cached: true, report: existing }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 拉取近 7 天数据
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
    const [meniere, diabetes, checkins] = await Promise.all([
      supabase
        .from('meniere_records')
        .select('type, timestamp, severity, note')
        .gte('timestamp', sevenDaysAgo)
        .order('timestamp', { ascending: false })
        .limit(50),
      supabase
        .from('diabetes_records')
        .select('measurement_time, glucose_value, meal_context, notes')
        .gte('measurement_time', sevenDaysAgo)
        .order('measurement_time', { ascending: false })
        .limit(50),
      supabase
        .from('daily_checkins')
        .select('checkin_date, mood')
        .gte('checkin_date', sevenDaysAgo.slice(0, 10))
        .order('checkin_date', { ascending: false })
        .limit(14),
    ]);

    const dataPoints =
      (meniere.data?.length ?? 0) +
      (diabetes.data?.length ?? 0) +
      (checkins.data?.length ?? 0);

    if (dataPoints === 0) {
      return new Response(
        JSON.stringify({ error: '本周暂无记录，多打卡多记录之后再来生成周报吧' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `你是一位温和、专业的中文健康助手。根据以下用户最近 7 天的健康记录，用第二人称输出一份简短的周报。

要求：
- summary 字段：不超过 180 字的整体状况摘要，语气亲切，不做医疗诊断，避免夸大。
- suggestions 字段：3 条可执行、具体的健康建议，每条不超过 40 字。
- 严格返回 JSON，字段名固定为 summary 和 suggestions（数组）。

眩晕/耳鸣记录 (${meniere.data?.length ?? 0} 条)：
${JSON.stringify(meniere.data ?? [])}

血糖记录 (${diabetes.data?.length ?? 0} 条)：
${JSON.stringify(diabetes.data ?? [])}

每日打卡心情 (${checkins.data?.length ?? 0} 条)：
${JSON.stringify(checkins.data ?? [])}`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: '你只返回严格的 JSON，字段：summary (string), suggestions (string[])。' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: 'AI 请求过多，请稍后再试' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: 'AI 额度已用尽，请稍后再试' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error('AI error', aiResp.status, text);
      return new Response(JSON.stringify({ error: 'AI 请求失败' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: { summary?: string; suggestions?: string[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content.slice(0, 400), suggestions: [] };
    }

    const summary = String(parsed.summary ?? '').slice(0, 800);
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 5).map((s) => String(s).slice(0, 120))
      : [];

    const { data: inserted, error: insertErr } = await supabase
      .from('ai_weekly_reports')
      .insert({
        user_id: userId,
        week_start: weekStart,
        summary,
        suggestions,
        data_points_count: dataPoints,
      })
      .select()
      .single();
    if (insertErr) {
      console.error('insert error', insertErr);
      return new Response(JSON.stringify({ error: '保存周报失败' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ cached: false, report: inserted }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-weekly-report error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
