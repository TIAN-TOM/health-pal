import React from 'react';
import { ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updates, getTypeColor, getTypeText } from '@/data/updateLog';

interface UpdateLogProps {
  onBack: () => void;
  source?: string;
}

const UpdateLog = ({ onBack }: UpdateLogProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            📝 更新日志
          </h1>
          <div className="w-16" />
        </div>

        {/* 更新列表 */}
        <div className="space-y-6">
          {updates.map((update) => {
            const IconComponent = update.icon;
            return (
              <Card key={update.version} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${update.color} border`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">版本 {update.version}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="secondary" className={update.color}>
                      {update.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {update.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100"
                      >
                        <div className="flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getTypeColor(item.type)}`}
                          >
                            {getTypeText(item.type)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border">
            <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">
              持续优化中，感谢您的使用和反馈！
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLog;
