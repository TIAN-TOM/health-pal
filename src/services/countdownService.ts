import { supabase } from '@/integrations/supabase/client';

export interface CountdownEvent {
  id: string;
  title: string;
  target_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getActiveCountdownEvent = async (): Promise<CountdownEvent | null> => {
  const { data, error } = await supabase
    .from('countdown_events')
    .select('*')
    .eq('is_active', true)
    .order('target_date', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No active countdown
    }
    console.error('Error fetching countdown:', error);
    throw error;
  }

  return data;
};

export const getAllCountdownEvents = async (): Promise<CountdownEvent[]> => {
  const { data, error } = await supabase
    .from('countdown_events')
    .select('*')
    .order('target_date', { ascending: false });

  if (error) {
    console.error('Error fetching all countdowns:', error);
    throw error;
  }

  return data || [];
};

export const createCountdownEvent = async (event: {
  title: string;
  target_date: string;
  description?: string;
  is_active?: boolean;
}): Promise<CountdownEvent> => {
  const { data, error } = await supabase
    .from('countdown_events')
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error('Error creating countdown:', error);
    throw error;
  }

  return data;
};

export const updateCountdownEvent = async (
  id: string,
  updates: Partial<CountdownEvent>
): Promise<CountdownEvent> => {
  const { data, error } = await supabase
    .from('countdown_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating countdown:', error);
    throw error;
  }

  return data;
};

export const deleteCountdownEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('countdown_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting countdown:', error);
    throw error;
  }
};
