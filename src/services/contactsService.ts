
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id?: string;
  name: string;
  phone: string;
  avatar: string;
}

export const saveContact = async (contact: Omit<Contact, 'id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('用户未登录');

  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({
      user_id: user.id,
      name: contact.name,
      phone: contact.phone,
      avatar: contact.avatar
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getContacts = async (): Promise<Contact[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const updateContact = async (id: string, updates: Partial<Contact>) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteContact = async (id: string) => {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// 添加别名函数以匹配 Settings 组件中的调用
export const getEmergencyContacts = getContacts;
export const saveEmergencyContact = saveContact;
export const deleteEmergencyContact = deleteContact;
