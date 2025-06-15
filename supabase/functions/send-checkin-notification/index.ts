
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      throw new Error('未授权');
    }

    // 获取用户信息
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // 获取所有管理员
    const { data: admins } = await supabaseClient
      .from('user_roles')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      console.log(`用户 ${profile?.full_name || user.email} 完成了每日打卡`);
      console.log(`通知管理员: ${admins.map(admin => admin.profiles?.email).join(', ')}`);
      
      // 这里可以添加发送邮件的逻辑
      // 由于需要 RESEND_API_KEY，暂时只记录日志
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('发送通知失败:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
