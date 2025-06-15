
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
  const [isAnimating, setIsAnimating] = useState(false);

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
      text: "治疗最佳方法是预防。",
      english: "The best way to cure is to prevent.",
      author: "希波克拉底 (Hippocrates)"
    },
    {
      text: "积极的心态是健康的良药。",
      english: "A positive attitude is good medicine for health.",
      author: "现代格言 (Modern Saying)"
    }
  ];

  // 20秒自动切换
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % quotes.length);
      setIsAnimating(false);
    }, 150);
  };

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev === 0 ? quotes.length - 1 : prev - 1);
      setIsAnimating(false);
    }, 150);
  };

  const currentQuote = quotes[currentIndex];

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Quote className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
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
                    onClick={handlePrevious}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                    disabled={isAnimating}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-500">
                    {currentIndex + 1}/{quotes.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                    disabled={isAnimating}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
