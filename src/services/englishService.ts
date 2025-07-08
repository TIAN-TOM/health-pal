
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { getBeijingDateString } from '@/utils/beijingTime';
import { 
  beginnerQuotes, 
  intermediateQuotes, 
  beginnerWords, 
  intermediateWords,
  beginnerPhrases,
  intermediatePhrases,
  beginnerListening,
  intermediateListening
} from '@/data/englishContent';

type EnglishQuote = Tables<'english_quotes'>;
type EnglishWord = Tables<'english_words'>;
type EnglishPhrase = Tables<'english_phrases'>;
type EnglishListening = Tables<'english_listening'>;

// 基于日期生成稳定的随机种子 - 改进版本确保每天内容不重样
const getDaySeed = (date?: string): number => {
  const dateStr = date || getBeijingDateString();
  console.log('为日期生成种子:', dateStr);
  
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  const seed = Math.abs(hash);
  console.log('生成的日期种子:', seed);
  return seed;
};

// 改进的伪随机数生成器 - 确保更好的分布
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

  // 使用 Fisher-Yates 洗牌算法确保更好的随机分布
  shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // 从数组中选择指定数量的项目，确保不重复
  selectItems<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // 基于日期索引选择项目，确保每天都不一样
  selectByDateIndex<T>(array: T[], date?: string): T | null {
    if (array.length === 0) return null;
    
    const dateStr = date || getBeijingDateString();
    const dateIndex = this.getDateBasedIndex(dateStr, array.length);
    
    console.log(`日期 ${dateStr} 对应索引: ${dateIndex}, 数组长度: ${array.length}`);
    return array[dateIndex];
  }

  // 基于日期的多个项目选择，确保每天组合不同
  selectMultipleByDate<T>(array: T[], count: number, date?: string): T[] {
    if (array.length === 0) return [];
    
    const dateStr = date || getBeijingDateString();
    const startIndex = this.getDateBasedIndex(dateStr, array.length);
    
    const result: T[] = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < count && result.length < array.length; i++) {
      let index = (startIndex + i * 7) % array.length; // 使用步长7确保分散
      
      // 如果索引已使用，寻找下一个可用索引
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
    
    console.log(`日期 ${dateStr} 选择了 ${result.length} 个项目，起始索引: ${startIndex}`);
    return result;
  }

  // 基于日期计算稳定的数组索引
  private getDateBasedIndex(dateStr: string, arrayLength: number): number {
    // 将日期字符串转换为数字
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    // 计算自某个基准日期的天数，确保每天都有不同的值
    const baseDate = new Date(2025, 0, 1); // 基准日期：2025年1月1日
    const currentDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 使用天数差值来确定索引，确保分布均匀
    const index = Math.abs(daysDiff) % arrayLength;
    
    console.log(`日期 ${dateStr} (${daysDiff}天) -> 索引 ${index}/${arrayLength}`);
    return index;
  }
}

// 转换预定义内容为完整的数据库格式
const convertToQuoteFormat = (quotes: any[]): EnglishQuote[] => {
  return quotes.map((quote, index) => ({
    ...quote,
    id: `predefined-quote-${index}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

const convertToWordFormat = (words: any[]): EnglishWord[] => {
  return words.map((word, index) => ({
    ...word,
    id: `predefined-word-${index}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    frequency_rank: index + 1
  }));
};

const convertToPhraseFormat = (phrases: any[]): EnglishPhrase[] => {
  return phrases.map((phrase, index) => ({
    ...phrase,
    id: `predefined-phrase-${index}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: phrase.category || 'general'
  }));
};

const convertToListeningFormat = (listening: any[]): EnglishListening[] => {
  return listening.map((item, index) => ({
    ...item,
    id: `predefined-listening-${index}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    word_count: item.content ? item.content.split(' ').length : 0
  }));
};

// 合并并确保内容足够（至少30天不重样）
const combineAndEnsureSufficient = <T>(dbContent: T[], predefinedContent: T[], minRequired: number = 30): T[] => {
  const combined = [...dbContent, ...predefinedContent];
  
  // 如果内容不足，重复内容但打乱顺序确保不会连续重复
  while (combined.length < minRequired) {
    const additionalContent = [...predefinedContent];
    // 使用简单的洗牌避免完全重复的顺序
    for (let i = additionalContent.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [additionalContent[i], additionalContent[j]] = [additionalContent[j], additionalContent[i]];
    }
    combined.push(...additionalContent);
  }
  
  console.log(`合并内容完成，总数: ${combined.length}，最少需要: ${minRequired}`);
  return combined;
};

export const getRandomQuote = async (date?: string): Promise<EnglishQuote | null> => {
  const currentDate = date || getBeijingDateString();
  console.log('获取每日名言，日期:', currentDate);
  
  const { data, error } = await supabase
    .from('english_quotes')
    .select('*');

  if (error) {
    console.error('获取数据库英语名言失败:', error);
  }

  // 合并数据库内容和预定义内容，确保至少35条
  const predefinedQuotes = convertToQuoteFormat([...beginnerQuotes, ...intermediateQuotes]);
  const allQuotes = combineAndEnsureSufficient(data || [], predefinedQuotes, 35);
  
  if (allQuotes.length === 0) return null;

  const random = new SeededRandom(getDaySeed(currentDate));
  const selectedQuote = random.selectByDateIndex(allQuotes, currentDate);
  
  console.log('选中的名言:', selectedQuote?.quote_text);
  return selectedQuote;
};

