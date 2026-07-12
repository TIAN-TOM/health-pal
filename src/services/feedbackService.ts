import { supabase } from '@/integrations/supabase/client';

export interface UserFeedback {
  id: string;
  user_id: string;
  feedback_type: 'bug' | 'suggestion' | 'improvement' | 'other';
  title: string;
  content: string;
  contact_info?: string;
  status: 'pending' | 'reviewing' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackData {
  feedback_type: 'bug' | 'suggestion' | 'improvement' | 'other';
  title: string;
  content: string;
  contact_info?: string;
}

export const submitFeedback = async (feedbackData: CreateFeedbackData): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: user.id,
        feedback_type: feedbackData.feedback_type,
        title: feedbackData.title,
        content: feedbackData.content,
        contact_info: feedbackData.contact_info
      });

    if (error) throw error;
  } catch (error) {
    console.error('提交反馈失败:', error);
    throw error;
  }
};

export const getUserFeedback = async (): Promise<UserFeedback[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      feedback_type: item.feedback_type as 'bug' | 'suggestion' | 'improvement' | 'other',
      status: item.status as 'pending' | 'reviewing' | 'completed' | 'rejected',
      contact_info: item.contact_info || undefined
    }));
  } catch (error) {
    console.error('获取反馈记录失败:', error);
    return [];
  }
};

// 管理后台视图：状态取值范围比用户端更宽（in_progress/resolved/closed 等），故单独定义类型而非复用 UserFeedback
export interface AdminFeedback {
  id: string;
  user_id: string;
  title: string;
  content: string;
  contact_info: string | null;
  feedback_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

// 管理员读取全部反馈并合并提交者资料（两次查询后在客户端 join）
export const getAllFeedbackWithProfiles = async (): Promise<AdminFeedback[]> => {
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('user_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (feedbackError) throw feedbackError;

  const userIds = [...new Set(feedbackData?.map((f) => f.user_id) || [])];
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  return (feedbackData || []).map((feedback) => ({
    ...feedback,
    profiles: profilesData?.find((p) => p.id === feedback.user_id) || null,
  }));
};

export const updateFeedbackStatus = async (feedbackId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('user_feedback')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', feedbackId);

  if (error) throw error;
};