
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  title?: string;
  onBack: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'narrow' | 'wide' | 'full';
}

const PageLayout = ({ title, onBack, children, className = "", size = 'narrow' }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <ResponsiveContainer size={size} className="!px-0 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回
        </Button>
      </ResponsiveContainer>

      <ResponsiveContainer size={size} className={cn('!px-0', className)}>
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-800">
              {title}
            </h1>
          </div>
        )}
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default PageLayout;

