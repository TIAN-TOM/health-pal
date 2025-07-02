
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type EnglishQuote = Tables<'english_quotes'>;
type EnglishWord = Tables<'english_words'>;
type EnglishPhrase = Tables<'english_phrases'>;
type EnglishListening = Tables<'english_listening'>;

const EnglishContentManagement = () => {
  const [quotes, setQuotes] = useState<EnglishQuote[]>([]);
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [phrases, setPhrases] = useState<EnglishPhrase[]>([]);
  const [listening, setListening] = useState<EnglishListening[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newItemForm, setNewItemForm] = useState<any>({});
  const [showNewForm, setShowNewForm] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    try {
      const [quotesRes, wordsRes, phrasesRes, listeningRes] = await Promise.all([
        supabase.from('english_quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('english_words').select('*').order('created_at', { ascending: false }),
        supabase.from('english_phrases').select('*').order('created_at', { ascending: false }),
        supabase.from('english_listening').select('*').order('created_at', { ascending: false })
      ]);

      if (quotesRes.data) setQuotes(quotesRes.data);
      if (wordsRes.data) setWords(wordsRes.data);
      if (phrasesRes.data) setPhrases(phrasesRes.data);
      if (listeningRes.data) setListening(listeningRes.data);
    } catch (error) {
      console.error('加载内容失败:', error);
      toast({ title: '加载失败', description: '请刷新页面重试', variant: 'destructive' });
    }
  };

  const handleSaveQuote = async (data: any, isNew = false) => {
    try {
      if (isNew) {
        const { error } = await supabase.from('english_quotes').insert(data);
        if (error) throw error;
        toast({ title: '添加成功', description: '新名言已添加' });
        setShowNewForm(null);
        setNewItemForm({});
      } else {
        const { error } = await supabase.from('english_quotes').update(data).eq('id', editingItem);
        if (error) throw error;
        toast({ title: '更新成功', description: '名言已更新' });
        setEditingItem(null);
        setEditForm({});
      }
      loadAllContent();
    } catch (error) {
      console.error('保存失败:', error);
      toast({ title: '保存失败', description: '请检查输入内容', variant: 'destructive' });
    }
  };

  const handleSaveWord = async (data: any, isNew = false) => {
    try {
      if (isNew) {
        const { error } = await supabase.from('english_words').insert(data);
        if (error) throw error;
        toast({ title: '添加成功', description: '新单词已添加' });
        setShowNewForm(null);
        setNewItemForm({});
      } else {
        const { error } = await supabase.from('english_words').update(data).eq('id', editingItem);
        if (error) throw error;
        toast({ title: '更新成功', description: '单词已更新' });
        setEditingItem(null);
        setEditForm({});
      }
      loadAllContent();
    } catch (error) {
      console.error('保存失败:', error);
      toast({ title: '保存失败', description: '请检查输入内容', variant: 'destructive' });
    }
  };

  const handleSavePhrase = async (data: any, isNew = false) => {
    try {
      if (isNew) {
        const { error } = await supabase.from('english_phrases').insert(data);
        if (error) throw error;
        toast({ title: '添加成功', description: '新短语已添加' });
        setShowNewForm(null);
        setNewItemForm({});
      } else {
        const { error } = await supabase.from('english_phrases').update(data).eq('id', editingItem);
        if (error) throw error;
        toast({ title: '更新成功', description: '短语已更新' });
        setEditingItem(null);
        setEditForm({});
      }
      loadAllContent();
    } catch (error) {
      console.error('保存失败:', error);
      toast({ title: '保存失败', description: '请检查输入内容', variant: 'destructive' });
    }
  };

  const handleSaveListening = async (data: any, isNew = false) => {
    try {
      if (isNew) {
        const { error } = await supabase.from('english_listening').insert(data);
        if (error) throw error;
        toast({ title: '添加成功', description: '新听力内容已添加' });
        setShowNewForm(null);
        setNewItemForm({});
      } else {
        const { error } = await supabase.from('english_listening').update(data).eq('id', editingItem);
        if (error) throw error;
        toast({ title: '更新成功', description: '听力内容已更新' });
        setEditingItem(null);
        setEditForm({});
      }
      loadAllContent();
    } catch (error) {
      console.error('保存失败:', error);
      toast({ title: '保存失败', description: '请检查输入内容', variant: 'destructive' });
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!window.confirm('确定要删除这个名言吗？')) return;
    
    try {
      const { error } = await supabase.from('english_quotes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: '删除成功', description: '名言已删除' });
      loadAllContent();
    } catch (error) {
      console.error('删除失败:', error);
      toast({ title: '删除失败', description: '请稍后重试', variant: 'destructive' });
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (!window.confirm('确定要删除这个单词吗？')) return;
    
    try {
      const { error } = await supabase.from('english_words').delete().eq('id', id);
      if (error) throw error;
      toast({ title: '删除成功', description: '单词已删除' });
      loadAllContent();
    } catch (error) {
      console.error('删除失败:', error);
      toast({ title: '删除失败', description: '请稍后重试', variant: 'destructive' });
    }
  };

  const handleDeletePhrase = async (id: string) => {
    if (!window.confirm('确定要删除这个短语吗？')) return;
    
    try {
      const { error } = await supabase.from('english_phrases').delete().eq('id', id);
      if (error) throw error;
      toast({ title: '删除成功', description: '短语已删除' });
      loadAllContent();
    } catch (error) {
      console.error('删除失败:', error);
      toast({ title: '删除失败', description: '请稍后重试', variant: 'destructive' });
    }
  };

  const handleDeleteListening = async (id: string) => {
    if (!window.confirm('确定要删除这个听力内容吗？')) return;
    
    try {
      const { error } = await supabase.from('english_listening').delete().eq('id', id);
      if (error) throw error;
      toast({ title: '删除成功', description: '听力内容已删除' });
      loadAllContent();
    } catch (error) {
      console.error('删除失败:', error);
      toast({ title: '删除失败', description: '请稍后重试', variant: 'destructive' });
    }
  };

  const QuoteForm = ({ item, isNew = false }: { item?: any, isNew?: boolean }) => {
    const formData = isNew ? newItemForm : editForm;
    const setFormData = isNew ? setNewItemForm : setEditForm;

    return (
      <div className="space-y-4">
        <Input
          placeholder="英文名言"
          value={formData.quote_text || (item?.quote_text || '')}
          onChange={(e) => setFormData({ ...formData, quote_text: e.target.value })}
        />
        <Input
          placeholder="中文翻译"
          value={formData.quote_translation || (item?.quote_translation || '')}
          onChange={(e) => setFormData({ ...formData, quote_translation: e.target.value })}
        />
        <Input
          placeholder="作者"
          value={formData.author || (item?.author || '')}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />
        <Input
          placeholder="作者中文名（可选）"
          value={formData.author_translation || (item?.author_translation || '')}
          onChange={(e) => setFormData({ ...formData, author_translation: e.target.value })}
        />
        <Select value={formData.difficulty_level || item?.difficulty_level || 'intermediate'} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
          <SelectTrigger><SelectValue placeholder="难度级别" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">初级</SelectItem>
            <SelectItem value="intermediate">中级</SelectItem>
            <SelectItem value="advanced">高级</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button onClick={() => handleSaveQuote(formData, isNew)}>
            <Save className="h-4 w-4 mr-2" />保存
          </Button>
          <Button variant="outline" onClick={() => isNew ? setShowNewForm(null) : setEditingItem(null)}>
            <X className="h-4 w-4 mr-2" />取消
          </Button>
        </div>
      </div>
    );
  };

  const WordForm = ({ item, isNew = false }: { item?: any, isNew?: boolean }) => {
    const formData = isNew ? newItemForm : editForm;
    const setFormData = isNew ? setNewItemForm : setEditForm;

    return (
      <div className="space-y-4">
        <Input
          placeholder="英文单词"
          value={formData.word || (item?.word || '')}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
        />
        <Input
          placeholder="音标"
          value={formData.pronunciation || (item?.pronunciation || '')}
          onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
        />
        <Input
          placeholder="中文意思"
          value={formData.meaning || (item?.meaning || '')}
          onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
        />
        <Input
          placeholder="例句"
          value={formData.example_sentence || (item?.example_sentence || '')}
          onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
        />
        <Input
          placeholder="例句翻译"
          value={formData.example_translation || (item?.example_translation || '')}
          onChange={(e) => setFormData({ ...formData, example_translation: e.target.value })}
        />
        <Select value={formData.word_type || item?.word_type || 'noun'} onValueChange={(value) => setFormData({ ...formData, word_type: value })}>
          <SelectTrigger><SelectValue placeholder="词性" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="noun">名词</SelectItem>
            <SelectItem value="verb">动词</SelectItem>
            <SelectItem value="adjective">形容词</SelectItem>
            <SelectItem value="adverb">副词</SelectItem>
            <SelectItem value="other">其他</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button onClick={() => handleSaveWord(formData, isNew)}>
            <Save className="h-4 w-4 mr-2" />保存
          </Button>
          <Button variant="outline" onClick={() => isNew ? setShowNewForm(null) : setEditingItem(null)}>
            <X className="h-4 w-4 mr-2" />取消
          </Button>
        </div>
      </div>
    );
  };

  const PhraseForm = ({ item, isNew = false }: { item?: any, isNew?: boolean }) => {
    const formData = isNew ? newItemForm : editForm;
    const setFormData = isNew ? setNewItemForm : setEditForm;

    return (
      <div className="space-y-4">
        <Input
          placeholder="英文短语"
          value={formData.phrase_english || (item?.phrase_english || '')}
          onChange={(e) => setFormData({ ...formData, phrase_english: e.target.value })}
        />
        <Input
          placeholder="中文翻译"
          value={formData.phrase_chinese || (item?.phrase_chinese || '')}
          onChange={(e) => setFormData({ ...formData, phrase_chinese: e.target.value })}
        />
        <Textarea
          placeholder="含义解释"
          value={formData.meaning_explanation || (item?.meaning_explanation || '')}
          onChange={(e) => setFormData({ ...formData, meaning_explanation: e.target.value })}
        />
        <Input
          placeholder="例句（可选）"
          value={formData.example_sentence || (item?.example_sentence || '')}
          onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
        />
        <div className="flex gap-2">
          <Button onClick={() => handleSavePhrase(formData, isNew)}>
            <Save className="h-4 w-4 mr-2" />保存
          </Button>
          <Button variant="outline" onClick={() => isNew ? setShowNewForm(null) : setEditingItem(null)}>
            <X className="h-4 w-4 mr-2" />取消
          </Button>
        </div>
      </div>
    );
  };

  const ListeningForm = ({ item, isNew = false }: { item?: any, isNew?: boolean }) => {
    const formData = isNew ? newItemForm : editForm;
    const setFormData = isNew ? setNewItemForm : setEditForm;

    return (
      <div className="space-y-4">
        <Input
          placeholder="标题"
          value={formData.title || (item?.title || '')}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Textarea
          placeholder="英文内容"
          value={formData.content || (item?.content || '')}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
        />
        <Textarea
          placeholder="中文翻译"
          value={formData.translation || (item?.translation || '')}
          onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
          rows={4}
        />
        <Input
          placeholder="主题（可选）"
          value={formData.topic || (item?.topic || '')}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        />
        <div className="flex gap-2">
          <Button onClick={() => handleSaveListening(formData, isNew)}>
            <Save className="h-4 w-4 mr-2" />保存
          </Button>
          <Button variant="outline" onClick={() => isNew ? setShowNewForm(null) : setEditingItem(null)}>
            <X className="h-4 w-4 mr-2" />取消
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>英语学习内容管理</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quotes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quotes">名言</TabsTrigger>
              <TabsTrigger value="words">单词</TabsTrigger>
              <TabsTrigger value="phrases">短语</TabsTrigger>
              <TabsTrigger value="listening">听力</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">英语名言管理</h3>
                <Button onClick={() => setShowNewForm('quotes')}>
                  <Plus className="h-4 w-4 mr-2" />添加名言
                </Button>
              </div>

              {showNewForm === 'quotes' && (
                <Card className="p-4">
                  <h4 className="font-medium mb-4">添加新名言</h4>
                  <QuoteForm isNew />
                </Card>
              )}

              <div className="space-y-2">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="p-4">
                    {editingItem === quote.id ? (
                      <QuoteForm item={quote} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{quote.quote_text}</p>
                          <p className="text-sm text-gray-600">{quote.quote_translation}</p>
                          <p className="text-xs text-gray-500">— {quote.author}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(quote.id);
                              setEditForm(quote);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQuote(quote.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="words" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">英语单词管理</h3>
                <Button onClick={() => setShowNewForm('words')}>
                  <Plus className="h-4 w-4 mr-2" />添加单词
                </Button>
              </div>

              {showNewForm === 'words' && (
                <Card className="p-4">
                  <h4 className="font-medium mb-4">添加新单词</h4>
                  <WordForm isNew />
                </Card>
              )}

              <div className="space-y-2">
                {words.map((word) => (
                  <Card key={word.id} className="p-4">
                    {editingItem === word.id ? (
                      <WordForm item={word} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{word.word} <span className="text-sm text-gray-500">{word.pronunciation}</span></p>
                          <p className="text-sm text-gray-600">{word.meaning}</p>
                          <p className="text-xs text-gray-500">{word.example_sentence}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(word.id);
                              setEditForm(word);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteWord(word.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="phrases" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">英语短语管理</h3>
                <Button onClick={() => setShowNewForm('phrases')}>
                  <Plus className="h-4 w-4 mr-2" />添加短语
                </Button>
              </div>

              {showNewForm === 'phrases' && (
                <Card className="p-4">
                  <h4 className="font-medium mb-4">添加新短语</h4>
                  <PhraseForm isNew />
                </Card>
              )}

              <div className="space-y-2">
                {phrases.map((phrase) => (
                  <Card key={phrase.id} className="p-4">
                    {editingItem === phrase.id ? (
                      <PhraseForm item={phrase} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{phrase.phrase_english}</p>
                          <p className="text-sm text-gray-600">{phrase.phrase_chinese}</p>
                          <p className="text-xs text-gray-500">{phrase.meaning_explanation}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(phrase.id);
                              setEditForm(phrase);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePhrase(phrase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="listening" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">英语听力管理</h3>
                <Button onClick={() => setShowNewForm('listening')}>
                  <Plus className="h-4 w-4 mr-2" />添加听力
                </Button>
              </div>

              {showNewForm === 'listening' && (
                <Card className="p-4">
                  <h4 className="font-medium mb-4">添加新听力内容</h4>
                  <ListeningForm isNew />
                </Card>
              )}

              <div className="space-y-2">
                {listening.map((item) => (
                  <Card key={item.id} className="p-4">
                    {editingItem === item.id ? (
                      <ListeningForm item={item} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.content.substring(0, 100)}...</p>
                          <p className="text-xs text-gray-500 mt-1">主题: {item.topic || '通用'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(item.id);
                              setEditForm(item);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteListening(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnglishContentManagement;
