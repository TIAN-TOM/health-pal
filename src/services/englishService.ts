
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { getBeijingDateString } from '@/utils/beijingTime';

type EnglishQuote = Tables<'english_quotes'>;
type EnglishWord = Tables<'english_words'>;
type EnglishPhrase = Tables<'english_phrases'>;
type EnglishListening = Tables<'english_listening'>;

// 根据日期生成稳定的随机种子
const getDaySeed = (date?: string): number => {
  const dateStr = date || getBeijingDateString();
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
};

// 基于种子的伪随机数生成器
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  // 从数组中随机选择项目
  selectItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  // 随机选择一个项目
  selectOne<T>(array: T[]): T | null {
    if (array.length === 0) return null;
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }
}

export const getRandomQuote = async (date?: string): Promise<EnglishQuote | null> => {
  const { data, error } = await supabase
    .from('english_quotes')
    .select('*');

  if (error) {
    console.error('获取英语名言失败:', error);
    return null;
  }

  if (!data || data.length === 0) return null;

  const seed = getDaySeed(date);
  const random = new SeededRandom(seed);
  return random.selectOne(data);
};

export const getRandomWords = async (limit: number = 3, date?: string): Promise<EnglishWord[]> => {
  const { data, error } = await supabase
    .from('english_words')
    .select('*');

  if (error) {
    console.error('获取英语单词失败:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const seed = getDaySeed(date);
  const random = new SeededRandom(seed + 1); // 不同的种子确保和名言不同
  return random.selectItems(data, limit);
};

export const getRandomPhrases = async (limit: number = 3, date?: string): Promise<EnglishPhrase[]> => {
  const { data, error } = await supabase
    .from('english_phrases')
    .select('*');

  if (error) {
    console.error('获取英语短语失败:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const seed = getDaySeed(date);
  const random = new SeededRandom(seed + 2); // 不同的种子
  return random.selectItems(data, limit);
};

export const getListeningTexts = async (limit: number = 2, date?: string): Promise<EnglishListening[]> => {
  const { data, error } = await supabase
    .from('english_listening')
    .select('*');

  if (error) {
    console.error('获取听力文本失败:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const seed = getDaySeed(date);
  const random = new SeededRandom(seed + 3); // 不同的种子
  return random.selectItems(data, limit);
};

// 获取指定日期的每日英语内容（用于测试和预览）
export const getDailyEnglishContent = async (date: string) => {
  const [quote, words, phrases, listening] = await Promise.all([
    getRandomQuote(date),
    getRandomWords(3, date),
    getRandomPhrases(3, date),
    getListeningTexts(2, date)
  ]);

  return {
    quote,
    words,
    phrases,
    listening,
    date
  };
};

// 预加载明天的内容（可选功能）
export const preloadTomorrowContent = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.getFullYear() + '-' + 
    String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
    String(tomorrow.getDate()).padStart(2, '0');
  
  return getDailyEnglishContent(tomorrowStr);
};
