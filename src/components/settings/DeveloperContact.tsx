
import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DeveloperContact = () => {
  const handleContactDeveloper = () => {
    const email = 'tomtianys@163.com';
    const subject = '梅尼埃症生活伴侣 - 用户反馈';
    const body = '您好，我想对应用提供以下反馈：\n\n（请在此处描述您的问题或建议）';
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          反馈与支持
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleContactDeveloper}
          variant="outline"
          className="w-full justify-start"
        >
          <Mail className="h-4 w-4 mr-2" />
          联系开发者反馈
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          如有问题或建议，请发送邮件至 tomtianys@163.com
        </p>
      </CardContent>
    </Card>
  );
};

export default DeveloperContact;
