import React, { useEffect, useState } from 'react';
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
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState(false);

  const isSunday = new Date().getDay() === 0;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('ai_weekly_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setReport({
          id: data.id,
          week_start: data.week_start,
          summary: data.summary,
          suggestions: (data.suggestions as string[]) ?? [],
          generated_at: data.generated_at,
        });
      }
      setChecked(true);
    })();
  }, [user]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-report');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const r = data.report;
      setReport({
        id: r.id,
        week_start: r.week_start,
        summary: r.summary,
        suggestions: (r.suggestions as string[]) ?? [],
        generated_at: r.generated_at,
      });
      setExpanded(true);
      toast({ title: data.cached ? '已加载本周周报' : '本周周报已生成' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '生成失败';
      toast({ title: '生成失败', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // 仅在周日或已有本周报表时显示
  if (!checked) return null;
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
            <Button size="sm" onClick={generate} disabled={loading}>
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
