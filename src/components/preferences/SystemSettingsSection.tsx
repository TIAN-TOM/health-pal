
import React from 'react';
import { Globe } from 'lucide-react';

// 简化的系统设置组件，移除时区和语言选择
const SystemSettingsSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-3">
        <Globe className="h-5 w-5 mr-2 text-green-600" />
        <h3 className="text-lg font-medium">系统设置</h3>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>语言: 简体中文</p>
        <p>时区: 北京时间 (UTC+8)</p>
      </div>
    </div>
  );
};

export default SystemSettingsSection;
