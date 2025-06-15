
import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, FileText, Database, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';

interface DataExportProps {
  onBack: () => void;
}

const DataExport = ({ onBack }: DataExportProps) => {
  const [loading, setLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { toast } = useToast();

  const handleAIAssistant = () => {
    const message = `我是梅尼埃症患者，想要分析我的症状记录。请帮我分析症状规律、诱发因素和治疗建议。我已经导出了记录文件，请告诉我如何更好地管理我的病情。`;
    
    window.open('https://www.doubao.com/chat/?text=' + encodeURIComponent(message), '_blank');
    toast({
      title: "已跳转到豆包AI",
      description: "请将导出的记录文件上传给AI进行分析",
    });
  };

  const handleExport = async (timeRange: 'week' | 'month' | 'custom') => {
    if (timeRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        toast({
          title: '错误',
          description: '请选择开始和结束日期',
          variant: 'destructive'
        });
        return;
      }

      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      
      if (startDate > endDate) {
        toast({
          title: '错误',
          description: '开始日期不能晚于结束日期',
          variant: 'destructive'
        });
        return;
      }

      if (endDate > new Date()) {
        toast({
          title: '错误',
          description: '结束日期不能是未来时间',
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);
    try {
      let records;
      
      if (timeRange === 'custom') {
        // 获取自定义时间范围的记录
        records = await supabaseService.getRecordsByDateRange(
          new Date(customStartDate),
          new Date(customEndDate)
        );
      } else {
        // 获取预设时间范围的记录
        const { json: jsonData, text: textData } = await supabaseService.exportRecords(timeRange);
        
        // 下载JSON文件
        const jsonBlob = new Blob([jsonData], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `meniere_records_${timeRange}_${new Date().toISOString().split('T')[0]}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);

        // 下载文本文件
        const textBlob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
        const textUrl = URL.createObjectURL(textBlob);
        const textLink = document.createElement('a');
        textLink.href = textUrl;
        textLink.download = `meniere_records_${timeRange}_${new Date().toISOString().split('T')[0]}.txt`;
        textLink.click();
        URL.revokeObjectURL(textUrl);

        toast({
          title: '导出成功',
          description: `${timeRange === 'week' ? '最近一周' : '最近一个月'}的记录已导出`,
        });
        return;
      }

      // 处理自定义时间范围的导出
      const jsonData = JSON.stringify(records, null, 2);
      const textData = formatRecordsAsText(records);

      // 下载JSON文件
      const jsonBlob = new Blob([jsonData], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `meniere_records_${customStartDate}_to_${customEndDate}.json`;
      jsonLink.click();
      URL.revokeObjectURL(jsonUrl);

      // 下载文本文件
      const textBlob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
      const textUrl = URL.createObjectURL(textBlob);
      const textLink = document.createElement('a');
      textLink.href = textUrl;
      textLink.download = `meniere_records_${customStartDate}_to_${customEndDate}.txt`;
      textLink.click();
      URL.revokeObjectURL(textUrl);

      toast({
        title: '导出成功',
        description: `${customStartDate} 到 ${customEndDate} 的记录已导出`,
      });

    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatRecordsAsText = (records: any[]) => {
    let text = `梅尼埃症记录报告\n生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    text += `时间范围: ${customStartDate} 到 ${customEndDate}\n`;
    text += `记录总数: ${records.length} 条\n\n`;
    
    // 按类型统计
    const typeStats = records.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {});
    
    text += `记录类型统计:\n`;
    Object.entries(typeStats).forEach(([type, count]) => {
      text += `- ${getRecordTypeText(type)}: ${count} 条\n`;
    });
    text += '\n';
    
    text += '详细记录:\n';
    text += '=' .repeat(50) + '\n\n';
    
    records.forEach((record, index) => {
      text += `${index + 1}. 【${getRecordTypeText(record.type)}】\n`;
      text += `时间: ${new Date(record.timestamp).toLocaleString('zh-CN')}\n`;
      
      if (record.type === 'dizziness') {
        text += `严重程度: ${record.severity || record.data?.severity || '未记录'}\n`;
        text += `持续时间: ${record.duration || record.data?.duration || '未记录'}\n`;
        const symptoms = record.symptoms || record.data?.symptoms || [];
        if (symptoms.length > 0) {
          text += `伴随症状: ${symptoms.join('、')}\n`;
        }
      } else if (record.type === 'lifestyle') {
        text += `睡眠质量: ${record.sleep || record.data?.sleep || '未记录'}\n`;
        text += `压力水平: ${record.stress || record.data?.stress || '未记录'}\n`;
        const diet = record.diet || record.data?.diet || [];
        if (diet.length > 0) {
          text += `饮食情况: ${diet.join('、')}\n`;
        }
      } else if (record.type === 'medication') {
        const medications = record.medications || record.data?.medications || [];
        if (medications.length > 0) {
          text += `用药情况: ${medications.join('、')}\n`;
        }
        if (record.dosage || record.data?.dosage) {
          text += `用药剂量: ${record.dosage || record.data?.dosage}\n`;
        }
      } else if (record.type === 'daily_checkin') {
        if (record.mood_score || record.data?.mood_score) {
          text += `心情评分: ${record.mood_score || record.data?.mood_score}/5\n`;
        }
      }
      
      // 添加备注信息
      const note = record.note || record.data?.note || record.data?.manualInput;
      if (note) {
        text += `详细说明: ${note}\n`;
      }
      
      text += '\n';
    });

    return text;
  };

  const getRecordTypeText = (type: string): string => {
    switch (type) {
      case 'dizziness': return '眩晕症状';
      case 'lifestyle': return '生活记录';
      case 'medication': return '用药记录';
      case 'voice': return '语音记事';
      case 'daily_checkin': return '每日打卡';
      default: return '未知类型';
    }
  };

  // 设置默认日期（最近一个月）
  React.useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    setCustomEndDate(today.toISOString().split('T')[0]);
    setCustomStartDate(oneMonthAgo.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">整理记录给医生/AI</h1>
          <div className="w-16"></div>
        </div>

        <Tabs defaultValue="quick" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">快速导出</TabsTrigger>
            <TabsTrigger value="custom">自定义时间</TabsTrigger>
          </TabsList>

          <TabsContent value="quick">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    快速时间范围
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handleExport('week')}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {loading ? '导出中...' : '导出最近一周记录'}
                  </Button>

                  <Button
                    onClick={() => handleExport('month')}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {loading ? '导出中...' : '导出最近一个月记录'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2" />
                    导出说明
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• 导出包含JSON和文本两种格式</p>
                    <p>• JSON格式便于数据分析和AI处理</p>
                    <p>• 文本格式便于医生查看和阅读</p>
                    <p>• 包含完整的症状、用药、生活记录信息</p>
                    <p>• 文件将自动下载到您的设备</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI助手咨询 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    AI健康助手咨询
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleAIAssistant}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg mb-4"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    豆包AI 健康分析
                  </Button>
                  <p className="text-xs text-gray-500">
                    点击按钮跳转到豆包AI进行健康咨询，可上传导出的记录文件进行专业分析
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Database className="h-5 w-5 mr-2" />
                  自定义时间范围
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">开始日期</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">结束日期</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    min={customStartDate}
                  />
                </div>

                <Button
                  onClick={() => handleExport('custom')}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {loading ? '导出中...' : '导出自定义时间范围记录'}
                </Button>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">提示：</p>
                  <p>• 选择您需要的具体时间段</p>
                  <p>• 开始日期不能晚于结束日期</p>
                  <p>• 结束日期不能是未来时间</p>
                  <p>• 建议选择有记录的时间段</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">使用建议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>就医前：</strong>导出最近症状记录，便于医生了解病情发展</p>
              <p><strong>复诊时：</strong>导出用药期间的记录，评估治疗效果</p>
              <p><strong>AI分析：</strong>导出完整数据，便于AI工具分析症状规律和诱发因素</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataExport;
