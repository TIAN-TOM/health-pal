
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';

type Announcement = Tables<'announcements'>;

const AnnouncementDisplay = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    loadActiveAnnouncements();
    
    // 从localStorage加载已忽略的公告ID
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }
  }, []);

  const loadActiveAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3); // 最多显示3条公告

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('加载公告失败:', error);
    }
  };

  const dismissAnnouncement = (id: string) => {
    const newDismissedIds = [...dismissedIds, id];
    setDismissedIds(newDismissedIds);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissedIds));
  };

  // 获取北京时间格式化
  const formatBeijingTime = (dateString: string) => {
    const date = new Date(dateString + '+08:00');
    return format(date, 'MM月dd日 HH:mm', { locale: zhCN });
  };

  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedIds.includes(announcement.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => (
        <Card key={announcement.id} className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Megaphone className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">{announcement.title}</span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{announcement.content}</p>
                <p className="text-xs text-gray-500">
                  发布时间: {formatBeijingTime(announcement.created_at)} (北京时间)
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAnnouncement(announcement.id)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnnouncementDisplay;
