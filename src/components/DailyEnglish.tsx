import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Book, Volume2, VolumeX, Award, Lightbulb, Globe, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { notifyAdminActivity, ACTIVITY_TYPES, MODULE_NAMES } from '@/services/adminNotificationService';
import { getDailyEnglishContent } from '@/services/englishService';
import { getBeijingDateString, getBeijingTime } from '@/utils/beijingTime';

interface DailyEnglishProps {
  onBack: () => void;
}

const DailyEnglish = ({ onBack }: DailyEnglishProps) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('english-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentDate, setCurrentDate] = useState(getBeijingDateString());

  // 按日期缓存每日英语内容：缓存放在 QueryClientProvider 中，切换页面后依然有效
  const {
    data: content,
    isLoading: loading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['daily-english', currentDate],
    queryFn: () => getDailyEnglishContent(currentDate),
  });

  const dailyQuote = content?.quote ?? null;
  const dailyWords = content?.words ?? [];
  const phrases = content?.phrases ?? [];
  const listeningTexts = content?.listening ?? [];

  // 停止所有朗读的函数
  const stopAllSpeech = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    // 通知管理员用户开始学习英语
    notifyAdminActivity({
      activity_type: ACTIVITY_TYPES.LEARNING,
      activity_description: '开始学习每日英语',
      module_name: MODULE_NAMES.ENGLISH_LEARNING
    });

    // 页面卸载时停止朗读
    const handleBeforeUnload = () => {
      stopAllSpeech();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      stopAllSpeech();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // 设置更精确的时间检查 - 每分钟检查一次是否跨天
    // 跨天后 currentDate 变化，queryKey 随之变化，react-query 会自动加载新一天的内容
    const interval = setInterval(() => {
      const now = getBeijingDateString();
      if (now !== currentDate) {
        console.log(`检测到日期变化: ${currentDate} -> ${now}`);
        setCurrentDate(now);
      }
    }, 60000); // 每分钟检查一次

    return () => clearInterval(interval);
  }, [currentDate]);

  // 手动刷新内容
  const refreshContent = () => {
    console.log('手动刷新内容');
    refetch();
  };

  const playSound = (text: string) => {
    if (!soundEnabled) return;
    
    // 先停止当前播放的语音
    stopAllSpeech();
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
      
      // 通知管理员用户进行语音学习
      notifyAdminActivity({
        activity_type: ACTIVITY_TYPES.LEARNING,
        activity_description: '使用语音朗读功能学习英语',
        module_name: MODULE_NAMES.ENGLISH_LEARNING
      });
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('english-sound-enabled', JSON.stringify(enabled));
    if (!enabled) {
      stopAllSpeech();
    }
  };

  // 返回按钮处理，确保停止朗读
  const handleBack = () => {
    stopAllSpeech();
    onBack();
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载今日英语内容...</p>
          <p className="text-sm text-gray-600 mt-2">确保每天内容都不重样</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gray-600 mb-4">加载英语内容失败，请检查网络后重试</p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              重新加载
            </Button>
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isToday = currentDate === getBeijingDateString();
  const beijingTime = getBeijingTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">每日英语</h1>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {currentDate}
              {isToday && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">今日</span>}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              北京时间: {beijingTime.toLocaleTimeString('zh-CN', { hour12: false })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refreshContent} title="刷新内容">
              <RefreshCw className="h-4 w-4" />
            </Button>
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
                  <span className="text-sm text-gray-600 ml-2">(每日更新)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyQuote ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(dailyQuote.difficulty_level || 'intermediate')}`}>
                          {getDifficultyText(dailyQuote.difficulty_level || 'intermediate')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playSound(dailyQuote.quote_text)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <blockquote className="text-lg font-medium text-gray-800 mb-2">
                        "{dailyQuote.quote_text}"
                      </blockquote>
                      <p className="text-gray-700 mb-3">{dailyQuote.quote_translation}</p>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">
                          — {dailyQuote.author}
                          {dailyQuote.author_translation && (
                            <span className="text-gray-600 ml-1">({dailyQuote.author_translation})</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">暂无名言内容</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          

          <TabsContent value="words" className="space-y-4">
            {dailyWords.map((word, index) => (
              <Card key={`${word.id}-${currentDate}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-blue-600">{word.word}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(word.difficulty_level || 'intermediate')}`}>
                          {getDifficultyText(word.difficulty_level || 'intermediate')}
                        </span>
                      </div>
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
                      <p className="text-sm italic mb-2">{word.example_sentence}</p>
                      <p className="text-sm text-gray-700">{word.example_translation}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => playSound(word.example_sentence)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        朗读例句
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {dailyWords.length === 0 && (
              <p className="text-gray-600 text-center py-8">暂无单词内容</p>
            )}
          </TabsContent>

          <TabsContent value="phrases" className="space-y-4">
            {phrases.map((phrase, index) => (
              <Card key={`${phrase.id}-${currentDate}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-green-600">{phrase.phrase_english}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(phrase.difficulty_level || 'intermediate')}`}>
                          {getDifficultyText(phrase.difficulty_level || 'intermediate')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playSound(phrase.phrase_english)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-800">{phrase.phrase_chinese}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      <span>{phrase.meaning_explanation}</span>
                    </div>
                    {phrase.example_sentence && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm italic mb-1">{phrase.example_sentence}</p>
                        {phrase.example_translation && (
                          <p className="text-sm text-gray-700">{phrase.example_translation}</p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => playSound(phrase.example_sentence ?? '')}
                        >
                          <Volume2 className="h-3 w-3 mr-1" />
                          朗读例句
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {phrases.length === 0 && (
              <p className="text-gray-600 text-center py-8">暂无短语内容</p>
            )}
          </TabsContent>

          <TabsContent value="listening" className="space-y-4">
            {listeningTexts.map((text, index) => (
              <Card key={`${text.id}-${currentDate}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{text.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(text.difficulty_level || 'intermediate')}`}>
                      {getDifficultyText(text.difficulty_level || 'intermediate')}
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
                        onClick={() => playSound(text.content)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{text.content}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-2">中文翻译：</p>
                    <p className="text-gray-700">{text.translation}</p>
                  </div>
                  {text.estimated_duration && (
                    <div className="text-xs text-gray-600 text-center">
                      预计听力时长：{text.estimated_duration}秒
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {listeningTexts.length === 0 && (
              <p className="text-gray-600 text-center py-8">暂无听力内容</p>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Globe className="h-5 w-5 text-blue-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">学习提示</h3>
              <p className="text-blue-700 text-sm">
                每天学习内容根据北京时间精心安排，确保30天内不重样。涵盖名言、单词、短语和听力训练，坚持每日学习，积少成多！
              </p>
              <p className="text-blue-600 text-xs mt-2">
                内容会在每天0点（北京时间）自动更新
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyEnglish;
