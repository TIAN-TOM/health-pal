
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteNavigationProps {
  currentIndex: number;
  totalQuotes: number;
  onPrevious: () => void;
  onNext: () => void;
  isAnimating: boolean;
}

const QuoteNavigation = ({ 
  currentIndex, 
  totalQuotes, 
  onPrevious, 
  onNext, 
  isAnimating 
}: QuoteNavigationProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
        disabled={isAnimating}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs text-gray-500">
        {currentIndex + 1}/{totalQuotes}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
        disabled={isAnimating}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuoteNavigation;
