
import React from 'react';
import { Smile, FileText, Stethoscope, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClickSound } from '@/hooks/useClickSound';

interface FunctionCardsProps {
  onNavigate: (view: string, source?: string) => void;
}

const FunctionCards = ({ onNavigate }: FunctionCardsProps) => {
  const { playClickSound } = useClickSound();

  const handleNavigateWithSound = (view: string, source?: string) => {
    playClickSound();
    onNavigate(view, source);
  };

  return (
    <div className="grid gap-4 mb-8">
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <Button 
            onClick={() => handleNavigateWithSound('checkin', 'home')} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-medium py-8 rounded-lg min-h-[120px]"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Smile className="h-6 w-6 text-purple-600" />
              </div>
              <span className="leading-relaxed">每日打卡</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <Button 
            onClick={() => handleNavigateWithSound('record-hub', 'home')} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-8 rounded-lg min-h-[120px]"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="leading-relaxed">健康记录</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <Button 
            onClick={() => handleNavigateWithSound('medical-records', 'home')} 
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-medium py-8 rounded-lg min-h-[120px]"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <Stethoscope className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="leading-relaxed">医疗记录管理</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <Button 
            onClick={() => handleNavigateWithSound('games', 'home')} 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg font-medium py-8 rounded-lg min-h-[120px]"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Gamepad2 className="h-6 w-6 text-pink-600" />
              </div>
              <span className="leading-relaxed">解压小游戏</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionCards;
