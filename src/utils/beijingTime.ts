
// 北京时间工具函数 - 统一时间处理
// 原则：时间戳（created_at/updated_at 等）存真 UTC，展示层再按北京时间格式化；
// 日期字段（checkin_date 等）统一使用北京日历日（getBeijingDateString）。

// 获取"北京墙上时钟"的伪时间对象：把当前时刻平移，使本地 getters
// （getFullYear/getMonth/getDate/getHours...）读出北京时间的年月日时分。
// 仅用于历法计算和展示，不能调用 toISOString() 或当作真实时间戳存储。
export const getBeijingTime = () => {
  const now = new Date();
  // 获取北京时间（UTC+8）
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 60 * 60 * 1000));
};

// 获取北京时间的日期字符串 (YYYY-MM-DD)
// 不传参：返回当前的北京日历日（任何设备时区下都正确）；
// 传参：读取该 Date 的本地历法字段（配合 getBeijingTime 的伪时间或本地历法日期做日期运算）
export const getBeijingDateString = (date?: Date) => {
  const targetDate = date || getBeijingTime();
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// 获取当前时刻的 ISO 时间戳（真 UTC）
// 存真 UTC，展示层用北京时间（formatBeijingTime 等）格式化。
// 注意：以前这里对伪时间调用 toISOString()，在非 UTC+8 设备上会偏差 (8h - 设备时区偏移)。
export const getBeijingTimeISO = () => {
  return new Date().toISOString();
};

// 把任意真实时间戳（UTC）换算为北京日历日 YYYY-MM-DD。
// 与 getBeijingDateString(date) 不同：后者读本地历法字段，只适用于伪时间；
// 这个函数用于对存库的真 UTC timestamp 归桶到北京日，任何设备时区都正确。
export const getBeijingDayOf = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  // en-CA 输出 YYYY-MM-DD
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
};

// 北京日 YYYY-MM-DD 对应的 UTC 时间窗口（含首尾），用于对 timestamptz 列做范围查询。
// 北京日 D = [D 00:00 +08:00, D 23:59:59.999 +08:00]。
export const beijingDayToUtcRange = (startDay: string, endDay: string) => ({
  startUtc: `${startDay}T00:00:00.000+08:00`,
  endUtc: `${endDay}T23:59:59.999+08:00`,
});

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
  return dateString === getTodayBeijingDate();
};

// 获取当前北京时间
export const getCurrentBeijingTime = () => {
  return getBeijingTime();
};

// 获取月份的第一天和最后一天（北京时间）
export const getMonthRange = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
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
// 传入真实时间戳即可，timeZone 选项负责换算北京时间；
// 不要传入 getBeijingTime() 的伪时间，否则会双重偏移。
export const formatBeijingDateTime = (date: Date = new Date()) => {
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
