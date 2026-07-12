import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getBeijingDateString } from '@/utils/beijingTime';
import {
  fallbackQuotes,
  fallbackWords,
  fallbackPhrases,
  fallbackListening,
} from '@/data/englishFallback';

type EnglishQuote = Tables<'english_quotes'>;
type EnglishWord = Tables<'english_words'>;
type EnglishPhrase = Tables<'english_phrases'>;
type EnglishListening = Tables<'english_listening'>;

// 单表取用上限：内容按日期做确定性轮换，池子有界即可，避免全表无限增长
const POOL_LIMIT = 100;

// 基于日期计算稳定索引：同一天所有设备看到同样的内容
const getDateBasedIndex = (dateStr: string, arrayLength: number, offset: number = 0): number => {
  const [year, month, day] = dateStr.split('-').map((n) => parseInt(n, 10));
  const baseDate = new Date(2025, 0, 1);
  const currentDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((currentDate.getTime() - baseDate.getTime()) / 86400_000);
  return Math.abs(daysDiff + offset) % arrayLength;
};

// 基于日期选择多个不重复项目，步长 7 保证相邻日期组合分散
const selectMultipleByDate = <T>(array: T[], count: number, dateStr: string, offset: number = 0): T[] => {
  if (array.length === 0) return [];
  const startIndex = getDateBasedIndex(dateStr, array.length, offset);
  const result: T[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count && result.length < array.length; i++) {
    let index = (startIndex + i * 7) % array.length;
    let attempts = 0;
    while (usedIndices.has(index) && attempts < array.length) {
      index = (index + 1) % array.length;
      attempts++;
    }
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      result.push(array[index]);
    }
  }
  return result;
};

// 兜底内容补全数据库格式所需字段
const withGeneratedFields = <T extends object>(items: T[], prefix: string) =>
  items.map((item, index) => ({
    ...item,
    id: `${prefix}-${index}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

// 统一取数：DB 为唯一内容源（管理后台维护），失败或为空时用本地兜底
const fetchPool = async <T>(
  table: 'english_quotes' | 'english_words' | 'english_phrases' | 'english_listening',
  fallback: T[],
): Promise<T[]> => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: true })
    .limit(POOL_LIMIT);

  if (error) {
    console.error(`获取 ${table} 失败，使用本地兜底内容:`, error);
    return fallback;
  }
  return data && data.length > 0 ? (data as T[]) : fallback;
};

export const getRandomQuote = async (date?: string): Promise<EnglishQuote | null> => {
  const currentDate = date || getBeijingDateString();
  const pool = await fetchPool<EnglishQuote>(
    'english_quotes',
    withGeneratedFields(fallbackQuotes, 'fallback-quote') as EnglishQuote[],
  );
  if (pool.length === 0) return null;
  return pool[getDateBasedIndex(currentDate, pool.length)];
};

export const getRandomWords = async (limit: number = 3, date?: string): Promise<EnglishWord[]> => {
  const currentDate = date || getBeijingDateString();
  const pool = await fetchPool<EnglishWord>(
    'english_words',
    withGeneratedFields(fallbackWords, 'fallback-word') as EnglishWord[],
  );
  return selectMultipleByDate(pool, limit, currentDate, 1);
};

export const getRandomPhrases = async (limit: number = 3, date?: string): Promise<EnglishPhrase[]> => {
  const currentDate = date || getBeijingDateString();
  const pool = await fetchPool<EnglishPhrase>(
    'english_phrases',
    withGeneratedFields(fallbackPhrases, 'fallback-phrase') as EnglishPhrase[],
  );
  return selectMultipleByDate(pool, limit, currentDate, 2);
};

export const getListeningTexts = async (limit: number = 2, date?: string): Promise<EnglishListening[]> => {
  const currentDate = date || getBeijingDateString();
  const pool = await fetchPool<EnglishListening>(
    'english_listening',
    withGeneratedFields(fallbackListening, 'fallback-listening') as EnglishListening[],
  );
  return selectMultipleByDate(pool, limit, currentDate, 3);
};

// 获取指定日期的每日英语内容
export const getDailyEnglishContent = async (date: string) => {
  const [quote, words, phrases, listening] = await Promise.all([
    getRandomQuote(date),
    getRandomWords(3, date),
    getRandomPhrases(3, date),
    getListeningTexts(2, date),
  ]);

  return { quote, words, phrases, listening, date };
};

// ---- 管理后台 CRUD ----
// 面向内容管理页：返回真实 DB 行、按 created_at 倒序、失败即 throw（区别于上面的每日轮换取数逻辑）。

// 名言
export const getAllQuotes = async (): Promise<EnglishQuote[]> => {
  const { data, error } = await supabase
    .from('english_quotes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createQuote = async (input: TablesInsert<'english_quotes'>): Promise<void> => {
  const { error } = await supabase.from('english_quotes').insert(input);
  if (error) throw error;
};

export const updateQuote = async (id: string, input: TablesUpdate<'english_quotes'>): Promise<void> => {
  const { error } = await supabase.from('english_quotes').update(input).eq('id', id);
  if (error) throw error;
};

export const deleteQuote = async (id: string): Promise<void> => {
  const { error } = await supabase.from('english_quotes').delete().eq('id', id);
  if (error) throw error;
};

// 单词
export const getAllWords = async (): Promise<EnglishWord[]> => {
  const { data, error } = await supabase
    .from('english_words')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createWord = async (input: TablesInsert<'english_words'>): Promise<void> => {
  const { error } = await supabase.from('english_words').insert(input);
  if (error) throw error;
};

export const updateWord = async (id: string, input: TablesUpdate<'english_words'>): Promise<void> => {
  const { error } = await supabase.from('english_words').update(input).eq('id', id);
  if (error) throw error;
};

export const deleteWord = async (id: string): Promise<void> => {
  const { error } = await supabase.from('english_words').delete().eq('id', id);
  if (error) throw error;
};

// 短语
export const getAllPhrases = async (): Promise<EnglishPhrase[]> => {
  const { data, error } = await supabase
    .from('english_phrases')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createPhrase = async (input: TablesInsert<'english_phrases'>): Promise<void> => {
  const { error } = await supabase.from('english_phrases').insert(input);
  if (error) throw error;
};

export const updatePhrase = async (id: string, input: TablesUpdate<'english_phrases'>): Promise<void> => {
  const { error } = await supabase.from('english_phrases').update(input).eq('id', id);
  if (error) throw error;
};

export const deletePhrase = async (id: string): Promise<void> => {
  const { error } = await supabase.from('english_phrases').delete().eq('id', id);
  if (error) throw error;
};

// 听力
export const getAllListening = async (): Promise<EnglishListening[]> => {
  const { data, error } = await supabase
    .from('english_listening')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createListening = async (input: TablesInsert<'english_listening'>): Promise<void> => {
  const { error } = await supabase.from('english_listening').insert(input);
  if (error) throw error;
};

export const updateListening = async (id: string, input: TablesUpdate<'english_listening'>): Promise<void> => {
  const { error } = await supabase.from('english_listening').update(input).eq('id', id);
  if (error) throw error;
};

export const deleteListening = async (id: string): Promise<void> => {
  const { error } = await supabase.from('english_listening').delete().eq('id', id);
  if (error) throw error;
};
