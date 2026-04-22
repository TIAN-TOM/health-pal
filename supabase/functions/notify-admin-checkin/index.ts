import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckinNotification {
  checkin_date?: string;
  mood_score?: number;
}

const truncate = (s: string, max: number) => (s ?? '').toString().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: CheckinNotification = await req.json().catch(() => ({}));
    // Validate checkin_date as YYYY-MM-DD
    const rawDate = (body.checkin_date ?? '').toString();
    const checkin_date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : new Date().toISOString().slice(0, 10);

    let mood_score: number | undefined;
    if (typeof body.mood_score === 'number' && body.mood_score >= 1 && body.mood_score <= 5) {
      mood_score = Math.round(body.mood_score);
    }

    // Derive identity from verified JWT
    const { data: profile } = await supabaseServiceClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    const safeUserName = truncate(profile?.full_name || profile?.email || user.email || '用户', 100);

    console.log('收到打卡通知请求:', { user_id: user.id, checkin_date, mood_score });

    const { data: admins, error: adminError } = await supabaseServiceClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminError) {
      console.error('获取管理员列表失败:', adminError);
      throw adminError;
    }

    if (!admins || admins.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: '没有管理员需要通知' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const notifications = admins.map(admin => ({
      admin_id: admin.user_id,
      title: '用户打卡提醒',
      message: `用户 ${safeUserName} 完成了 ${checkin_date} 的打卡${mood_score ? `，心情评分：${mood_score}/5` : ''}`,
      type: 'info'
    }));

    const { error: notificationError } = await supabaseServiceClient
      .from('admin_notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('创建管理员通知失败:', notificationError);
      throw notificationError;
    }

    return new Response(
      JSON.stringify({ success: true, message: `成功通知 ${admins.length} 个管理员` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('处理打卡通知失败:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
