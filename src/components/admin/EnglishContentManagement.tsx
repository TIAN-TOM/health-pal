
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import {
  getAllQuotes, createQuote, updateQuote, deleteQuote,
  getAllWords, createWord, updateWord, deleteWord,
  getAllPhrases, createPhrase, updatePhrase, deletePhrase,
  getAllListening, createListening, updateListening, deleteListening,
} from '@/services/englishService';

// 表单组件提升到模块顶层：定义在父组件函数体内时，每次父组件重渲染都会
// 得到新的组件引用，React 会 unmount+remount 整棵子树导致输入框失焦。
type FormProps = {
  formData: any;
  setFormData: (v: any) => void;
  item?: any;
  isNew?: boolean;
  onSave: (data: any, isNew: boolean) => void;
  onCancel: (isNew: boolean) => void;
};

const QuoteForm = ({ formData, setFormData, item, isNew = false, onSave, onCancel }: FormProps) => (
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
      <Button onClick={() => onSave(formData, isNew)}>
        <Save className="h-4 w-4 mr-2" />保存
      </Button>
      <Button variant="outline" onClick={() => onCancel(isNew)}>
        <X className="h-4 w-4 mr-2" />取消
      </Button>
    </div>
  </div>
);

const WordForm = ({ formData, setFormData, item, isNew = false, onSave, onCancel }: FormProps) => (
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
      <Button onClick={() => onSave(formData, isNew)}>
        <Save className="h-4 w-4 mr-2" />保存
      </Button>
      <Button variant="outline" onClick={() => onCancel(isNew)}>
        <X className="h-4 w-4 mr-2" />取消
      </Button>
    </div>
  </div>
);

const PhraseForm = ({ formData, setFormData, item, isNew = false, onSave, onCancel }: FormProps) => (
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
      <Button onClick={() => onSave(formData, isNew)}>
        <Save className="h-4 w-4 mr-2" />保存
      </Button>
      <Button variant="outline" onClick={() => onCancel(isNew)}>
        <X className="h-4 w-4 mr-2" />取消
      </Button>
    </div>
  </div>
);

const ListeningForm = ({ formData, setFormData, item, isNew = false, onSave, onCancel }: FormProps) => (
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
      <Button onClick={() => onSave(formData, isNew)}>
        <Save className="h-4 w-4 mr-2" />保存
      </Button>
      <Button variant="outline" onClick={() => onCancel(isNew)}>
        <X className="h-4 w-4 mr-2" />取消
      </Button>
    </div>
  </div>
);

