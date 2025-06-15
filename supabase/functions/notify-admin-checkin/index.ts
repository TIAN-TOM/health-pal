
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckinNotification {
  user_id: string;
  user_name: string;
  checkin_date: string;
  mood_score?: number;
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

    const { user_id, user_name, checkin_date, mood_score }: CheckinNotification = await req.json()

    console.log('收到打卡通知请求:', { user_id, user_name, checkin_date, mood_score })

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
      title: '用户打卡提醒',
      message: `用户 ${user_name} 完成了 ${checkin_date} 的打卡${mood_score ? `，心情评分：${mood_score}/5` : ''}`,
      type: 'info'
    }))

    const { error: notificationError } = await supabaseClient
      .from('admin_notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('创建管理员通知失败:', notificationError)
      throw notificationError
    }

    console.log(`成功为 ${admins.length} 个管理员创建打卡通知`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `成功通知 ${admins.length} 个管理员` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('处理打卡通知失败:', error)
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
