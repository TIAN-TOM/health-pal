
import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const AIAssistantSection = () => {
  const { toast } = useToast();

  const handleDeepSeekAI = () => {
    const message = `我是梅尼埃症患者，想要分析我的症状记录。请帮我分析症状规律、诱发因素和治疗建议。我已经导出了记录文件，请告诉我如何更好地管理我的病情。`;
    
    // 使用移动端应用链接
    const deepSeekAppUrl = `deepseek://chat?message=${encodeURIComponent(message)}`;
    const deepSeekWebFallback = `https://chat.deepseek.com/?text=${encodeURIComponent(message)}`;
    
    // 尝试打开移动应用，失败则使用网页版
    window.location.href = deepSeekAppUrl;
    setTimeout(() => {
      window.open(deepSeekWebFallback, '_blank');
    }, 1000);
    
    toast({
      title: "已跳转到DeepSeek AI",
      description: "请将导出的记录数据粘贴给AI进行分析",
    });
  };

  const handleDoubaoAI = () => {
    const message = `我是梅尼埃症患者，想要分析我的症状记录。请帮我分析症状规律、诱发因素和治疗建议。我已经导出了记录数据，请告诉我如何更好地管理我的病情。`;
    
    // 使用移动端应用链接
    const doubaoAppUrl = `doubao://chat?message=${encodeURIComponent(message)}`;
    const doubaoWebFallback = `https://www.doubao.com/chat/?text=${encodeURIComponent(message)}`;
    
    // 尝试打开移动应用，失败则使用网页版
    window.location.href = doubaoAppUrl;
    setTimeout(() => {
      window.open(doubaoWebFallback, '_blank');
    }, 1000);
    
    toast({
      title: "已跳转到豆包AI",
      description: "请将导出的记录数据粘贴给AI进行分析",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ExternalLink className="h-5 w-5 mr-2" />
            AI健康助手咨询 (移动端优先)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleDeepSeekAI}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            DeepSeek AI 健康分析
          </Button>
          
          <Button
            onClick={handleDoubaoAI}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            豆包AI 健康分析
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            先复制上述格式的数据，再跳转到AI进行专业健康咨询分析
            <br />
            <span className="text-blue-600">优先打开移动应用，若无应用则打开网页版</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>就医前：</strong>复制纯文本格式，便于医生快速了解病情发展</p>
            <p><strong>AI分析：</strong>复制JSON格式给AI，便于深度分析症状规律和诱发因素</p>
            <p><strong>家人分享：</strong>复制纯文本格式，便于家人了解您的健康状况</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AIAssistantSection;
