
import React from 'react';
import { ExternalLink, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantSectionProps {
  exportedData?: string;
}

const AIAssistantSection = ({ exportedData }: AIAssistantSectionProps) => {
  const { toast } = useToast();

  const generateAIPrompt = () => {
    const promptText = `我想请您分析我的健康记录数据，帮我找出症状规律、可能的诱发因素和改善建议。请从以下几个方面进行分析：

1. 症状发作规律和频率
2. 可能的诱发因素
3. 生活方式对健康的影响
4. 改善建议和预防措施

以下是我的健康记录数据：

${exportedData || '请先导出数据，然后复制完整内容'}`;

    return promptText;
  };

  const handleCopyAIPrompt = async () => {
    if (!exportedData) {
      toast({
        title: "请先导出数据",
        description: "需要先导出健康记录数据才能生成AI分析提示词",
        variant: "destructive",
      });
      return;
    }

    const promptText = generateAIPrompt();
    
    try {
      await navigator.clipboard.writeText(promptText);
      toast({
        title: "提示词已复制",
        description: "请粘贴到AI聊天界面进行健康分析",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制下方文本内容",
        variant: "destructive",
      });
    }
  };

  const handleDeepSeekAI = () => {
    window.open('https://chat.deepseek.com/', '_blank');
    toast({
      title: "已打开DeepSeek AI",
      description: "请先复制AI分析提示词，然后粘贴到聊天界面",
    });
  };

  const handleDoubaoAI = () => {
    window.open('https://www.doubao.com/chat/', '_blank');
    toast({
      title: "已打开豆包AI",
      description: "请先复制AI分析提示词，然后粘贴到聊天界面",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Copy className="h-5 w-5 mr-2" />
            AI健康分析助手
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleCopyAIPrompt}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4"
            disabled={!exportedData}
          >
            <Copy className="h-4 w-4 mr-2" />
            复制AI分析提示词
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleDeepSeekAI}
              variant="outline"
              className="bg-purple-50 hover:bg-purple-100 border-purple-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              DeepSeek AI
            </Button>
            
            <Button
              onClick={handleDoubaoAI}
              variant="outline"
              className="bg-orange-50 hover:bg-orange-100 border-orange-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              豆包AI
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            1. 先点击"复制AI分析提示词"复制完整分析请求
            <br />
            2. 再点击AI平台链接打开对话界面
            <br />
            3. 粘贴内容即可获得专业健康分析
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>就医前：</strong>复制纯文本格式，便于医生快速了解健康状况</p>
            <p><strong>AI分析：</strong>使用上方AI分析提示词，获得专业的健康数据解读</p>
            <p><strong>家人分享：</strong>复制简洁格式，便于家人了解您的健康状况</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AIAssistantSection;
