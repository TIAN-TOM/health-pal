
import { QuoteData, allQuotes } from '@/data/quotes';

// 洗牌算法 - Fisher-Yates shuffle
export const shuffleArray = (array: QuoteData[]): QuoteData[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 从所有名言中随机选择指定数量的名言
export const selectDailyQuotes = (count: number = 5): QuoteData[] => {
  const shuffled = shuffleArray(allQuotes);
  return shuffled.slice(0, count);
};
