
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface QuoteData {
  text: string;
  english: string;
  author: string;
}

const DailyQuote = () => {
  const [quote, setQuote] = useState<QuoteData | null>(null);

  const quotes: QuoteData[] = [
    {
      text: "健康不是一切，但没有健康就没有一切。",
      english: "Health is not everything, but without health, everything is nothing.",
      author: "叔本华 (Schopenhauer)"
    },
    {
      text: "保持身体健康是一种义务，否则我们无法保持思想的清晰和坚强。",
      english: "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.",
      author: "佛陀 (Buddha)"
    },
    {
      text: "早睡早起使人健康、富有、明智。",
      english: "Early to bed and early to rise makes a man healthy, wealthy, and wise.",
      author: "本杰明·富兰克林 (Benjamin Franklin)"
    },
    {
      text: "快乐的心是最好的药。",
      english: "A merry heart doeth good like a medicine.",
      author: "《圣经》箴言 (Proverbs)"
    },
    {
      text: "身体是心灵的殿堂，要保持它的清洁和健康。",
      english: "The body is the temple of the soul. Keep it clean and healthy.",
      author: "印度谚语 (Indian Proverb)"
    },
    {
      text: "最好的医生是你自己，最好的药物是时间，最好的心情是宁静。",
      english: "The best doctor is yourself, the best medicine is time, and the best mood is tranquility.",
      author: "中国谚语 (Chinese Proverb)"
    },
    {
      text: "健康是智慧的条件，是愉快的标志。",
      english: "Health is a condition of wisdom, and a sign of happiness.",
      author: "爱默生 (Ralph Waldo Emerson)"
    },
    {
      text: "一个健康的身体是灵魂的客厅，一个病弱的身体是灵魂的监狱。",
      english: "A healthy body is a guest chamber for the soul; a sick body is a prison.",
      author: "弗朗西斯·培根 (Francis Bacon)"
    },
    {
      text: "治疗疾病的最好方法是预防。",
      english: "The best way to cure a disease is to prevent it.",
      author: "希波克拉底 (Hippocrates)"
    },
    {
      text: "积极的心态是健康的良药。",
      english: "A positive attitude is good medicine for health.",
      author: "现代格言 (Modern Saying)"
    }
  ];

  useEffect(() => {
    // 根据当天日期选择名言，确保每天都是同一条
    const today = new Date().toDateString();
    const stored = localStorage.getItem('dailyQuote');
    const storedData = stored ? JSON.parse(stored) : null;

    if (storedData && storedData.date === today) {
      setQuote(storedData.quote);
    } else {
      // 使用日期作为种子生成伪随机数，确保每天显示固定的名言
      const dateSum = today.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const randomIndex = dateSum % quotes.length;
      const selectedQuote = quotes[randomIndex];
      
      setQuote(selectedQuote);
      localStorage.setItem('dailyQuote', JSON.stringify({
        date: today,
        quote: selectedQuote
      }));
    }
  }, []);

  if (!quote) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Quote className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="text-gray-800 text-lg leading-relaxed mb-2 font-medium">
              {quote.text}
            </div>
            <div className="text-gray-600 text-base leading-relaxed mb-3 italic">
              {quote.english}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              — {quote.author}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
