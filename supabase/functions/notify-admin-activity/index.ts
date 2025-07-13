import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ActivityNotification {
  user_id: string;
  user_name: string;
  activity_type: string;
  activity_description: string;
  module_name: string;
  additional_data?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      user_id, 
      user_name, 
      activity_type, 
      activity_description, 
      module_name,
      additional_data 
    }: ActivityNotification = await req.json()

    console.log('收到用户活动通知:', { 
      user_id, 
      user_name, 
      activity_type, 
      module_name, 
      activity_description 
    })

    // 获取所有管理员
    const { data: admins, error: adminError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    if (adminError) {
      console.error('获取管理员列表失败:', adminError)
      throw adminError
    }

    if (!admins || admins.length === 0) {
      console.log('没有找到管理员')
      return new Response(
        JSON.stringify({ success: true, message: '没有管理员需要通知' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // 为每个管理员创建通知
    const notifications = admins.map(admin => ({
      admin_id: admin.user_id,
      title: `用户活动：${module_name}`,
      message: `用户 ${user_name} ${activity_description}`,
      type: 'info'
    }))

    const { error: notificationError } = await supabaseClient
      .from('admin_notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('创建管理员通知失败:', notificationError)
      throw notificationError
    }

    console.log(`成功为 ${admins.length} 个管理员创建活动通知`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `成功通知 ${admins.length} 个管理员`,
        activity_type,
        module_name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('处理用户活动通知失败:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})