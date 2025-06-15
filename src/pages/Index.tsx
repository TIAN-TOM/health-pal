
import React, { useState } from 'react';
import { Heart, Phone, Menu, Download, Mic, AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EmergencyMode from '@/components/EmergencyMode';
import DizzinessRecord from '@/components/DizzinessRecord';
import LifestyleRecord from '@/components/LifestyleRecord';
import MedicationRecord from '@/components/MedicationRecord';
import VoiceRecord from '@/components/VoiceRecord';
import DataExport from '@/components/DataExport';
import Settings from '@/components/Settings';
import HistoryView from '@/components/HistoryView';

const Index = () => {
  const [currentView, setCurrentView] = useState<string>('home');

  const navigateTo = (view: string) => {
    setCurrentView(view);
  };

  const navigateHome = () => {
    setCurrentView('home');
  };

  if (currentView === 'emergency') {
    return <EmergencyMode onBack={navigateHome} />;
  }

  if (currentView === 'dizziness-record') {
    return <DizzinessRecord onBack={navigateHome} />;
  }

  if (currentView === 'lifestyle-record') {
    return <LifestyleRecord onBack={navigateHome} />;
  }

  if (currentView === 'medication-record') {
    return <MedicationRecord onBack={navigateHome} />;
  }

  if (currentView === 'voice-record') {
    return <VoiceRecord onBack={navigateHome} />;
  }

  if (currentView === 'data-export') {
    return <DataExport onBack={navigateHome} />;
  }

  if (currentView === 'settings') {
    return <Settings onBack={navigateHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 紧急求助横幅 */}
      <div className="bg-red-500 text-white p-4 shadow-lg">
        <Button
          onClick={() => navigateTo('emergency')}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <AlertCircle className="mr-3 h-6 w-6" />
          头晕不舒服，点这里
        </Button>
      </div>

      {/* 主页面内容 */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Heart className="mr-2 h-6 w-6 text-blue-600" />
              梅尼埃症生活伴侣
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('settings')}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-600 text-lg">
            记录症状，守护健康
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <Button
                onClick={() => navigateTo('dizziness-record')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-8 rounded-lg"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  记录眩晕症状
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <Button
                onClick={() => navigateTo('lifestyle-record')}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-medium py-8 rounded-lg"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                  记录饮食与作息
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <Button
                onClick={() => navigateTo('medication-record')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white text-lg font-medium py-8 rounded-lg"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  </div>
                  记录用药情况
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <Button
                onClick={() => navigateTo('voice-record')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-medium py-8 rounded-lg"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <Mic className="h-6 w-6 text-orange-600" />
                  </div>
                  语音记事
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 历史记录 */}
        <HistoryView />

        {/* 数据导出 */}
        <div className="mt-8">
          <Button
            onClick={() => navigateTo('data-export')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-medium py-6 rounded-lg"
          >
            <Download className="mr-3 h-5 w-5" />
            整理记录给医生/AI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
