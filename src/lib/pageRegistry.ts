// 伪路由页面注册表：PageRenderer 的每个 case 在这里都有唯一 ID。
// currentPage 同步到 URL 的 ?page= 参数，返回键/刷新/深链依赖这份白名单。
// 注意 'familyDashboard' 是历史遗留的 camelCase，改名会破坏全仓的导航字符串，保持原样。

export const PAGE_TITLES = {
  'home': '首页',
  'checkin': '每日打卡',
  'record-hub': '健康记录',
  'breathing': '呼吸练习',
  'voice': '语音记录',
  'games': '休闲游戏',
  'record-detail': '记录详情',
  'settings': '设置',
  'profile': '个人资料',
  'medical-records': '医疗记录',
  'emergency-contacts': '紧急联系人',
  'education': '健康知识',
  'medications': '用药管理',
  'emergency': '紧急模式',
  'user-manual': '使用手册',
  'update-log': '更新日志',
  'admin-panel': '管理后台',
  'familyDashboard': '家庭空间',
  'family-expenses': '家庭开支',
  'family-reminders': '家庭提醒',
  'enhanced-family-calendar': '家庭日历',
  'family-members': '家庭成员',
  'family-messages': '家庭留言',
  'family-stats': '家庭统计',
  'exchange-rate': '汇率查询',
  'english': '每日英语',
  'daily-data': '每日数据',
  'export': '数据导出',
  'dizziness-record': '眩晕记录',
  'diabetes-record': '血糖记录',
  'lifestyle-record': '生活记录',
  'medication-record': '用药记录',
  'user-feedback': '意见反馈',
  'privacy-center': '隐私与数据',
} as const;

export type PageId = keyof typeof PAGE_TITLES;

export const isPageId = (value: string): value is PageId =>
  Object.prototype.hasOwnProperty.call(PAGE_TITLES, value);

export const APP_NAME = '健康生活伴侣';

export const getPageTitle = (page: PageId): string =>
  page === 'home' ? `${APP_NAME} - 专注于日常健康管理` : `${PAGE_TITLES[page]} - ${APP_NAME}`;
