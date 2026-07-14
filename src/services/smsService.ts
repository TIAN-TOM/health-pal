
import { supabase } from '@/integrations/supabase/client';
import type { Contact } from './contactsService';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface EmergencySMSData {
  contactId: string;
  message: string;
  location?: LocationData;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(new Error(`获取位置失败: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

export const generateEmergencyMessage = (userName: string, location?: LocationData): string => {
  const baseMessage = `紧急求助！我是${userName}，现在头晕不舒服，需要帮助！请尽快联系我。`;
  
  if (location) {
    const mapUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    return `${baseMessage}\n\n我的位置：${mapUrl}\n发送时间：${new Date().toLocaleString('zh-CN')}`;
  }
  
  return `${baseMessage}\n发送时间：${new Date().toLocaleString('zh-CN')}`;
};

// 审计日志：紧急场景下网络/会话可能失效，写入失败绝不能阻断求助，
// 因此调用方一律 fire-and-forget（见 openEmergencySMS）。
export const logEmergencySMS = async (data: EmergencySMSData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // temp_ 是 contactsService 为缺失 id 的老数据生成的伪 id，写入 uuid 外键列必然失败，跳过。
  if (data.contactId.startsWith('temp_')) return;

  await supabase
    .from('emergency_sms_logs')
    .insert({
      user_id: user.id,
      contact_id: data.contactId,
      message: data.message,
      location_data: data.location ? JSON.parse(JSON.stringify(data.location)) : null
    });
};

// 构造 sms: 深链，支持多收件人（iOS 及多数 Android 接受逗号分隔）。
const buildSmsUrl = (phones: string[], message: string): string | null => {
  const valid = phones.map((p) => p.trim()).filter(Boolean);
  if (valid.length === 0) return null;
  return `sms:${valid.join(',')}?body=${encodeURIComponent(message)}`;
};

/**
 * 唤起系统短信应用，预填求助内容与全部收件人。
 * 关键顺序：先执行纯本地的唤起动作，再 fire-and-forget 写审计日志——
 * 日志失败（弱网/未登录）绝不阻断求助。返回是否成功构造并唤起。
 */
export const openEmergencySMS = (
  contactList: Contact[],
  message: string,
  location?: LocationData
): boolean => {
  const url = buildSmsUrl(contactList.map((c) => c.phone), message);
  if (!url || typeof window === 'undefined') return false;

  window.location.href = url;

  contactList.forEach((contact) => {
    logEmergencySMS({ contactId: contact.id, message, location }).catch((error) =>
      console.error('记录紧急短信日志失败（不影响发送）:', error)
    );
  });

  return true;
};

// 单个联系人的便捷封装，保持既有调用点可用。
export const sendEmergencySMS = (
  contact: Contact,
  message: string,
  location?: LocationData
): boolean => openEmergencySMS([contact], message, location);
