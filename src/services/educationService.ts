
import { supabase } from '@/integrations/supabase/client';

export interface EducationArticle {
  id: string;
  title: string;
  category: 'basics' | 'symptoms' | 'treatment' | 'lifestyle' | 'psychology';
  content: string;
  summary?: string;
  reading_time?: number;
}

export const getEducationArticles = async (): Promise<EducationArticle[]> => {
  const { data, error } = await supabase
    .from('education_articles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as EducationArticle[];
};

export const getArticlesByCategory = async (category: string): Promise<EducationArticle[]> => {
  const { data, error } = await supabase
    .from('education_articles')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as EducationArticle[];
};
