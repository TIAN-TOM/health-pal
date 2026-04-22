import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ActivityNotification {
  activity_type?: string;
  activity_description?: string;
  module_name?: string;
}

// Whitelisted activity types and modules to prevent injection of misleading content
const ALLOWED_ACTIVITY_TYPES = new Set([
  'data_export', 'record_create', 'record_update', 'record_delete',
  'login', 'profile_update', 'feedback_submit', 'voice_record', 'other'
]);

const truncate = (s: string, max: number) =>
  (s ?? '').toString().slice(0, max);

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

    const body: ActivityNotification = await req.json().catch(() => ({}));
    const activity_type = (body.activity_type ?? 'other').toString();
    const activity_description = truncate(body.activity_description ?? '', 500);
    const module_name = truncate(body.module_name ?? '', 100);

    if (!ALLOWED_ACTIVITY_TYPES.has(activity_type)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid activity_type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Derive user identity server-side from verified JWT
    const { data: profile } = await supabaseServiceClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    const safeUserName = truncate(profile?.full_name || profile?.email || user.email || '用户', 100);

    console.log('收到用户活动通知:', {
      user_id: user.id,
      user_name: safeUserName,
      activity_type,
      module_name,
    });

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
      title: `用户活动：${module_name}`,
      message: `用户 ${safeUserName} ${activity_description}`,
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
      JSON.stringify({
        success: true,
        message: `成功通知 ${admins.length} 个管理员`,
        activity_type,
        module_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('处理用户活动通知失败:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
