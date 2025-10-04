
import { supabase } from '@/integrations/supabase/client';
import { contactSchema, validateUUID } from '@/utils/validation';

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
    return [];
  }
};

export const saveContact = async (contact: Omit<Contact, 'id'>): Promise<void> => {
  try {
    // Validate input
    const validatedContact = contactSchema.parse({
      name: contact.name,
      phone: contact.phone,
      avatar: contact.avatar
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: user.id,
        name: validatedContact.name,
        phone: validatedContact.phone,
        avatar: validatedContact.avatar || '👤'
      });

    if (error) throw error;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('保存联系人失败');
    }
    throw error;
  }
};

export const updateContact = async (id: string, contact: Partial<Contact>): Promise<void> => {
  try {
    // Validate input if provided
    if (contact.name || contact.phone || contact.avatar) {
      contactSchema.partial().parse({
        name: contact.name,
        phone: contact.phone,
        avatar: contact.avatar
      });
    }

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
    if (error instanceof Error) {
      throw new Error('更新联系人失败');
    }
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    // 如果是临时ID，尝试通过其他方式找到真实记录
    let realId = id;
    if (id.startsWith('temp_')) {
      const parts = id.split('_');
      if (parts.length >= 3) {
        const index = parseInt(parts[2]);
        
        // 获取所有联系人并通过索引找到对应的记录
        const { data: allContacts } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (allContacts && allContacts[index]) {
          realId = allContacts[index].id;
        } else {
          throw new Error('找不到要删除的联系人');
        }
      } else {
        throw new Error('无效的联系人ID');
      }
    }

    // 检查是否是有效的UUID格式
    if (!validateUUID(realId)) {
      throw new Error('无效的联系人ID格式');
    }

    // 先删除相关的SMS日志记录（因为外键约束）
    await supabase
      .from('emergency_sms_logs')
      .delete()
      .eq('contact_id', realId)
      .eq('user_id', user.id);

    // 再删除联系人记录
    const { error: contactError, count } = await supabase
      .from('emergency_contacts')
      .delete({ count: 'exact' })
      .eq('id', realId)
      .eq('user_id', user.id);

    if (contactError) {
      throw new Error('删除失败');
    }

    // 检查是否真的删除了记录
    if (count === 0) {
      throw new Error('没有找到要删除的联系人记录');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('删除联系人失败');
  }
};
