
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh-CN' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred_language');
    return (saved as Language) || 'zh-CN';
  });

  useEffect(() => {
    localStorage.setItem('preferred_language', language);
  }, [language]);

  const translations = {
    'zh-CN': {
      // 通用
      'save': '保存',
      'saving': '保存中...',
      'loading': '加载中...',
      'back': '返回',
      'cancel': '取消',
      'delete': '删除',
      'edit': '编辑',
      'success': '成功',
      'error': '错误',
      'required': '必填',
      'optional': '可选',
      'please_select': '请选择',
      
      // 个人偏好设置
      'user_preferences': '个人偏好设置',
      'basic_info': '基本信息',
      'health_info': '健康信息',
      'system_settings': '系统设置',
      'preferences_saved': '偏好设置已保存',
      'preferences_save_failed': '保存失败，请重试',
      
      // 基本信息字段
      'age': '年龄',
      'age_placeholder': '如：30',
      'gender': '性别',
      'male': '男',
      'female': '女',
      'other': '其他',
      'prefer_not_to_say': '不愿透露',
      'height': '身高 (cm)',
      'height_placeholder': '如：170',
      'weight': '体重 (kg)',
      'weight_placeholder': '如：65.5',
      
      // 健康信息字段
      'medical_history': '既往病史',
      'medical_history_placeholder': '请用逗号分隔，如：高血压，糖尿病',
      'allergies': '过敏史',
      'allergies_placeholder': '请用逗号分隔，如：青霉素，花粉',
      
      // 系统设置字段
      'preferred_language': '首选语言',
      'timezone': '时区',
      'simplified_chinese': '简体中文',
      'traditional_chinese': '繁体中文',
      'english': 'English',
      'beijing_time': '北京时间 (UTC+8)',
      'hongkong_time': '香港时间 (UTC+8)',
      'taipei_time': '台北时间 (UTC+8)',
      'utc_time': '协调世界时 (UTC)',
    },
    'en': {
      // Common
      'save': 'Save',
      'saving': 'Saving...',
      'loading': 'Loading...',
      'back': 'Back',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'success': 'Success',
      'error': 'Error',
      'required': 'Required',
      'optional': 'Optional',
      'please_select': 'Please select',
      
      // User Preferences
      'user_preferences': 'User Preferences',
      'basic_info': 'Basic Information',
      'health_info': 'Health Information',
      'system_settings': 'System Settings',
      'preferences_saved': 'Preferences saved successfully',
      'preferences_save_failed': 'Save failed, please try again',
      
      // Basic info fields
      'age': 'Age',
      'age_placeholder': 'e.g.: 30',
      'gender': 'Gender',
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'prefer_not_to_say': 'Prefer not to say',
      'height': 'Height (cm)',
      'height_placeholder': 'e.g.: 170',
      'weight': 'Weight (kg)',
      'weight_placeholder': 'e.g.: 65.5',
      
      // Health info fields
      'medical_history': 'Medical History',
      'medical_history_placeholder': 'Separate with commas, e.g.: Hypertension, Diabetes',
      'allergies': 'Allergies',
      'allergies_placeholder': 'Separate with commas, e.g.: Penicillin, Pollen',
      
      // System settings fields
      'preferred_language': 'Preferred Language',
      'timezone': 'Timezone',
      'simplified_chinese': '简体中文',
      'traditional_chinese': '繁体中文',
      'english': 'English',
      'beijing_time': 'Beijing Time (UTC+8)',
      'hongkong_time': 'Hong Kong Time (UTC+8)',
      'taipei_time': 'Taipei Time (UTC+8)',
      'utc_time': 'Coordinated Universal Time (UTC)',
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
