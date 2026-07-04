import React, { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Prefs {
  email_reminders_enabled: boolean;
  checkin_streak: boolean;
  medication: boolean;
  medical_followup: boolean;
  family_calendar: boolean;
}

const DEFAULTS: Prefs = {
  email_reminders_enabled: true,
  checkin_streak: true,
  medication: true,
  medical_followup: true,
  family_calendar: true,
};

const ROWS: { key: keyof Prefs; label: string; desc: string }[] = [
  { key: 'checkin_streak', label: '连续未打卡提醒', desc: '连续 3 天未打卡时提醒你回来记录' },
  { key: 'medication', label: '用药提醒', desc: '当日提醒服用已配置的药物' },
  { key: 'medical_followup', label: '复诊提醒', desc: '24 小时内的复诊日期前发送提醒' },
  { key: 'family_calendar', label: '家庭日程提醒', desc: '24 小时内的家庭日历事件提醒' },
];

const NotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          email_reminders_enabled: data.email_reminders_enabled,
          checkin_streak: data.checkin_streak,
          medication: data.medication,
          medical_followup: data.medical_followup,
          family_calendar: data.family_calendar,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const update = async (patch: Partial<Prefs>) => {
    if (!user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert({ user_id: user.id, ...next }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) {
      toast({ title: '保存失败', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          通知偏好
          {saving && <Loader2 className="h-3 w-3 ml-2 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="font-medium text-sm">邮件提醒总开关</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              关闭后将停止所有邮件提醒；分类开关仅在总开关打开时生效。
            </div>
          </div>
          <Switch
            checked={prefs.email_reminders_enabled}
            disabled={loading}
            onCheckedChange={(v) => update({ email_reminders_enabled: v })}
            aria-label="邮件提醒总开关"
          />
        </div>

        <div className="border-t pt-3 space-y-3">
          {ROWS.map((row) => (
            <div key={row.key} className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm">{row.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{row.desc}</div>
              </div>
              <Switch
                checked={prefs[row.key] as boolean}
                disabled={loading || !prefs.email_reminders_enabled}
                onCheckedChange={(v) => update({ [row.key]: v } as Partial<Prefs>)}
                aria-label={row.label}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground pt-2 border-t">
          调度任务每天早 8 点（北京时间）扫描一次；同一用户 24 小时内最多收到一封提醒邮件。
        </p>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
