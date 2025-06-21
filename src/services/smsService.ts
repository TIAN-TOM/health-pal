
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

export const logEmergencySMS = async (data: EmergencySMSData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('用户未登录');

  const { error } = await supabase
    .from('emergency_sms_logs')
    .insert({
      user_id: user.id,
      contact_id: data.contactId,
      message: data.message,
      location_data: data.location || null
    });

  if (error) throw error;
};

export const sendEmergencySMS = async (
  contact: Contact, 
  message: string, 
  location?: LocationData
): Promise<boolean> => {
  try {
    // 记录短信日志
    await logEmergencySMS({
      contactId: contact.id,
      message,
      location
    });

    // 在实际应用中，这里应该调用短信发送API
    // 现在我们模拟发送过程
    console.log('发送紧急短信:', {
      to: contact.phone,
      message,
      location
    });

    // 尝试使用系统的短信功能
    if (typeof window !== 'undefined' && 'navigator' in window) {
      try {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
        return true;
      } catch (error) {
        console.error('无法打开短信应用:', error);
        // fallback: 复制到剪贴板
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(message);
        }
        return true;
      }
    }

    return true;
  } catch (error) {
    console.error('发送紧急短信失败:', error);
    throw error;
  }
};
