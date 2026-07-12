
// 连续打卡天数计算 - 纯函数，便于单元测试
// 日期一律使用 YYYY-MM-DD 字符串，内部只用 UTC 做日期加减，
// 避免本地时区与 UTC 混用在负时区（如美洲）下产生偏差

export interface CheckinRecordLike {
  checkin_date: string;
}

// 计算给定日期字符串的前一天（全程使用 UTC 解析与读取，结果与运行环境时区无关）
const previousDay = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 计算连续打卡天数
 * @param records 打卡记录（只需包含 checkin_date，格式 YYYY-MM-DD）
 * @param todayStr "今天"的日期字符串，调用方应传入 getBeijingDateString()（北京时间的今天）
 * @returns 连续打卡天数；今天未打卡时从昨天起算，不打断已有连击
 */
export const calculateStreak = (records: CheckinRecordLike[], todayStr: string): number => {
  const checkedDates = new Set(records.map(record => record.checkin_date));

  // 今天已打卡则从今天开始数，否则从昨天开始数
  let cursor = checkedDates.has(todayStr) ? todayStr : previousDay(todayStr);

  let streak = 0;
  while (checkedDates.has(cursor)) {
    streak++;
    cursor = previousDay(cursor);
  }

  return streak;
};
