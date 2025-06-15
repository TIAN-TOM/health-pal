
// 统一的北京时间工具函数
export const getBeijingTime = (date: Date = new Date()) => {
  // 获取UTC时间戳，然后加上8小时（北京时间是UTC+8）
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
  const beijingTime = new Date(utcTime + (8 * 60 * 60 * 1000));
  return beijingTime;
};

// 获取北京时间的日期字符串 (YYYY-MM-DD)
export const getBeijingDateString = (date: Date = new Date()) => {
  const beijingTime = getBeijingTime(date);
  return beijingTime.toISOString().split('T')[0];
};

// 获取北京时间的ISO字符串
export const getBeijingTimeISO = (date: Date = new Date()) => {
  const beijingTime = getBeijingTime(date);
  return beijingTime.toISOString();
};

// 格式化北京时间显示
export const formatBeijingTime = (dateString: string) => {
  try {
    if (!dateString) {
      return '未知时间';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '时间格式错误';
    }
    
    // 直接使用传入的时间（已经是北京时间）
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('日期格式化失败:', error, '原始日期:', dateString);
    return '时间格式错误';
  }
};

// 获取当前北京时间并打印日志
export const getCurrentBeijingTime = () => {
  const beijingTime = getBeijingTime();
  console.log('当前北京时间:', beijingTime.toISOString(), '本地时间:', new Date().toISOString());
  return beijingTime;
};
