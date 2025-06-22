
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';

interface ManualItem {
  id: string;
  title: string;
  content: string;
  section: string;
  order_index: number;
  icon?: string;
}

interface UserManualProps {
  onBack: () => void;
}

const UserManual = ({ onBack }: UserManualProps) => {
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['入门指南']));

  useEffect(() => {
    loadManualItems();
  }, []);

  const loadManualItems = async () => {
    try {
      const { data, error } = await supabase
        .from('user_manual')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setManualItems(data || []);
    } catch (error) {
      console.error('加载用户手册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = manualItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ManualItem[]>);

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return <BookOpen className="h-5 w-5" />;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold">使用手册</h1>
          <div className="w-16"></div>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedItems).map(([section, items]) => (
            <Card key={section}>
              <Collapsible 
                open={openSections.has(section)} 
                onOpenChange={() => toggleSection(section)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        {section}
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${
                          openSections.has(section) ? 'rotate-90' : ''
                        }`} 
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center mb-2">
                          {getIcon(item.icon)}
                          <h3 className="font-medium text-lg ml-2">{item.title}</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <BookOpen className="h-5 w-5 text-blue-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">使用提示</h3>
              <p className="text-blue-700 text-sm">
                如果您在使用过程中遇到任何问题，请随时联系我们的客服团队。建议您按照手册的顺序逐步了解各功能，这样能更好地发挥应用的作用。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