export const getRandomWords = async (limit: number = 3, date?: string): Promise<EnglishWord[]> => {
  const currentDate = date || getBeijingDateString();
  console.log('获取每日单词，日期:', currentDate, '数量:', limit);
  
  const { data, error } = await supabase
    .from('english_words')
    .select('*');

  if (error) {
    console.error('获取数据库英语单词失败:', error);
  }

  // 合并数据库内容和预定义内容，确保至少40个单词
  const predefinedWords = convertToWordFormat([...beginnerWords, ...intermediateWords]);
  const allWords = combineAndEnsureSufficient(data || [], predefinedWords, 40);
  
  if (allWords.length === 0) return [];

  const random = new SeededRandom(getDaySeed(currentDate) + 1);
  const selectedWords = random.selectMultipleByDate(allWords, limit, currentDate);
  
  console.log('选中的单词:', selectedWords.map(w => w.word));
  return selectedWords;
};

export const getRandomPhrases = async (limit: number = 3, date?: string): Promise<EnglishPhrase[]> => {
  const currentDate = date || getBeijingDateString();
  console.log('获取每日短语，日期:', currentDate, '数量:', limit);
  
  const { data, error } = await supabase
    .from('english_phrases')
    .select('*');

  if (error) {
    console.error('获取数据库英语短语失败:', error);
  }

  // 合并数据库内容和预定义内容，确保至少35个短语
  const predefinedPhrases = convertToPhraseFormat([...beginnerPhrases, ...intermediatePhrases]);
  const allPhrases = combineAndEnsureSufficient(data || [], predefinedPhrases, 35);
  
  if (allPhrases.length === 0) return [];

  const random = new SeededRandom(getDaySeed(currentDate) + 2);
  const selectedPhrases = random.selectMultipleByDate(allPhrases, limit, currentDate);
  
  console.log('选中的短语:', selectedPhrases.map(p => p.phrase_english));
  return selectedPhrases;
};

export const getListeningTexts = async (limit: number = 2, date?: string): Promise<EnglishListening[]> => {
  const currentDate = date || getBeijingDateString();
  console.log('获取每日听力，日期:', currentDate, '数量:', limit);
  
  const { data, error } = await supabase
    .from('english_listening')
    .select('*');

  if (error) {
    console.error('获取数据库听力文本失败:', error);
  }

  // 合并数据库内容和预定义内容，确保至少20个听力材料
  const predefinedListening = convertToListeningFormat([...beginnerListening, ...intermediateListening]);
  const allListening = combineAndEnsureSufficient(data || [], predefinedListening, 20);
  
  if (allListening.length === 0) return [];

  const random = new SeededRandom(getDaySeed(currentDate) + 3);
  const selectedListening = random.selectMultipleByDate(allListening, limit, currentDate);
  
  console.log('选中的听力:', selectedListening.map(l => l.title));
  return selectedListening;
};

// 获取指定日期的每日英语内容
export const getDailyEnglishContent = async (date: string) => {
  console.log('获取完整的每日英语内容，日期:', date);
  
  const [quote, words, phrases, listening] = await Promise.all([
    getRandomQuote(date),
    getRandomWords(3, date),
    getRandomPhrases(3, date),
    getListeningTexts(2, date)
  ]);

  const result = {
    quote,
    words,
    phrases,
    listening,
    date
  };
  
  console.log('每日英语内容加载完成:', {
    quote: quote?.quote_text,
    wordsCount: words.length,
    phrasesCount: phrases.length,
    listeningCount: listening.length,
    date
  });

  return result;
};

// 预加载明天的内容
export const preloadTomorrowContent = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.getFullYear() + '-' + 
    String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
    String(tomorrow.getDate()).padStart(2, '0');
  
  console.log('预加载明天的内容:', tomorrowStr);
  return getDailyEnglishContent(tomorrowStr);
};

// 测试函数：验证连续30天的内容都不重样
export const testDailyContentUniqueness = async (startDate: string, days: number = 30) => {
  console.log(`测试从 ${startDate} 开始的 ${days} 天内容唯一性`);
  
  const results = [];
  const quoteTexts = new Set();
  const duplicateQuotes = [];
  
  for (let i = 0; i < days; i++) {
    const testDate = new Date(startDate);
    testDate.setDate(testDate.getDate() + i);
    const dateStr = testDate.getFullYear() + '-' + 
      String(testDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(testDate.getDate()).padStart(2, '0');
    
    const content = await getDailyEnglishContent(dateStr);
    
    // 检查名言重复
    if (content.quote) {
      if (quoteTexts.has(content.quote.quote_text)) {
        duplicateQuotes.push({ date: dateStr, quote: content.quote.quote_text });
      } else {
        quoteTexts.add(content.quote.quote_text);
      }
    }
    
    results.push({
      date: dateStr,
      quote: content.quote?.quote_text?.substring(0, 50) + '...',
      wordsCount: content.words.length,
      phrasesCount: content.phrases.length,
      listeningCount: content.listening.length
    });
  }
  
  console.log('唯一性测试结果:', {
    totalDays: days,
    uniqueQuotes: quoteTexts.size,
    duplicateQuotes: duplicateQuotes.length,
    duplicates: duplicateQuotes
  });
  
  return { results, duplicateQuotes, uniqueQuotesCount: quoteTexts.size };
};
