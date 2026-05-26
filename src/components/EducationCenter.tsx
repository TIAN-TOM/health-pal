
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Heart, Brain, Pill, Home, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EducationArticle, getEducationArticles } from '@/services/educationService';

interface EducationCenterProps {
  onBack: () => void;
}

const EducationCenter = ({ onBack }: EducationCenterProps) => {
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<EducationArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: '全部', icon: BookOpen, color: 'bg-gray-500' },
    { value: 'basics', label: '基础知识', icon: Brain, color: 'bg-blue-500' },
    { value: 'symptoms', label: '症状了解', icon: Heart, color: 'bg-red-500' },
    { value: 'treatment', label: '治疗方法', icon: Pill, color: 'bg-green-500' },
    { value: 'lifestyle', label: '生活调理', icon: Home, color: 'bg-orange-500' },
    { value: 'psychology', label: '心理支持', icon: Smile, color: 'bg-purple-500' }
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await getEducationArticles();
      setArticles(data);
    } catch (error) {
      console.error('加载科普文章失败:', error);
      toast({
        title: "加载失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="mb-6">
          <Button
            onClick={() => setSelectedArticle(null)}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回文章列表
          </Button>
        </div>

        <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${getCategoryInfo(selectedArticle.category).color}`}>
                  {getCategoryInfo(selectedArticle.category).label}
                </span>
              </div>
              <CardTitle className="text-2xl text-gray-800">
                {selectedArticle.title}
              </CardTitle>
              {selectedArticle.summary && (
                <p className="text-gray-600 mt-2">{selectedArticle.summary}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {selectedArticle.content}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  💡 温馨提示：本内容仅供参考，具体治疗方案请咨询专业医生。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
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

      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              科普与心理支持中心
            </CardTitle>
            <p className="text-center text-gray-600">
              科学了解，积极应对，关爱自己
            </p>
          </CardHeader>
          <CardContent>
            {/* 分类筛选 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                      selectedCategory === category.value 
                        ? `${category.color} text-white hover:opacity-90`
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* 文章列表 */}
            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无相关文章
                </div>
              ) : (
                filteredArticles.map((article) => {
                  const categoryInfo = getCategoryInfo(article.category);
                  const IconComponent = categoryInfo.icon;
                  
                  return (
                    <Card 
                      key={article.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-12 h-12 ${categoryInfo.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                              {article.title}
                            </h3>
                            {article.summary && (
                              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                {article.summary}
                              </p>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-white text-xs ${categoryInfo.color}`}>
                              {categoryInfo.label}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducationCenter;
