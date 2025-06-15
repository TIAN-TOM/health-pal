
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteData {
  text: string;
  english: string;
  author: string;
}

const DailyQuote = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

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
    },
    {
      text: "生命在于运动。",
      english: "Life lies in movement.",
      author: "伏尔泰 (Voltaire)"
    },
    {
      text: "健康的身体是快乐生活的基础。",
      english: "A healthy body is the foundation of a happy life.",
      author: "现代格言 (Modern Saying)"
    },
    {
      text: "没有什么比健康更值得珍惜的了。",
      english: "Nothing is more precious than health.",
      author: "蒙田 (Montaigne)"
    },
    {
      text: "健康胜过财富。",
      english: "Health is better than wealth.",
      author: "英国谚语 (English Proverb)"
    },
    {
      text: "笑是最好的药物。",
      english: "Laughter is the best medicine.",
      author: "现代格言 (Modern Saying)"
    },
    {
      text: "健康的心灵寓于健康的身体。",
      english: "A sound mind in a sound body.",
      author: "古罗马格言 (Latin Proverb)"
    },
    {
      text: "平静的心境是健康长寿的秘诀。",
      english: "A peaceful mind is the secret to health and longevity.",
      author: "老子 (Lao Tzu)"
    },
    {
      text: "规律的生活是健康和长寿的源泉。",
      english: "Regular life is the source of health and longevity.",
      author: "现代医学 (Modern Medicine)"
    },
    {
      text: "饮食有节，起居有常，不妄作劳，故能形与神俱。",
      english: "Moderation in diet and regular habits lead to harmony of body and spirit.",
      author: "《黄帝内经》(Yellow Emperor's Classic)"
    },
    {
      text: "预防胜于治疗。",
      english: "Prevention is better than cure.",
      author: "德斯马雷·伊拉斯谟 (Desiderius Erasmus)"
    }
  ];

  // 20秒自动切换
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % quotes.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? quotes.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % quotes.length);
  };

  const currentQuote = quotes[currentIndex];

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Quote className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="text-gray-800 text-lg leading-relaxed mb-2 font-medium">
              {currentQuote.text}
            </div>
            <div className="text-gray-600 text-base leading-relaxed mb-3 italic">
              {currentQuote.english}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-blue-600 font-medium">
                — {currentQuote.author}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  {currentIndex + 1}/{quotes.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
