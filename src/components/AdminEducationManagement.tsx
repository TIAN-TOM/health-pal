
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type EducationArticle = Tables<'education_articles'>;

interface ArticleForm {
  title: string;
  category: string;
  content: string;
  summary: string;
  reading_time: number;
}

const AdminEducationManagement = () => {
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<EducationArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    category: 'basics',
    content: '',
    summary: '',
    reading_time: 3
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'basics', label: '基础知识' },
    { value: 'symptoms', label: '症状说明' },
    { value: 'treatment', label: '治疗方法' },
    { value: 'lifestyle', label: '生活方式' },
    { value: 'psychology', label: '心理调适' }
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('education_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "请填写必要信息",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      if (editingArticle) {
        // 更新文章
        const { error } = await supabase
          .from('education_articles')
          .update({
            title: formData.title,
            category: formData.category,
            content: formData.content,
            summary: formData.summary,
            reading_time: formData.reading_time,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArticle.id);

        if (error) throw error;

        toast({
          title: "更新成功",
          description: "文章已更新"
        });
      } else {
        // 创建新文章
        const { error } = await supabase
          .from('education_articles')
          .insert([{
            title: formData.title,
            category: formData.category,
            content: formData.content,
            summary: formData.summary,
            reading_time: formData.reading_time
          }]);

        if (error) throw error;

        toast({
          title: "创建成功",
          description: "新文章已创建"
        });
      }

      setFormData({
        title: '',
        category: 'basics',
        content: '',
        summary: '',
        reading_time: 3
      });
      setEditingArticle(null);
      setIsCreating(false);
      loadArticles();
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: EducationArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      content: article.content,
      summary: article.summary || '',
      reading_time: article.reading_time || 3
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('education_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "删除成功",
        description: "文章已删除"
      });
      loadArticles();
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      category: 'basics',
      content: '',
      summary: '',
      reading_time: 3
    });
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {editingArticle ? '编辑文章' : '创建新文章'}
          </h2>
          <Button onClick={handleCancel} variant="ghost">
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入文章标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">分类</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">摘要</label>
              <Input
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="输入文章摘要"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">预计阅读时间（分钟）</label>
              <Input
                type="number"
                value={formData.reading_time}
                onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) || 3 })}
                min="1"
                max="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="输入文章内容"
                rows={10}
              />
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {editingArticle ? '更新文章' : '创建文章'}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          科普文章管理
        </h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建新文章
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-2">{article.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>分类: {categories.find(c => c.value === article.category)?.label}</span>
                      <span>阅读时间: {article.reading_time}分钟</span>
                      <span>创建于: {new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    {article.summary && (
                      <p className="text-gray-700 mb-3">{article.summary}</p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {article.content.substring(0, 200)}...
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {articles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无文章
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEducationManagement;
