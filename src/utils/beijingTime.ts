
// 北京时间工具函数 - 统一时间处理
export const getBeijingTime = () => {
  // 直接使用当前时间并转换为北京时区
  const now = new Date();
  // 创建一个新的Date对象，表示北京时间
  const beijingTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
  console.log('原始UTC时间:', now.toISOString());
  console.log('转换后北京时间:', beijingTime.toISOString());
  return beijingTime;
};

// 获取北京时间的日期字符串 (YYYY-MM-DD)
export const getBeijingDateString = (date?: Date) => {
  const targetDate = date || getBeijingTime();
  // 确保使用北京时区
  const beijingTime = new Date(targetDate.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  console.log('生成的北京日期字符串:', dateString);
  return dateString;
};

// 获取北京时间的ISO字符串
export const getBeijingTimeISO = (date?: Date) => {
  const beijingTime = date || getBeijingTime();
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
    
    // 转换为北京时间显示
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
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
  console.log('北京时间日期字符串:', getBeijingDateString());
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
