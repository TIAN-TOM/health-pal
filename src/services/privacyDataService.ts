import { supabase } from '@/integrations/supabase/client';
import { requireUserId } from '@/utils/auth';
import { getBeijingDateString } from '@/utils/beijingTime';
import { isMissingTableError } from '@/services/consentService';

// 隐私中心的数据服务：全量 JSON 导出（APP 12 访问权）与紧急短信记录清理（APP 11）。
// 现有“整理记录给医生”导出面向阅读，这里的导出面向完整性——覆盖用户名下所有表。

type TableRows = unknown[];

interface QueryResult {
  data: TableRows | null;
  error: { code?: string; message: string } | null;
}

export interface FullExport {
  app: 'health-pal';
  format_version: 1;
  exported_at: string;
  user_id: string;
  tables: Record<string, TableRows>;
  export_errors: { table: string; message: string }[];
}

// 单表失败不中断整体导出；表不存在（迁移未应用）时跳过而不是报错
const fetchTable = async (
  table: string,
  query: PromiseLike<QueryResult>
): Promise<{ table: string; rows?: TableRows; message?: string; skipped?: boolean }> => {
  try {
    const { data, error } = await query;
    if (error) {
      if (isMissingTableError(error)) return { table, skipped: true };
      return { table, message: error.message };
    }
    return { table, rows: data ?? [] };
  } catch (e) {
    return { table, message: e instanceof Error ? e.message : String(e) };
  }
};

export const collectFullExport = async (): Promise<FullExport> => {
  const userId = await requireUserId();

  const entries: Array<[string, PromiseLike<QueryResult>]> = [
    ['profiles', supabase.from('profiles').select('*').eq('id', userId)],
    ['user_preferences', supabase.from('user_preferences').select('*').eq('user_id', userId)],
    ['user_consents', supabase.from('user_consents').select('*').eq('user_id', userId)],
    ['meniere_records', supabase.from('meniere_records').select('*').eq('user_id', userId)],
    ['diabetes_records', supabase.from('diabetes_records').select('*').eq('user_id', userId)],
    ['daily_checkins', supabase.from('daily_checkins').select('*').eq('user_id', userId)],
    ['medical_records', supabase.from('medical_records').select('*').eq('user_id', userId)],
    ['user_medications', supabase.from('user_medications').select('*').eq('user_id', userId)],
    ['voice_records', supabase.from('voice_records').select('*').eq('user_id', userId)],
    ['emergency_contacts', supabase.from('emergency_contacts').select('*').eq('user_id', userId)],
    ['emergency_sms_logs', supabase.from('emergency_sms_logs').select('*').eq('user_id', userId)],
    ['weather_alerts', supabase.from('weather_alerts').select('*').eq('user_id', userId)],
    ['ai_weekly_reports', supabase.from('ai_weekly_reports').select('*').eq('user_id', userId)],
    [
      'user_notification_preferences',
      supabase.from('user_notification_preferences').select('*').eq('user_id', userId),
    ],
    ['user_feedback', supabase.from('user_feedback').select('*').eq('user_id', userId)],
    ['user_points', supabase.from('user_points').select('*').eq('user_id', userId)],
    ['points_transactions', supabase.from('points_transactions').select('*').eq('user_id', userId)],
    ['user_purchases', supabase.from('user_purchases').select('*').eq('user_id', userId)],
    ['user_item_inventory', supabase.from('user_item_inventory').select('*').eq('user_id', userId)],
    ['family_members', supabase.from('family_members').select('*').eq('user_id', userId)],
    ['family_expenses', supabase.from('family_expenses').select('*').eq('user_id', userId)],
    ['family_reminders', supabase.from('family_reminders').select('*').eq('user_id', userId)],
    [
      'family_calendar_events',
      supabase.from('family_calendar_events').select('*').eq('user_id', userId),
    ],
    ['family_messages', supabase.from('family_messages').select('*').eq('user_id', userId)],
  ];

  const outcomes = await Promise.all(entries.map(([table, query]) => fetchTable(table, query)));

  const tables: Record<string, TableRows> = {};
  const export_errors: { table: string; message: string }[] = [];
  for (const outcome of outcomes) {
    if (outcome.rows) tables[outcome.table] = outcome.rows;
    else if (outcome.message) export_errors.push({ table: outcome.table, message: outcome.message });
    // skipped 表（未启用）既不进 tables 也不算错误
  }

  return {
    app: 'health-pal',
    format_version: 1,
    exported_at: new Date().toISOString(),
    user_id: userId,
    tables,
    export_errors,
  };
};

export const downloadFullExport = async (): Promise<{ tableCount: number; errorCount: number }> => {
  const exported = await collectFullExport();
  const blob = new Blob([JSON.stringify(exported, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `health-pal-data-${getBeijingDateString()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return { tableCount: Object.keys(exported.tables).length, errorCount: exported.export_errors.length };
};

export const getEmergencySmsLogCount = async (): Promise<number> => {
  const userId = await requireUserId();
  const { count, error } = await supabase
    .from('emergency_sms_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
};

// RLS 没有 DELETE 策略时 delete 会“成功”但影响 0 行——删除后必须复查剩余数，
// 拿 remaining 告诉调用方有没有真的删掉，而不是直接谎报成功。
export const deleteAllEmergencySmsLogs = async (): Promise<{ remaining: number }> => {
  const userId = await requireUserId();
  const { error } = await supabase.from('emergency_sms_logs').delete().eq('user_id', userId);
  if (error) throw error;
  const remaining = await getEmergencySmsLogCount();
  return { remaining };
};
