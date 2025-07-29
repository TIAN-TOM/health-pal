import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FamilyMessage {
  id: string;
  user_id: string;
  sender_name: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateMessageData {
  content: string;
  sender_name: string;
  message_type?: string;
}

export const familyMessagesService = {
  // 获取家庭消息列表
  async getMessages(): Promise<FamilyMessage[]> {
    try {
      const { data, error } = await supabase
        .from('family_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('获取家庭消息失败:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('获取家庭消息失败:', error);
      throw error;
    }
  },

  // 发送新消息
  async sendMessage(messageData: CreateMessageData): Promise<FamilyMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('用户未登录');
      }

      const { data, error } = await supabase
        .from('family_messages')
        .insert([{
          user_id: user.id,
          sender_name: messageData.sender_name,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          is_read: false
        }])
        .select()
        .single();

      if (error) {
        console.error('发送消息失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  },

  // 标记消息为已读
  async markAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('family_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) {
        console.error('标记消息已读失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('标记消息已读失败:', error);
      throw error;
    }
  },

  // 删除消息
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('family_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('删除消息失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('删除消息失败:', error);
      throw error;
    }
  },

  // 订阅实时消息更新
  subscribeToMessages(callback: (message: FamilyMessage) => void) {
    const channel = supabase
      .channel('family_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_messages'
        },
        (payload) => {
          callback(payload.new as FamilyMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};