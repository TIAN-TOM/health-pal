
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clipboard, 
  BarChart3, 
  Calendar,
  FileText,
  Gamepad2,
  Wind,
  Award
} from 'lucide-react';

interface FunctionCardsProps {
  onNavigate: (page: string) => void;
}

const FunctionCards = ({ onNavigate }: FunctionCardsProps) => {
  const functionCards = [
    {
      title: "记录中心",
      description: "健康数据记录",
      icon: Clipboard,
      color: "from-blue-500 to-blue-600",
      onClick: () => onNavigate("record-hub")
    },
    {
      title: "数据总览",
      description: "查看历史记录",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      onClick: () => onNavigate("daily-data")
    },
    {
      title: "日历视图",
      description: "时间线查看",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      onClick: () => onNavigate("calendar")
    },
    {
      title: "数据导出",
      description: "导出健康数据",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      onClick: () => onNavigate("export")
    },
    {
      title: "休闲游戏",
      description: "放松身心",
      icon: Gamepad2,
      color: "from-pink-500 to-pink-600",
      onClick: () => onNavigate("games")
    },
    {
      title: "呼吸练习",
      description: "缓解压力",
      icon: Wind,
      color: "from-cyan-500 to-cyan-600",
      onClick: () => onNavigate("breathing")
    },
    {
      title: "我的徽章",
      description: "查看成就徽章",
      icon: Award,
      color: "from-yellow-500 to-yellow-600",
      onClick: () => onNavigate("badges")
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {functionCards.map((card, index) => (
        <Card
          key={index}
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
          onClick={card.onClick}
        >
          <CardContent className="p-4 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${card.color} flex items-center justify-center`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-medium text-gray-800 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FunctionCards;
