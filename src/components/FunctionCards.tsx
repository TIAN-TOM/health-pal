
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Home, Pill } from 'lucide-react';

interface FunctionCardsProps {
  onNavigate: (view: string) => void;
}

const FunctionCards = ({ onNavigate }: FunctionCardsProps) => {
  const cards = [
    {
      id: 'dizziness-record',
      title: '眩晕记录',
      description: '记录眩晕发作情况',
      icon: Activity,
      bgColor: 'bg-red-50 hover:bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    {
      id: 'lifestyle-record',
      title: '生活记录',
      description: '记录饮食睡眠压力',
      icon: Home,
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      id: 'medication-record',
      title: '用药记录',
      description: '记录药物服用情况',
      icon: Pill,
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={card.id}
            className={`${card.bgColor} ${card.borderColor} border cursor-pointer transition-all duration-200 hover:scale-105`}
            onClick={() => onNavigate(card.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                  <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <h3 className="font-medium text-gray-800 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FunctionCards;
