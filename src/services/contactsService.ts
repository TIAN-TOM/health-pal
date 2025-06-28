
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export const getContacts = async (): Promise<Contact[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 确保所有联系人都有有效的id，处理老数据可能缺少id的情况
    return (data || []).map((contact, index) => ({
      ...contact,
      id: contact.id || `temp_${contact.user_id}_${index}`,
      avatar: contact.avatar || '👤'
    }));
  } catch (error) {
    console.error('获取联系人失败:', error);
    return [];
  }
};

export const saveContact = async (contact: Omit<Contact, 'id'>): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: user.id,
        name: contact.name,
        phone: contact.phone,
        avatar: contact.avatar || '👤'
      });

    if (error) throw error;
  } catch (error) {
    console.error('保存联系人失败:', error);
    throw error;
  }
};

export const updateContact = async (id: string, contact: Partial<Contact>): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    // 如果是临时ID（老数据），先查找对应的真实记录
    if (id.startsWith('temp_')) {
      const { data: existingContacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', contact.name)
        .eq('phone', contact.phone);

      if (existingContacts && existingContacts.length > 0) {
        id = existingContacts[0].id;
      } else {
        // 如果找不到对应记录，创建新记录
        await saveContact(contact as Omit<Contact, 'id'>);
        return;
      }
    }

    const { error } = await supabase
      .from('emergency_contacts')
      .update({
        name: contact.name,
        phone: contact.phone,
        avatar: contact.avatar
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('更新联系人失败:', error);
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    // 如果是临时ID（老数据），需要先查找真实记录
    if (id.startsWith('temp_')) {
      // 通过索引找到对应的联系人
      const contacts = await getContacts();
      const contactIndex = parseInt(id.split('_')[2]);
      const targetContact = contacts[contactIndex];
      
      if (targetContact && !targetContact.id.startsWith('temp_')) {
        id = targetContact.id;
      } else {
        // 如果无法找到真实ID，通过其他字段查找
        const { data: allContacts } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);

        if (allContacts && allContacts[contactIndex]) {
          id = allContacts[contactIndex].id;
        } else {
          throw new Error('无法找到要删除的联系人');
        }
      }
    }

    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('删除联系人失败:', error);
    throw error;
  }
};
