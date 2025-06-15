
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmergencyModeProps {
  onBack: () => void;
}

const EmergencyMode = ({ onBack }: EmergencyModeProps) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [audioType, setAudioType] = useState<'white-noise' | 'nature' | 'breathing'>('white-noise');

  // 紧急联系人示例数据
  const emergencyContacts = [
    { name: '老伴', phone: '138****8888', avatar: '👵' },
    { name: '儿子', phone: '139****9999', avatar: '👨' },
    { name: '女儿', phone: '136****6666', avatar: '👩' }
  ];

  const handleCall = (phone: string, name: string) => {
    // 在真实环境中会调用电话功能
    console.log(`正在呼叫 ${name}: ${phone}`);
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = `tel:${phone}`;
    }
  };

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const changeAudio = () => {
    const types: Array<'white-noise' | 'nature' | 'breathing'> = ['white-noise', 'nature', 'breathing'];
    const currentIndex = types.indexOf(audioType);
    const nextIndex = (currentIndex + 1) % types.length;
    setAudioType(types[nextIndex]);
  };

  const getAudioLabel = () => {
    switch (audioType) {
      case 'white-noise': return '白噪音';
      case 'nature': return '自然声';
      case 'breathing': return '呼吸引导';
      default: return '白噪音';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回
        </Button>
      </div>

      {/* 应急指南 */}
      <Card className="mb-8 bg-white shadow-lg">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            紧急应对指南
          </h2>
          <div className="space-y-4 text-xl leading-relaxed">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-3xl mr-4 text-blue-600 font-bold">1.</span>
              <span className="text-gray-800">立即坐下或躺好，不要站立</span>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <span className="text-3xl mr-4 text-green-600 font-bold">2.</span>
              <span className="text-gray-800">眼睛盯着一个固定点</span>
            </div>
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-3xl mr-4 text-purple-600 font-bold">3.</span>
              <span className="text-gray-800">慢慢深呼吸，保持冷静</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 舒缓音频控制 */}
      <Card className="mb-8 bg-white shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
            舒缓音频
          </h3>
          <div className="text-center space-y-4">
            <div className="text-lg text-gray-600">
              正在播放: {getAudioLabel()}
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={toggleAudio}
                className={`px-8 py-4 text-lg ${
                  isAudioPlaying 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isAudioPlaying ? (
                  <>
                    <VolumeX className="mr-2 h-5 w-5" />
                    暂停音频
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-5 w-5" />
                    播放音频
                  </>
                )}
              </Button>
              <Button
                onClick={changeAudio}
                variant="outline"
                className="px-8 py-4 text-lg"
              >
                换个声音
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 紧急联系人 */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
            呼叫家人
          </h3>
          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <Button
                key={index}
                onClick={() => handleCall(contact.phone, contact.name)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-6 rounded-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">{contact.avatar}</span>
                  <Phone className="mr-3 h-5 w-5" />
                  <div className="text-center">
                    <div>呼叫{contact.name}</div>
                    <div className="text-sm opacity-90">{contact.phone}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyMode;
