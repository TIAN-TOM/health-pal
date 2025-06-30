
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Volume2, VolumeX, Award, Lightbulb, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import DailyQuote from '@/components/DailyQuote';

interface DailyEnglishProps {
  onBack: () => void;
}

interface EnglishWord {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  translation: string;
}

const DailyEnglish = ({ onBack }: DailyEnglishProps) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('english-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [dailyWords] = useState<EnglishWord[]>([
    {
      word: "Perseverance",
      pronunciation: "/ˌpɜːrsəˈvɪrəns/",
      meaning: "坚持不懈；毅力",
      example: "Success is the result of perseverance and hard work.",
      translation: "成功是坚持不懈和努力工作的结果。"
    },
    {
      word: "Courage",
      pronunciation: "/ˈkɜːrɪdʒ/",
      meaning: "勇气；胆量",
      example: "It takes courage to admit your mistakes.",
      translation: "承认错误需要勇气。"
    },
    {
      word: "Wisdom",
      pronunciation: "/ˈwɪzdəm/",
      meaning: "智慧；明智",
      example: "True wisdom comes from experience.",
      translation: "真正的智慧来自于经验。"
    }
  ]);

  const [phrases] = useState([
    {
      english: "Every cloud has a silver lining.",
      chinese: "乌云背后总有一线阳光。",
      meaning: "困难中总有希望。"
    },
    {
      english: "Actions speak louder than words.",
      chinese: "行动胜过言语。",
      meaning: "实际行动比空话更有说服力。"
    },
    {
      english: "Rome wasn't built in a day.",
      chinese: "罗马不是一天建成的。",
      meaning: "成功需要时间和耐心。"
    }
  ]);

  const [listeningTexts] = useState([
    {
      title: "Daily Conversation",
      text: "Good morning! How are you today? I'm doing well, thank you for asking.",
      translation: "早上好！你今天怎么样？我很好，谢谢你的关心。",
      level: "初级"
    },
    {
      title: "Health Discussion",
      text: "Regular exercise and a balanced diet are essential for maintaining good health.",
      translation: "规律运动和均衡饮食对保持健康至关重要。",
      level: "中级"
    }
  ]);

  const playSound = (text: string) => {
    if (!soundEnabled) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('english-sound-enabled', JSON.stringify(enabled));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">每日英语</h1>
          <div className="flex items-center gap-2">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <Switch
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </div>

        <Tabs defaultValue="quotes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quotes">名言</TabsTrigger>
            <TabsTrigger value="words">单词</TabsTrigger>
            <TabsTrigger value="phrases">短语</TabsTrigger>
            <TabsTrigger value="listening">听力</TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="h-5 w-5 mr-2 text-blue-600" />
                  每日名言
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DailyQuote />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="words" className="space-y-4">
            {dailyWords.map((word, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-blue-600">{word.word}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playSound(word.word)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{word.pronunciation}</p>
                    <p className="font-medium">{word.meaning}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm italic mb-2">{word.example}</p>
                      <p className="text-sm text-gray-700">{word.translation}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => playSound(word.example)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        朗读例句
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="phrases" className="space-y-4">
            {phrases.map((phrase, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-green-600">{phrase.english}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playSound(phrase.english)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-800">{phrase.chinese}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      <span>{phrase.meaning}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="listening" className="space-y-4">
            {listeningTexts.map((text, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{text.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {text.level}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">英文原文：</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playSound(text.text)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-800">{text.text}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-2">中文翻译：</p>
                    <p className="text-gray-700">{text.translation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Globe className="h-5 w-5 text-blue-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">学习提示</h3>
              <p className="text-blue-700 text-sm">
                每天坚持学习英语，积少成多。建议结合朗读、听力和记忆练习，提高学习效果。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyEnglish;
