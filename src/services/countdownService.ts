import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type CountdownEventRow = Tables<'countdown_events'>;

// 数据库行中 is_active 可能为 null，服务层统一归一为 boolean
export type CountdownEvent = Omit<CountdownEventRow, 'is_active'> & { is_active: boolean };

const toCountdownEvent = (row: CountdownEventRow): CountdownEvent => ({
  ...row,
  is_active: row.is_active ?? false,
});

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

  return toCountdownEvent(data);
};

export const getActiveCountdownEvents = async (): Promise<CountdownEvent[]> => {
  const { data, error } = await supabase
    .from('countdown_events')
    .select('*')
    .eq('is_active', true)
    .order('target_date', { ascending: true });

  if (error) {
    console.error('Error fetching countdowns:', error);
    throw error;
  }

  return (data || []).map(toCountdownEvent);
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

  return (data || []).map(toCountdownEvent);
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

  return toCountdownEvent(data);
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

  return toCountdownEvent(data);
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
