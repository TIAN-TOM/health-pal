
export const traditionalFestivals = {
  solar: {
    '01-01': '元旦',
    '01-15': '小年',
    '02-14': '情人节',
    '03-08': '妇女节',
    '03-12': '植树节',
    '04-01': '愚人节',
    '04-05': '清明节',
    '05-01': '劳动节',
    '05-04': '青年节',
    '06-01': '儿童节',
    '07-01': '建党节',
    '08-01': '建军节',
    '09-10': '教师节',
    '10-01': '国庆节',
    '11-11': '双十一',
    '12-25': '圣诞节',
    '12-31': '除夕'
  },
  lunar: {
    '1-1': '春节',
    '1-15': '元宵节',
    '2-2': '龙抬头',
    '3-3': '上巳节',
    '4-8': '浴佛节',
    '5-5': '端午节',
    '6-24': '观莲节',
    '7-7': '七夕节',
    '7-15': '中元节',
    '8-15': '中秋节',
    '9-9': '重阳节',
    '10-1': '寒衣节',
    '10-15': '下元节',
    '12-8': '腊八节',
    '12-23': '小年'
  }
};

export const solarTerms = [
  { name: '立春', date: '02-04' },
  { name: '雨水', date: '02-19' },
  { name: '惊蛰', date: '03-06' },
  { name: '春分', date: '03-21' },
  { name: '清明', date: '04-05' },
  { name: '谷雨', date: '04-20' },
  { name: '立夏', date: '05-06' },
  { name: '小满', date: '05-21' },
  { name: '芒种', date: '06-06' },
  { name: '夏至', date: '06-21' },
  { name: '小暑', date: '07-07' },
  { name: '大暑', date: '07-23' },
  { name: '立秋', date: '08-08' },
  { name: '处暑', date: '08-23' },
  { name: '白露', date: '09-08' },
  { name: '秋分', date: '09-23' },
  { name: '寒露', date: '10-08' },
  { name: '霜降', date: '10-23' },
  { name: '立冬', date: '11-07' },
  { name: '小雪', date: '11-22' },
  { name: '大雪', date: '12-07' },
  { name: '冬至', date: '12-21' },
  { name: '小寒', date: '01-06' },
  { name: '大寒', date: '01-20' }
];

export const getFestivalForDate = (date: Date): string[] => {
  const festivals: string[] = [];
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  // 检查公历节日
  if (traditionalFestivals.solar[monthDay]) {
    festivals.push(traditionalFestivals.solar[monthDay]);
  }
  
  // 检查二十四节气
  const solarTerm = solarTerms.find(term => term.date === monthDay);
  if (solarTerm) {
    festivals.push(solarTerm.name);
  }
  
  // 农历节日需要农历库支持，这里暂时返回公历节日
  // 去重：如果数组中已有相同的节日，不再添加
  return [...new Set(festivals)];
};

export const getLunarDate = (date: Date): string => {
  // 简化版农历显示，实际项目中需要使用专门的农历转换库
  const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', 
                      '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  
  // 这里是简化的农历计算，实际应该使用准确的农历转换算法
  const month = date.getMonth();
  const day = date.getDate() % 30;
  
  return `${lunarMonths[month]}${lunarDays[day]}`;
};
