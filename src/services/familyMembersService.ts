import { supabase } from '@/integrations/supabase/client';

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone?: string;
  birthday?: string;
  address?: string;
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const familyMembersService = {
  // 获取家庭成员列表
  async getFamilyMembers(): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取家庭成员失败:', error);
      throw error;
    }

    return data || [];
  },

  // 添加家庭成员
  async addFamilyMember(member: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FamilyMember> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('family_members')
      .insert([{ ...member, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('添加家庭成员失败:', error);
      throw error;
    }

    return data;
  },

  // 更新家庭成员
  async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新家庭成员失败:', error);
      throw error;
    }

    return data;
  },

  // 删除家庭成员
  async deleteFamilyMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除家庭成员失败:', error);
      throw error;
    }
  },

  // 上传头像
  async uploadAvatar(file: File, memberId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${memberId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('family-avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('上传头像失败:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('family-avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};