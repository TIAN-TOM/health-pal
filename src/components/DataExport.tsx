
import React, { useState } from 'react';
import { ArrowLeft, Copy, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DataExportProps {
  onBack: () => void;
}

const DataExport = ({ onBack }: DataExportProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const { toast } = useToast();

  const getRecordsForPeriod = (period: string) => {
    const records = JSON.parse(localStorage.getItem('meniereRecords') || '[]');
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return records;
    }

    return records.filter((record: any) => 
      new Date(record.timestamp) >= startDate
    );
  };

  const generateJSONExport = (period: string) => {
    const records = getRecordsForPeriod(period);
    const exportData = {
      exportDate: new Date().toISOString(),
      period: period,
      totalRecords: records.length,
      records: records
    };
    return JSON.stringify(exportData, null, 2);
  };

  const generateTextExport = (period: string) => {
    const records = getRecordsForPeriod(period);
    const periodLabel = period === 'week' ? '上周' : '上月';
    
    let text = `梅尼埃症记录报告 - ${periodLabel}\n`;
    text += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    text += `记录总数: ${records.length} 条\n\n`;

    // 按类型分组统计
    const dizzinessRecords = records.filter((r: any) => r.type === 'dizziness');
    const lifestyleRecords = records.filter((r: any) => r.type === 'lifestyle');
    const medicationRecords = records.filter((r: any) => r.type === 'medication');
    const voiceRecords = records.filter((r: any) => r.type === 'voice');

    text += `📊 记录统计:\n`;
    text += `- 眩晕发作: ${dizzinessRecords.length} 次\n`;
    text += `- 生活记录: ${lifestyleRecords.length} 条\n`;
    text += `- 用药记录: ${medicationRecords.length} 次\n`;
    text += `- 语音记录: ${voiceRecords.length} 条\n\n`;

    // 详细记录
    records.forEach((record: any, index: number) => {
      const date = new Date(record.timestamp).toLocaleString('zh-CN');
      text += `${index + 1}. [${date}] `;
      
      switch (record.type) {
        case 'dizziness':
          text += `眩晕发作 - 持续时间: ${record.duration}, 严重程度: ${record.severity}`;
          if (record.symptoms.length > 0) {
            text += `, 伴随症状: ${record.symptoms.join(', ')}`;
          }
          break;
        case 'lifestyle':
          text += `生活记录 - 睡眠: ${record.sleep}, 压力: ${record.stress}`;
          if (record.diet.length > 0) {
            text += `, 饮食: ${record.diet.join(', ')}`;
          }
          break;
        case 'medication':
          text += `用药记录 - 药物: ${record.medications.join(', ')}`;
          if (record.dosage) {
            text += `, 剂量: ${record.dosage}`;
          }
          break;
        case 'voice':
          text += `语音记录 - ${record.note}`;
          break;
      }
      text += '\n';
    });

    return text;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: type === 'json' ? "已复制，可以去粘贴了" : "已复制，可以发给家人了",
      });
    }).catch(() => {
      toast({
        title: "复制失败",
        description: "请手动复制内容",
        variant: "destructive"
      });
    });
  };

  const handleJSONExport = () => {
    if (!selectedPeriod) {
      toast({
        title: "请选择时期",
        description: "请先选择要导出的时期",
        variant: "destructive"
      });
      return;
    }
    
    const jsonData = generateJSONExport(selectedPeriod);
    copyToClipboard(jsonData, 'json');
  };

  const handleTextExport = () => {
    if (!selectedPeriod) {
      toast({
        title: "请选择时期",
        description: "请先选择要导出的时期",
        variant: "destructive"
      });
      return;
    }
    
    const textData = generateTextExport(selectedPeriod);
    copyToClipboard(textData, 'text');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      {/* 返回按钮 */}
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

      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              整理记录给医生/AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 时期选择 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                选择时期
              </h3>
              <div className="grid gap-3">
                {[
                  { value: 'week', label: '整理上周记录' },
                  { value: 'month', label: '整理上月记录' }
                ].map(option => (
                  <Button
                    key={option.value}
                    onClick={() => setSelectedPeriod(option.value)}
                    variant={selectedPeriod === option.value ? "default" : "outline"}
                    className={`w-full py-4 text-lg ${
                      selectedPeriod === option.value 
                        ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                        : 'border-2 hover:border-teal-300'
                    }`}
                  >
                    {option.label}
                    {selectedPeriod === option.value && (
                      <span className="ml-2">✓</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* 记录统计预览 */}
            {selectedPeriod && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📋 记录预览</h4>
                <div className="text-sm text-blue-700">
                  {selectedPeriod === 'week' ? '上周' : '上月'}共有 {getRecordsForPeriod(selectedPeriod).length} 条记录
                </div>
              </div>
            )}

            {/* 导出选项 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                选择导出格式
              </h3>
              
              <Button
                onClick={handleJSONExport}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 rounded-lg"
                disabled={!selectedPeriod}
              >
                <Copy className="mr-3 h-5 w-5" />
                复制给AI分析
                <div className="text-sm opacity-90 ml-2">(JSON格式)</div>
              </Button>

              <Button
                onClick={handleTextExport}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-lg"
                disabled={!selectedPeriod}
              >
                <Download className="mr-3 h-5 w-5" />
                复制文字版
                <div className="text-sm opacity-90 ml-2">(可读格式)</div>
              </Button>
            </div>

            {/* 使用说明 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">💡 使用说明</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• JSON格式适合AI分析，包含完整结构化数据</li>
                <li>• 文字版适合发给家人或医生阅读</li>
                <li>• 数据已复制到剪贴板，可直接粘贴使用</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataExport;
