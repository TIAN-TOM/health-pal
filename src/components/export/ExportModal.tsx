
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ExportModalProps {
  showDataModal: boolean;
  exportedData: string;
  onClose: () => void;
}

const ExportModal = ({ showDataModal, exportedData, onClose }: ExportModalProps) => {
  const { toast } = useToast();

  if (!showDataModal) return null;

  const handleSelectText = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    textarea.select();
    document.execCommand('copy');
    toast({
      title: "已选择文本",
      description: "请使用系统复制功能(Ctrl+C 或长按选择复制)",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">请手动复制数据</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            自动复制失败，请选择下方文本并手动复制：
          </p>
          <textarea
            value={exportedData}
            readOnly
            className="w-full h-64 p-3 border rounded-md font-mono text-xs resize-none"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleSelectText}
            className="flex-1"
          >
            选择全部文本
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
