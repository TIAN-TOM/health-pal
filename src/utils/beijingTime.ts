
// 北京时间工具函数 - 统一时间处理
export const getBeijingTime = () => {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
};

// 获取北京时间的日期字符串 (YYYY-MM-DD)
export const getBeijingDateString = (date?: Date) => {
  const beijingTime = date ? new Date(date.toLocaleString("en-US", {timeZone: "Asia/Shanghai"})) : getBeijingTime();
  return beijingTime.toISOString().split('T')[0];
};

// 获取北京时间的ISO字符串
export const getBeijingTimeISO = (date?: Date) => {
  const beijingTime = date ? new Date(date.toLocaleString("en-US", {timeZone: "Asia/Shanghai"})) : getBeijingTime();
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
    
    // 转换为北京时间
    const beijingTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
    
    return beijingTime.toLocaleString('zh-CN', {
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

// 获取今天的北京时间日期
export const getTodayBeijingDate = () => {
  return getBeijingDateString();
};

// 检查是否是今天（北京时间）
export const isToday = (dateString: string) => {
  return dateString === getTodayBeijingDate();
};

// 获取当前北京时间并打印日志
export const getCurrentBeijingTime = () => {
  const beijingTime = getBeijingTime();
  console.log('当前北京时间:', beijingTime.toISOString());
  return beijingTime;
};

// 获取月份的第一天和最后一天（北京时间）
export const getMonthRange = (date: Date) => {
  const beijingTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
  const year = beijingTime.getFullYear();
  const month = beijingTime.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return {
    start: getBeijingDateString(firstDay),
    end: getBeijingDateString(lastDay)
  };
};
