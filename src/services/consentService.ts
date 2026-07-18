import { supabase } from '@/integrations/supabase/client';
import { requireUserId } from '@/utils/auth';

// 健康数据收集同意：版本化、只追加。同意文案或收集范围发生实质变化时提升版本号，
// 已同意旧版本的用户会被要求重新确认。
export const HEALTH_DATA_CONSENT_TYPE = 'health_data_collection';
export const HEALTH_DATA_CONSENT_VERSION = '2026-07-18';

export type ConsentStatus =
  | { status: 'granted'; consentedAt: string }
  | { status: 'required' }
  | { status: 'unavailable' };

export const healthDataConsentQueryKey = (userId?: string) =>
  ['health-data-consent', userId] as const;

// user_consents 迁移尚未应用到线上时（表不存在），同意功能视为未启用，
// 不能因此把整个应用锁在同意门后。
const isMissingTableError = (error: { code?: string; message?: string }): boolean =>
  error.code === '42P01' ||
  error.code === 'PGRST205' ||
  /schema cache|does not exist/i.test(error.message ?? '');

export const getHealthDataConsentStatus = async (): Promise<ConsentStatus> => {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('user_consents')
    .select('consent_version, granted, created_at')
    .eq('user_id', userId)
    .eq('consent_type', HEALTH_DATA_CONSENT_TYPE)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    if (isMissingTableError(error)) return { status: 'unavailable' };
    throw error;
  }

  const latest = data?.[0];
  if (latest?.granted && latest.consent_version === HEALTH_DATA_CONSENT_VERSION) {
    return { status: 'granted', consentedAt: latest.created_at };
  }
  return { status: 'required' };
};

export const recordHealthDataConsent = async (granted: boolean): Promise<void> => {
  const userId = await requireUserId();
  const { error } = await supabase.from('user_consents').insert({
    user_id: userId,
    consent_type: HEALTH_DATA_CONSENT_TYPE,
    consent_version: HEALTH_DATA_CONSENT_VERSION,
    granted,
    user_agent: typeof navigator === 'undefined' ? null : navigator.userAgent.slice(0, 255),
  });
  if (error) throw error;
};
