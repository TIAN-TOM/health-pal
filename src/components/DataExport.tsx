

import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, FileText, Database, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getBeijingDateString, getBeijingTime, formatBeijingTime } from '@/utils/beijingTime';

interface DataExportProps {
  onBack: () => void;
}

const DataExport = ({ onBack }: DataExportProps) => {
  const [loading, setLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'text' | null>(null);
  const { toast } = useToast();

  // 设置默认日期（最近一个月）- 使用北京时间
  React.useEffect(() => {
    const today = getBeijingTime();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    setCustomEndDate(getBeijingDateString(today));
    setCustomStartDate(getBeijingDateString(oneMonthAgo));
  }, []);

  const handleDeepSeekAI = () => {
    const message = `我是梅尼埃症患者，想要分析我的症状记录。请帮我分析症状规律、诱发因素和治疗建议。我已经导出了记录文件，请告诉我如何更好地管理我的病情。`;
    
    // 使用移动端应用链接
    const deepSeekAppUrl = `deepseek://chat?message=${encodeURIComponent(message)}`;
    const deepSeekWebFallback = `https://chat.deepseek.com/?text=${encodeURIComponent(message)}`;
    
    // 尝试打开移动应用，失败则使用网页版
    window.location.href = deepSeekAppUrl;
    setTimeout(() => {
      window.open(deepSeekWebFallback, '_blank');
    }, 1000);
    
    toast({
      title: "已跳转到DeepSeek AI",
      description: "请将导出的记录数据粘贴给AI进行分析",
    });
  };

  const handleDoubaoAI = () => {
    const message = `我是梅尼埃症患者，想要分析我的症状记录。请帮我分析症状规律、诱发因素和治疗建议。我已经导出了记录数据，请告诉我如何更好地管理我的病情。`;
    
    // 使用移动端应用链接
    const doubaoAppUrl = `doubao://chat?message=${encodeURIComponent(message)}`;
    const doubaoWebFallback = `https://www.doubao.com/chat/?text=${encodeURIComponent(message)}`;
    
    // 尝试打开移动应用，失败则使用网页版
    window.location.href = doubaoAppUrl;
    setTimeout(() => {
      window.open(doubaoWebFallback, '_blank');
    }, 1000);
    
    toast({
      title: "已跳转到豆包AI",
      description: "请将导出的记录数据粘贴给AI进行分析",
    });
  };

  const copyToClipboard = async (text: string, format: 'json' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      toast({
        title: "复制成功",
        description: `${format === 'json' ? 'JSON格式' : '纯文本格式'}数据已复制到剪贴板`,
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制数据",
        variant: 'destructive'
      });
    }
  };

  // 修复数据获取函数 - 确保正确获取用户数据
  const getRecordsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('用户未登录');
      }

      console.log('获取用户记录，用户ID:', user.id);
      console.log('日期范围:', startDate.toISOString(), '-', endDate.toISOString());

      // 获取所有用户记录
      const { data: records, error: recordsError } = await supabase
        .from('meniere_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (recordsError) {
        console.error('获取记录失败:', recordsError);
        throw recordsError;
      }

      console.log('获取到的记录数量:', records?.length || 0);
      
      // 获取用户打卡记录
      const { data: checkins, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('checkin_date', getBeijingDateString(startDate))
        .lte('checkin_date', getBeijingDateString(endDate))
        .order('checkin_date', { ascending: false });

      if (checkinsError) {
        console.error('获取打卡记录失败:', checkinsError);
      }

      console.log('获取到的打卡记录数量:', checkins?.length || 0);

      // 合并记录，将打卡记录转换为统一格式
      const allRecords = [...(records || [])];
      
      if (checkins && checkins.length > 0) {
        checkins.forEach(checkin => {
          allRecords.push({
            id: `checkin-${checkin.id}`,
            type: 'checkin',
            timestamp: checkin.created_at,
            created_at: checkin.created_at,
            updated_at: checkin.updated_at,
            user_id: checkin.user_id,
            note: checkin.note,
            data: {
              mood_score: checkin.mood_score,
              checkin_date: checkin.checkin_date,
              note: checkin.note
            },
            severity: null,
            duration: null,
            symptoms: null,
            diet: null,
            sleep: null,
            stress: null,
            medications: null,
            dosage: null
          } as any);
        });
      }

      return allRecords;
    } catch (error) {
      console.error('获取数据失败:', error);
      throw error;
    }
  };

  const generateJSONFormat = (records: any[], startDate: string, endDate: string) => {
    const events = records.map(record => {
      // 将时间戳转换为北京时间
      const originalTime = new Date(record.timestamp || record.created_at);
      const beijingTime = new Date(originalTime.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
      const timestamp = beijingTime.toISOString();
      
      if (record.type === 'dizziness') {
        return {
          timestamp,
          eventType: "SymptomLog",
          details: {
            type: "Vertigo",
            durationMinutes: convertDurationToMinutes(record.duration),
            intensity: convertSeverityToNumber(record.severity),
            associatedSymptoms: record.symptoms || []
          }
        };
      } else if (record.type === 'lifestyle') {
        const events = [];
        
        // 饮食记录
        if (record.diet?.length > 0) {
          events.push({
            timestamp,
            eventType: "LifestyleLog",
            details: {
              type: "Diet",
              tags: record.diet
            }
          });
        }
        
        // 睡眠记录
        if (record.sleep) {
          events.push({
            timestamp,
            eventType: "LifestyleLog",
            details: {
              type: "Sleep",
              quality: record.sleep
            }
          });
        }
        
        // 压力记录
        if (record.stress) {
          events.push({
            timestamp,
            eventType: "LifestyleLog",
            details: {
              type: "Stress",
              level: record.stress
            }
          });
        }
        
        return events;
      } else if (record.type === 'medication') {
        return {
          timestamp,
          eventType: "MedicationLog",
          details: {
            medications: record.medications || [],
            dosage: record.dosage
          }
        };
      } else if (record.type === 'voice') {
        return {
          timestamp,
          eventType: "VoiceNote",
          details: {
            note: record.note || record.data?.note
          }
        };
      } else if (record.type === 'checkin') {
        return {
          timestamp,
          eventType: "DailyCheckin",
          details: {
            mood_score: record.data?.mood_score,
            note: record.data?.note
          }
        };
      }
      
      return null;
    }).flat().filter(Boolean);

    // 使用北京时间格式化导出日期范围
    const beijingStartDate = new Date(startDate + 'T00:00:00');
    const beijingEndDate = new Date(endDate + 'T23:59:59');
    
    return {
      patientId: "MeniereUser01",
      exportDateRange: {
        start: new Date(beijingStartDate.toLocaleString("en-US", {timeZone: "Asia/Shanghai"})).toISOString(),
        end: new Date(beijingEndDate.toLocaleString("en-US", {timeZone: "Asia/Shanghai"})).toISOString()
      },
      events
    };
  };

  const generateTextFormat = (records: any[], startDate: string, endDate: string) => {
    let text = `梅尼埃症数据记录 (${startDate} - ${endDate})\n\n`;
    
    // 按日期分组 - 使用北京时间
    const recordsByDate = records.reduce((acc, record) => {
      const originalTime = new Date(record.timestamp || record.created_at);
      const beijingTime = new Date(originalTime.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
      const date = beijingTime.toLocaleDateString('zh-CN');
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {});

    Object.entries(recordsByDate).forEach(([date, dayRecords]: [string, any[]]) => {
      text += `**${date}**\n\n`;
      
      dayRecords.forEach(record => {
        const originalTime = new Date(record.timestamp || record.created_at);
        const beijingTime = new Date(originalTime.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
        const time = beijingTime.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        if (record.type === 'dizziness') {
          text += `- [${time}] 眩晕发作\n`;
          text += `  持续时间: ${record.duration || '未记录'}\n`;
          text += `  严重程度: ${record.severity || '未记录'}\n`;
          if (record.symptoms?.length > 0) {
            text += `  伴随症状: ${record.symptoms.join(', ')}\n`;
          }
        } else if (record.type === 'lifestyle') {
          if (record.diet?.length > 0) {
            text += `- [${time}] 饮食记录: ${record.diet.join(', ')}\n`;
          }
          if (record.sleep) {
            text += `- [${time}] 睡眠质量: ${record.sleep}\n`;
          }
          if (record.stress) {
            text += `- [${time}] 压力水平: ${record.stress}\n`;
          }
        } else if (record.type === 'medication') {
          text += `- [${time}] 用药记录\n`;
          if (record.medications?.length > 0) {
            text += `  药物: ${record.medications.join(', ')}\n`;
          }
          if (record.dosage) {
            text += `  剂量: ${record.dosage}\n`;
          }
        } else if (record.type === 'voice') {
          text += `- [${time}] 语音记事\n`;
          text += `  内容: ${record.note || ''}\n`;
        } else if (record.type === 'checkin') {
          text += `- [${time}] 每日打卡\n`;
          if (record.data?.mood_score) {
            text += `  心情评分: ${record.data.mood_score}/5\n`;
          }
          if (record.data?.note) {
            text += `  备注: ${record.data.note}\n`;
          }
        }
        
        if (record.note && record.type !== 'voice' && record.type !== 'checkin') {
          text += `  备注: ${record.note}\n`;
        }
        
        text += '\n';
      });
      
      text += '\n';
    });

    return text;
  };

  const convertDurationToMinutes = (duration: string): number => {
    if (!duration) return 0;
    if (duration.includes('不到5分钟')) return 3;
    if (duration.includes('5-15分钟')) return 10;
    if (duration.includes('15-30分钟')) return 22;
    if (duration.includes('30分钟-1小时')) return 45;
    if (duration.includes('1-2小时')) return 90;
    if (duration.includes('超过2小时')) return 150;
    return 0;
  };

  const convertSeverityToNumber = (severity: string): number => {
    if (!severity) return 0;
    if (severity === '轻度') return 3;
    if (severity === '中度') return 6;
    if (severity === '重度') return 9;
    return 0;
  };

  const handleExportFormat = async (timeRange: 'week' | 'month' | 'custom', format: 'json' | 'text') => {
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

      const today = getBeijingTime();
      if (endDate > today) {
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
      let startDateStr, endDateStr;
      
      if (timeRange === 'custom') {
        records = await getRecordsByDateRange(
          new Date(customStartDate),
          new Date(customEndDate)
        );
        startDateStr = customStartDate;
        endDateStr = customEndDate;
      } else {
        // 动态计算时间范围 - 使用北京时间
        const now = getBeijingTime();
        const timeLimit = new Date(now);
        
        if (timeRange === 'week') {
          timeLimit.setDate(now.getDate() - 7);
        } else {
          timeLimit.setMonth(now.getMonth() - 1);
        }
        
        records = await getRecordsByDateRange(timeLimit, now);
        startDateStr = getBeijingDateString(timeLimit);
        endDateStr = getBeijingDateString(now);
      }

      console.log('导出的记录数量:', records?.length || 0);

      if (!records || records.length === 0) {
        toast({
          title: '提示',
          description: '选定时间范围内没有记录数据',
        });
        return;
      }

      if (format === 'json') {
        const jsonData = generateJSONFormat(records, startDateStr, endDateStr);
        await copyToClipboard(JSON.stringify(jsonData, null, 2), 'json');
      } else {
        const textData = generateTextFormat(records, startDateStr, endDateStr);
        await copyToClipboard(textData, 'text');
      }

    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
                    最近一周记录
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleExportFormat('week', 'json')}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4"
                  >
                    {copiedFormat === 'json' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {loading ? '导出中...' : '复制给AI的格式 (JSON)'}
                  </Button>
                  
                  <Button
                    onClick={() => handleExportFormat('week', 'text')}
                    disabled={loading}
                    variant="outline"
                    className="w-full py-4"
                  >
                    {copiedFormat === 'text' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {loading ? '导出中...' : '复制给人看的格式 (纯文本)'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    最近一个月记录
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleExportFormat('month', 'json')}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4"
                  >
                    {copiedFormat === 'json' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {loading ? '导出中...' : '复制给AI的格式 (JSON)'}
                  </Button>
                  
                  <Button
                    onClick={() => handleExportFormat('month', 'text')}
                    disabled={loading}
                    variant="outline"
                    className="w-full py-4"
                  >
                    {copiedFormat === 'text' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {loading ? '导出中...' : '复制给人看的格式 (纯文本)'}
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
                    <p>• <strong>JSON格式</strong>：适合复制给AI分析，结构化数据便于AI理解</p>
                    <p>• <strong>纯文本格式</strong>：适合发送给家人或医生查看，人类可读</p>
                    <p>• 数据会自动复制到剪贴板，直接粘贴即可使用</p>
                    <p>• 包含完整的症状、用药、生活记录、每日打卡信息</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI助手咨询 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    AI健康助手咨询 (移动端优先)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleDeepSeekAI}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    DeepSeek AI 健康分析
                  </Button>
                  
                  <Button
                    onClick={handleDoubaoAI}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    豆包AI 健康分析
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    先复制上述格式的数据，再跳转到AI进行专业健康咨询分析
                    <br />
                    <span className="text-blue-600">优先打开移动应用，若无应用则打开网页版</span>
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

                <div className="space-y-3">
                  <Button
                    onClick={() => handleExportFormat('custom', 'json')}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4"
                  >
                    {copiedFormat === 'json' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {loading ? '导出中...' : '复制给AI的格式 (JSON)'}
                  </Button>
                  
                  <Button
                    onClick={() => handleExportFormat('custom', 'text')}
                    disabled={loading}
                    variant="outline"
                    className="w-full py-4"
                  >
                    {copiedFormat === 'text' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {loading ? '导出中...' : '复制给人看的格式 (纯文本)'}
                  </Button>
                </div>

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
              <p><strong>就医前：</strong>复制纯文本格式，便于医生快速了解病情发展</p>
              <p><strong>AI分析：</strong>复制JSON格式给AI，便于深度分析症状规律和诱发因素</p>
              <p><strong>家人分享：</strong>复制纯文本格式，便于家人了解您的健康状况</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataExport;

