
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Sparkles, Wrench, Bug } from 'lucide-react';
import { updateLogs } from '@/data/updateLogs';
import PageLayout from '@/components/layout/PageLayout';

interface UpdateLogsProps {
  onBack: () => void;
}

const UpdateLogs = ({ onBack }: UpdateLogsProps) => {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'new':
        return <Sparkles className="h-4 w-4 text-green-600" />;
      case 'improved':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'fixed':
        return <Bug className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'new':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'improved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fixed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangeText = (type: string) => {
    switch (type) {
      case 'new':
        return '新功能';
      case 'improved':
        return '优化';
      case 'fixed':
        return '修复';
      default:
        return '更新';
    }
  };

  return (
    <PageLayout title="更新日志" onBack={onBack}>
      <ScrollArea className="h-[70vh]">
        <div className="space-y-4">
          {updateLogs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {log.title}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {log.version}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {log.date}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {log.changes.map((change, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getChangeIcon(change.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getChangeColor(change.type)}`}
                          >
                            {getChangeText(change.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {change.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-center text-sm text-blue-700">
          <p className="font-medium mb-1">💡 持续改进中</p>
          <p>我们会根据用户反馈不断优化产品体验</p>
          <p>如有建议或问题，欢迎随时联系开发者</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default UpdateLogs;
