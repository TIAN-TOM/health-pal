
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecordDeleteProps {
  recordId: string;
  recordType: 'meniere_records' | 'daily_checkins';
  onDeleted: () => void;
  className?: string;
}

const RecordDelete = ({ recordId, recordType, onDeleted, className = "" }: RecordDeleteProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这条记录吗？此操作无法恢复。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from(recordType)
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "删除成功",
        description: "记录已成功删除",
      });

      onDeleted();
    } catch (error) {
      console.error('删除记录失败:', error);
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="sm"
      className={`text-red-600 hover:text-red-800 hover:bg-red-50 ${className}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default RecordDelete;
