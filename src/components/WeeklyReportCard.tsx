import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  week_start: string;
  summary: string;
  suggestions: string[];
  generated_at: string;
}

/**
 * 首页顶部 AI 周报卡片：仅在周日或已存在本周报表时显示。
 */
const WeeklyReportCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const isSunday = new Date().getDay() === 0;

  const reportQueryKey = ['weekly-report', user?.id] as const;

  const { data: report, isPending } = useQuery({
    queryKey: reportQueryKey,
    queryFn: async (): Promise<Report | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('ai_weekly_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        week_start: data.week_start,
        summary: data.summary,
        suggestions: (data.suggestions as string[]) ?? [],
        generated_at: data.generated_at,
      };
    },
    enabled: !!user,
  });

  const generateMutation = useMutation({
    mutationFn: async (): Promise<{ report: Report; cached: boolean }> => {
      const { data, error } = await supabase.functions.invoke('generate-weekly-report');
      if (error) {
        // 非 2xx 时 FunctionsHttpError.message 是通用字符串，真正的中文提示在响应体里
        const context = (error as { context?: Response }).context;
        if (context && typeof context.json === 'function') {
          const body = await context.json().catch(() => null);
          if (body?.error) throw new Error(body.error);
        }
        throw error;
      }
      if (data?.error) throw new Error(data.error);
      const r = data.report;
      return {
        report: {
          id: r.id,
          week_start: r.week_start,
          summary: r.summary,
          suggestions: (r.suggestions as string[]) ?? [],
          generated_at: r.generated_at,
        },
        cached: Boolean(data.cached),
      };
    },
    onSuccess: ({ report: newReport, cached }) => {
      // 直接写入查询缓存，卡片立即展示最新周报
      queryClient.setQueryData(reportQueryKey, newReport);
      setExpanded(true);
      toast({ title: cached ? '已加载本周周报' : '本周周报已生成' });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : '生成失败';
      toast({ title: '生成失败', description: msg, variant: 'destructive' });
    },
  });

  const loading = generateMutation.isPending;

  // 未登录或首次查询完成前不显示；仅在周日或已有本周报表时显示
  if (!user || isPending) return null;
  if (!isSunday && !report) return null;

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <div className="text-sm font-medium text-foreground truncate">
              AI 健康周报
              {report && (
                <span className="text-xs text-muted-foreground ml-2">
                  {report.week_start} 起
                </span>
              )}
            </div>
          </div>
          {report ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? '收起周报' : '展开周报'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          ) : (
            <Button size="sm" onClick={() => generateMutation.mutate()} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : '生成本周'}
            </Button>
          )}
        </div>

        {report && expanded && (
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-foreground leading-relaxed">{report.summary}</p>
            {report.suggestions.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {report.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground pt-1">
              仅供参考，不构成医疗建议。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyReportCard;
