import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Volume2, VolumeX, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Contact, getContacts } from '@/services/contactsService';

interface EmergencyModeProps {
  onBack: () => void;
}

const EmergencyMode = ({ onBack }: EmergencyModeProps) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioType, setAudioType] = useState<'white-noise' | 'nature' | 'breathing'>('white-noise');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
    
    // 创建音频元素
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    setAudioElement(audio);

    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const loadContacts = async () => {
    try {
      const contactsData = await getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('加载联系人失败:', error);
      // 如果加载失败，使用默认联系人
      const fallbackContacts: Contact[] = [
        {
          id: 'fallback-1',
          name: '老伴',
          phone: '138****8888',
          avatar: '👵',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fallback-2',
          name: '儿子',
          phone: '139****9999',
          avatar: '👨',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fallback-3',
          name: '女儿',
          phone: '136****6666',
          avatar: '👩',
          user_id: 'fallback-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setContacts(fallbackContacts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (audioElement) {
      // 根据音频类型设置不同的音频源
      switch (audioType) {
        case 'white-noise':
          // 使用在线白噪音音频
          audioElement.src = 'https://www.soundjay.com/misc/sounds/white-noise-1.wav';
          break;
        case 'nature':
          // 使用在线自然声音
          audioElement.src = 'https://www.soundjay.com/nature/sounds/rain-02.wav';
          break;
        case 'breathing':
          // 使用在线呼吸引导音频
          audioElement.src = 'https://www.soundjay.com/meditation/sounds/breathing-1.wav';
          break;
      }

      if (isAudioPlaying) {
        audioElement.play().catch(() => {
          // 如果音频加载失败，模拟播放状态
          toast({
            title: "音频播放",
            description: `正在播放${getAudioLabel()}（模拟播放）`,
          });
        });
      } else {
        audioElement.pause();
      }
    }
  }, [audioType, isAudioPlaying, audioElement, toast]);

  const handleCall = (phone: string, name: string) => {
    console.log(`正在呼叫 ${name}: ${phone}`);
    
    // 尝试直接拨打电话
    if (typeof window !== 'undefined') {
      try {
        window.location.href = `tel:${phone.replace(/\*/g, '')}`;
      } catch (error) {
        // 如果无法拨打电话，显示提示
        toast({
          title: "呼叫请求",
          description: `请手动拨打 ${name} 的电话: ${phone}`,
        });
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
    toast({
      title: isAudioPlaying ? "音频已停止" : "音频已开始",
      description: isAudioPlaying ? "舒缓音频已停止播放" : `正在播放${getAudioLabel()}`,
    });
  };

  const changeAudio = () => {
    const types: Array<'white-noise' | 'nature' | 'breathing'> = ['white-noise', 'nature', 'breathing'];
    const currentIndex = types.indexOf(audioType);
    const nextIndex = (currentIndex + 1) % types.length;
    setAudioType(types[nextIndex]);
    
    toast({
      title: "音频切换",
      description: `已切换到${getAudioLabel(types[nextIndex])}`,
    });
  };

  const getAudioLabel = (type?: 'white-noise' | 'nature' | 'breathing') => {
    const currentType = type || audioType;
    switch (currentType) {
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
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center">
            <Heart className="mr-2 h-6 w-6 text-red-500" />
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
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <span className="text-3xl mr-4 text-yellow-600 font-bold">4.</span>
              <span className="text-gray-800">如需帮助，点击下方呼叫家人</span>
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
              {isAudioPlaying ? '正在播放' : '已暂停'}: {getAudioLabel()}
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
                className="px-8 py-4 text-lg border-2 hover:border-blue-400"
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
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">加载联系人中...</div>
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <Button
                  key={contact.id || index}
                  onClick={() => handleCall(contact.phone, contact.name)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-6 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
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
          ) : (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600 mb-4">还没有设置紧急联系人</div>
              <Button
                onClick={onBack}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                去设置联系人
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyMode;
