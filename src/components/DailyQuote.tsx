
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { QuoteData } from '@/data/quotes';
import { selectDailyQuotes } from '@/utils/quoteUtils';
import QuoteContent from '@/components/quote/QuoteContent';
import QuoteNavigation from '@/components/quote/QuoteNavigation';

const DailyQuote = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dailyQuotes, setDailyQuotes] = useState<QuoteData[]>([]);

  // 初始化时选择今日的5句名言
  useEffect(() => {
    const todayQuotes = selectDailyQuotes(5);
    setDailyQuotes(todayQuotes);
  }, []);

  // 20秒自动切换
  useEffect(() => {
    if (dailyQuotes.length === 0) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 20000);

    return () => clearInterval(interval);
  }, [dailyQuotes]);

  const handleNext = () => {
    if (isAnimating || dailyQuotes.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % dailyQuotes.length);
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevious = () => {
    if (isAnimating || dailyQuotes.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev === 0 ? dailyQuotes.length - 1 : prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  // 如果还没有选择完成今日名言，显示加载状态
  if (dailyQuotes.length === 0) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Quote className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuote = dailyQuotes[currentIndex];

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Quote className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <QuoteContent quote={currentQuote} isAnimating={isAnimating} />
            <div className="flex justify-end mt-2">
              <QuoteNavigation
                currentIndex={currentIndex}
                totalQuotes={dailyQuotes.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                isAnimating={isAnimating}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
