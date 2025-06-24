
import React, { createContext, useContext } from 'react';

// 简化的语言上下文，只提供中文翻译
interface LanguageContextType {
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
  // 固定的中文翻译
  const translations: { [key: string]: string } = {
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
    'welcome': '欢迎',
    'admin_role': '管理员',
    'user_role': '用户',
    
    // 个人偏好设置
    'user_preferences': '个人偏好设置',
    'basic_info': '基本信息',
    'health_info': '健康信息',
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
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
};
