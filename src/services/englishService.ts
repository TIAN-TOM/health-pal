
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type EnglishQuote = Tables<'english_quotes'>;
type EnglishWord = Tables<'english_words'>;
type EnglishPhrase = Tables<'english_phrases'>;
type EnglishListening = Tables<'english_listening'>;

export const getRandomQuote = async (): Promise<EnglishQuote | null> => {
  const { data, error } = await supabase
    .from('english_quotes')
    .select('*')
    .limit(1);

  if (error) {
    console.error('获取英语名言失败:', error);
    return null;
  }

  if (data && data.length > 0) {
    return data[Math.floor(Math.random() * data.length)];
  }

  return null;
};

export const getRandomWords = async (limit: number = 3): Promise<EnglishWord[]> => {
  const { data, error } = await supabase
    .from('english_words')
    .select('*')
    .limit(limit * 2); // 获取更多数据以便随机选择

  if (error) {
    console.error('获取英语单词失败:', error);
    return [];
  }

  if (data && data.length > 0) {
    // 随机选择指定数量的单词
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  return [];
};

export const getRandomPhrases = async (limit: number = 3): Promise<EnglishPhrase[]> => {
  const { data, error } = await supabase
    .from('english_phrases')
    .select('*')
    .limit(limit * 2);

  if (error) {
    console.error('获取英语短语失败:', error);
    return [];
  }

  if (data && data.length > 0) {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  return [];
};

export const getListeningTexts = async (limit: number = 2): Promise<EnglishListening[]> => {
  const { data, error } = await supabase
    .from('english_listening')
    .select('*')
    .limit(limit * 2);

  if (error) {
    console.error('获取听力文本失败:', error);
    return [];
  }

  if (data && data.length > 0) {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  return [];
};
