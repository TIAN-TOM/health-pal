
// 北京时间工具函数 - 统一时间处理
export const getBeijingTime = () => {
  const now = new Date();
  // 获取北京时间（UTC+8）
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  console.log('当前北京时间:', beijingTime.toISOString());
  return beijingTime;
};

// 获取北京时间的日期字符串 (YYYY-MM-DD)
export const getBeijingDateString = (date?: Date) => {
  const targetDate = date || getBeijingTime();
  
  // 确保使用北京时间
  const beijingDate = new Date(targetDate.getTime() + (8 * 60 * 60 * 1000));
  const year = beijingDate.getUTCFullYear();
  const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(beijingDate.getUTCDate()).padStart(2, '0');
  
  const dateString = `${year}-${month}-${day}`;
  console.log('生成的北京日期字符串:', dateString);
  return dateString;
};

// 获取北京时间的ISO字符串
export const getBeijingTimeISO = (date?: Date) => {
  const targetDate = date || getBeijingTime();
  const beijingTime = new Date(targetDate.getTime() + (8 * 60 * 60 * 1000));
  const isoString = beijingTime.toISOString();
  console.log('北京时间ISO字符串:', isoString);
  return isoString;
};

// 格式化北京时间显示 - 统一格式
export const formatBeijingTime = (dateString: string) => {
  try {
    if (!dateString) {
      return '未知时间';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '时间格式错误';
    }
    
    // 转换为北京时间显示 - 使用统一格式
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
  const today = getTodayBeijingDate();
  console.log('比较日期:', dateString, '今天:', today);
  return dateString === today;
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
  const beijingTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  const year = beijingTime.getUTCFullYear();
  const month = beijingTime.getUTCMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return {
    start: getBeijingDateString(firstDay),
    end: getBeijingDateString(lastDay)
  };
};

// 删除所有打卡记录的函数
export const deleteAllCheckins = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const { error } = await supabase
    .from('daily_checkins')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`删除打卡记录失败: ${error.message}`);
  }

  console.log('所有打卡记录已删除');
};

// 统一的北京时间显示格式
export const formatBeijingDateTime = (date: Date = getBeijingTime()) => {
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};