const EnglishContentManagement = () => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newItemForm, setNewItemForm] = useState<any>({});
  const [showNewForm, setShowNewForm] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const quotesQuery = useQuery({ queryKey: ['english-quotes'], queryFn: getAllQuotes });
  const wordsQuery = useQuery({ queryKey: ['english-words'], queryFn: getAllWords });
  const phrasesQuery = useQuery({ queryKey: ['english-phrases'], queryFn: getAllPhrases });
  const listeningQuery = useQuery({ queryKey: ['english-listening'], queryFn: getAllListening });

  const quotes = quotesQuery.data ?? [];
  const words = wordsQuery.data ?? [];
  const phrases = phrasesQuery.data ?? [];
  const listening = listeningQuery.data ?? [];

  const isPending = quotesQuery.isPending || wordsQuery.isPending || phrasesQuery.isPending || listeningQuery.isPending;
  const isError = quotesQuery.isError || wordsQuery.isError || phrasesQuery.isError || listeningQuery.isError;
  const refetchAll = () => {
    quotesQuery.refetch();
    wordsQuery.refetch();
    phrasesQuery.refetch();
    listeningQuery.refetch();
  };

  const invalidate = (key: string) => queryClient.invalidateQueries({ queryKey: [key] });
  const onSaveError = (error: unknown) => {
    console.error('保存失败:', error);
    toast({ title: '保存失败', description: '请检查输入内容', variant: 'destructive' });
  };
  const onDeleteError = (error: unknown) => {
    console.error('删除失败:', error);
    toast({ title: '删除失败', description: '请稍后重试', variant: 'destructive' });
  };

  const quoteSaveMutation = useMutation({
    mutationFn: (vars: { data: any; id?: string }) => (vars.id ? updateQuote(vars.id, vars.data) : createQuote(vars.data)),
    onSuccess: (_d, vars) => {
      invalidate('english-quotes');
      if (vars.id) { toast({ title: '更新成功', description: '名言已更新' }); setEditingItem(null); setEditForm({}); }
      else { toast({ title: '添加成功', description: '新名言已添加' }); setShowNewForm(null); setNewItemForm({}); }
    },
    onError: onSaveError,
  });
  const quoteDeleteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => { invalidate('english-quotes'); toast({ title: '删除成功', description: '名言已删除' }); },
    onError: onDeleteError,
  });

  const wordSaveMutation = useMutation({
    mutationFn: (vars: { data: any; id?: string }) => (vars.id ? updateWord(vars.id, vars.data) : createWord(vars.data)),
    onSuccess: (_d, vars) => {
      invalidate('english-words');
      if (vars.id) { toast({ title: '更新成功', description: '单词已更新' }); setEditingItem(null); setEditForm({}); }
      else { toast({ title: '添加成功', description: '新单词已添加' }); setShowNewForm(null); setNewItemForm({}); }
    },
    onError: onSaveError,
  });
  const wordDeleteMutation = useMutation({
    mutationFn: deleteWord,
    onSuccess: () => { invalidate('english-words'); toast({ title: '删除成功', description: '单词已删除' }); },
    onError: onDeleteError,
  });

  const phraseSaveMutation = useMutation({
    mutationFn: (vars: { data: any; id?: string }) => (vars.id ? updatePhrase(vars.id, vars.data) : createPhrase(vars.data)),
    onSuccess: (_d, vars) => {
      invalidate('english-phrases');
      if (vars.id) { toast({ title: '更新成功', description: '短语已更新' }); setEditingItem(null); setEditForm({}); }
      else { toast({ title: '添加成功', description: '新短语已添加' }); setShowNewForm(null); setNewItemForm({}); }
    },
    onError: onSaveError,
  });
  const phraseDeleteMutation = useMutation({
    mutationFn: deletePhrase,
    onSuccess: () => { invalidate('english-phrases'); toast({ title: '删除成功', description: '短语已删除' }); },
    onError: onDeleteError,
  });

  const listeningSaveMutation = useMutation({
    mutationFn: (vars: { data: any; id?: string }) => (vars.id ? updateListening(vars.id, vars.data) : createListening(vars.data)),
    onSuccess: (_d, vars) => {
      invalidate('english-listening');
      if (vars.id) { toast({ title: '更新成功', description: '听力内容已更新' }); setEditingItem(null); setEditForm({}); }
      else { toast({ title: '添加成功', description: '新听力内容已添加' }); setShowNewForm(null); setNewItemForm({}); }
    },
    onError: onSaveError,
  });
  const listeningDeleteMutation = useMutation({
    mutationFn: deleteListening,
    onSuccess: () => { invalidate('english-listening'); toast({ title: '删除成功', description: '听力内容已删除' }); },
    onError: onDeleteError,
  });

  const handleSaveQuote = (data: any, isNew = false) => {
    if (!isNew && !editingItem) return;
    quoteSaveMutation.mutate({ data, id: isNew ? undefined : editingItem! });
  };

  const handleSaveWord = (data: any, isNew = false) => {
    if (!isNew && !editingItem) return;
    wordSaveMutation.mutate({ data, id: isNew ? undefined : editingItem! });
  };

  const handleSavePhrase = (data: any, isNew = false) => {
    if (!isNew && !editingItem) return;
    phraseSaveMutation.mutate({ data, id: isNew ? undefined : editingItem! });
  };

  const handleSaveListening = (data: any, isNew = false) => {
    if (!isNew && !editingItem) return;
    listeningSaveMutation.mutate({ data, id: isNew ? undefined : editingItem! });
  };

  const handleDeleteQuote = (id: string) => {
    if (!window.confirm('确定要删除这个名言吗？')) return;
    quoteDeleteMutation.mutate(id);
  };

  const handleDeleteWord = (id: string) => {
    if (!window.confirm('确定要删除这个单词吗？')) return;
    wordDeleteMutation.mutate(id);
  };

  const handleDeletePhrase = (id: string) => {
    if (!window.confirm('确定要删除这个短语吗？')) return;
    phraseDeleteMutation.mutate(id);
  };

  const handleDeleteListening = (id: string) => {
    if (!window.confirm('确定要删除这个听力内容吗？')) return;
    listeningDeleteMutation.mutate(id);
  };

  // 统一取消：新增表单关闭 showNewForm，编辑表单关闭 editingItem。
  const handleCancel = (isNew: boolean) => (isNew ? setShowNewForm(null) : setEditingItem(null));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>英语学习内容管理</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div role="alert" className="text-center py-8 space-y-3">
              <p className="text-gray-600">加载失败，请检查网络后重试</p>
              <Button variant="outline" onClick={() => refetchAll()}>
                重新加载
              </Button>
            </div>
          ) : isPending ? (
            <div className="text-center py-8 text-gray-600">加载中...</div>
          ) : (
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
                  <QuoteForm formData={newItemForm} setFormData={setNewItemForm} isNew onSave={handleSaveQuote} onCancel={handleCancel} />
                </Card>
              )}

              <div className="space-y-2">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="p-4">
                    {editingItem === quote.id ? (
                      <QuoteForm formData={editForm} setFormData={setEditForm} item={quote} onSave={handleSaveQuote} onCancel={handleCancel} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{quote.quote_text}</p>
                          <p className="text-sm text-gray-600">{quote.quote_translation}</p>
                          <p className="text-xs text-gray-600">— {quote.author}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(quote.id);
                              setEditForm(quote);
                            }}
                            aria-label="编辑名言"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQuote(quote.id)}
                            aria-label="删除名言"
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
                  <WordForm formData={newItemForm} setFormData={setNewItemForm} isNew onSave={handleSaveWord} onCancel={handleCancel} />
                </Card>
              )}

              <div className="space-y-2">
                {words.map((word) => (
                  <Card key={word.id} className="p-4">
                    {editingItem === word.id ? (
                      <WordForm formData={editForm} setFormData={setEditForm} item={word} onSave={handleSaveWord} onCancel={handleCancel} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{word.word} <span className="text-sm text-gray-600">{word.pronunciation}</span></p>
                          <p className="text-sm text-gray-600">{word.meaning}</p>
                          <p className="text-xs text-gray-600">{word.example_sentence}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(word.id);
                              setEditForm(word);
                            }}
                            aria-label="编辑单词"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteWord(word.id)}
                            aria-label="删除单词"
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
                  <PhraseForm formData={newItemForm} setFormData={setNewItemForm} isNew onSave={handleSavePhrase} onCancel={handleCancel} />
                </Card>
              )}

              <div className="space-y-2">
                {phrases.map((phrase) => (
                  <Card key={phrase.id} className="p-4">
                    {editingItem === phrase.id ? (
                      <PhraseForm formData={editForm} setFormData={setEditForm} item={phrase} onSave={handleSavePhrase} onCancel={handleCancel} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{phrase.phrase_english}</p>
                          <p className="text-sm text-gray-600">{phrase.phrase_chinese}</p>
                          <p className="text-xs text-gray-600">{phrase.meaning_explanation}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(phrase.id);
                              setEditForm(phrase);
                            }}
                            aria-label="编辑短语"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePhrase(phrase.id)}
                            aria-label="删除短语"
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
                  <ListeningForm formData={newItemForm} setFormData={setNewItemForm} isNew onSave={handleSaveListening} onCancel={handleCancel} />
                </Card>
              )}

              <div className="space-y-2">
                {listening.map((item) => (
                  <Card key={item.id} className="p-4">
                    {editingItem === item.id ? (
                      <ListeningForm formData={editForm} setFormData={setEditForm} item={item} onSave={handleSaveListening} onCancel={handleCancel} />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.content.substring(0, 100)}...</p>
                          <p className="text-xs text-gray-600 mt-1">主题: {item.topic || '通用'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(item.id);
                              setEditForm(item);
                            }}
                            aria-label="编辑听力内容"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteListening(item.id)}
                            aria-label="删除听力内容"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnglishContentManagement;
