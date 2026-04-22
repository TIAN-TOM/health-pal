import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminEmailRequest {
  userEmail: string;
  subject: string;
  message: string;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify caller identity from JWT (anon-key client, NOT service role)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. Use service role for admin role check + DB writes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !userRole) {
      console.error('Unauthorized access attempt by user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3. Validate input
    const body: AdminEmailRequest = await req.json();
    const userEmail = (body.userEmail ?? '').trim();
    const subject = (body.subject ?? '').trim();
    const message = (body.message ?? '').trim();

    if (!isValidEmail(userEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid recipient email' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!subject || subject.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Subject must be 1-200 characters' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!message || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Message must be 1-5000 characters' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic HTML escape to avoid HTML injection in the rendered email
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    const emailResponse = await resend.emails.send({
      from: "系统管理员 <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
            系统管理员消息
          </h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #374151; line-height: 1.6; margin: 0;">
              ${safeMessage}
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              此邮件由系统管理员发送，请勿直接回复此邮件。
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
              如有疑问，请联系客服支持。
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully by admin:", user.id, "to:", userEmail);

    await supabase
      .from('admin_notifications')
      .insert({
        admin_id: user.id,
        title: '邮件发送',
        message: `向用户 ${userEmail} 发送了邮件: ${subject}`,
        type: 'email_sent'
      });

    return new Response(JSON.stringify({
      success: true,
      message: '邮件发送成功',
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in admin-send-email function:", error);
    return new Response(
      JSON.stringify({ error: '发送邮件失败' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
