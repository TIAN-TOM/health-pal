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