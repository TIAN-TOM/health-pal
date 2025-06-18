
import React from 'react';
import { QuoteData } from '@/data/quotes';

interface QuoteContentProps {
  quote: QuoteData;
  isAnimating: boolean;
}

const QuoteContent = ({ quote, isAnimating }: QuoteContentProps) => {
  return (
    <div className={`transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
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
  );
};

export default QuoteContent;
