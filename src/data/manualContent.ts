
export interface ManualSection {
  id: string;
  title: string;
  content: string;
  section: string;
  order_index: number;
  icon?: string;
}

export const manualSections: ManualSection[] = [
  // 入门指南
  {
    id: 'getting-started-1',
    title: '欢迎使用健康管理助手',
    content: '这是一个专为您设计的健康管理应用，帮助您记录和追踪日常健康状况。通过简单易用的界面，您可以轻松记录各种健康数据，并获得有价值的健康洞察。',
    section: '入门指南',
    order_index: 1,
    icon: 'Heart'
  },
  {
    id: 'getting-started-2',
    title: '首次使用设置',
    content: '首次使用时，建议您先完善个人资料，设置紧急联系人，然后开始您的第一次每日打卡。这样可以建立完整的健康档案，让记录更加准确有意义。',
    section: '入门指南',
    order_index: 2,
    icon: 'Settings'
  },
  {
    id: 'getting-started-3',
    title: '主界面介绍',
    content: '主界面包含每日打卡、各种健康记录功能卡片、紧急帮助按钮和设置入口。界面设计简洁明了，所有功能都可以轻松找到和使用。',
    section: '入门指南',
    order_index: 3,
    icon: 'Layout'
  },

  // 核心功能
  {
    id: 'core-1',
    title: '每日打卡功能',
    content: '每日打卡是记录您整体健康状况的核心功能。您可以评分当天的心情状态（1-5分），记录特殊事件或感受，建立连续的健康记录习惯。',
    section: '核心功能',
    order_index: 10,
    icon: 'Calendar'
  },
  {
    id: 'core-2',
    title: '眩晕症状记录',
    content: '专门用于记录眩晕相关症状的功能。可以详细记录眩晕的持续时间、严重程度、伴随症状等信息，帮助医生更好地了解您的病情变化。',
    section: '核心功能',
    order_index: 11,
    icon: 'Activity'
  },
  {
    id: 'core-3',
    title: '血糖情况记录',
    content: '记录血糖测量数据，包括测量时间（餐前/餐后/空腹/睡前）、血糖值、胰岛素使用情况、相关饮食和运动信息。支持趋势分析和数据导出。',
    section: '核心功能',
    order_index: 12,
    icon: 'TrendingUp'
  },
  {
    id: 'core-4',
    title: '饮食与作息记录',
    content: '全面记录您的日常生活习惯，包括饮食内容、睡眠质量、压力水平等。这些信息有助于发现生活习惯与健康状况之间的关联。',
    section: '核心功能',
    order_index: 13,
    icon: 'Home'
  },
  {
    id: 'core-5',
    title: '用药情况记录',
    content: '详细记录服用的药物、剂量、时间等信息。可以设置用药提醒，确保按时按量服药，同时为医生诊疗提供准确的用药记录。',
    section: '核心功能',
    order_index: 14,
    icon: 'Pill'
  },

  // 高级功能
  {
    id: 'advanced-1',
    title: '医疗记录管理',
    content: '集中管理您的就诊记录、诊断结果、处方信息等重要医疗文档。支持添加照片、扫描件等多媒体内容，建立完整的电子病历。',
    section: '高级功能',
    order_index: 20,
    icon: 'FileText'
  },
  {
    id: 'advanced-2',
    title: '数据导出功能',
    content: '支持将您的健康数据导出为多种格式（文本、JSON等），方便与医生分享或进行个人分析。导出内容包括所有记录类型的详细信息。',
    section: '高级功能',
    order_index: 21,
    icon: 'Download'
  },
  {
    id: 'advanced-3',
    title: '日历视图',
    content: '以日历形式展示您的健康记录，可以直观地查看某个时间段的记录情况，快速定位特定日期的健康状况。',
    section: '高级功能',
    order_index: 22,
    icon: 'Calendar'
  },
  {
    id: 'advanced-4',
    title: '历史记录查看',
    content: '提供强大的历史记录查询功能，支持按日期、类型筛选，查看详细的记录内容，分析健康趋势和规律。',
    section: '高级功能',
    order_index: 23,
    icon: 'History'
  },

  // 安全与联系
  {
    id: 'safety-1',
    title: '紧急帮助功能',
    content: '当您感到身体不适需要帮助时，可以使用"我需要帮助"功能。系统会显示紧急应对指南，并提供快速联系家人的方式。',
    section: '安全与联系',
    order_index: 30,
    icon: 'AlertCircle'
  },
  {
    id: 'safety-2',
    title: '紧急联系人设置',
    content: '设置家人或朋友的联系方式，在紧急情况下可以快速拨打电话或发送求助短信。建议设置2-3个可靠的紧急联系人。',
    section: '安全与联系',
    order_index: 31,
    icon: 'Phone'
  },
  {
    id: 'safety-3',
    title: '数据安全保护',
    content: '您的所有健康数据都经过加密存储，只有您本人可以访问。我们严格保护您的隐私，不会向第三方泄露任何个人信息。',
    section: '安全与联系',
    order_index: 32,
    icon: 'Shield'
  },

  // 个性化设置
  {
    id: 'settings-1',
    title: '个人资料管理',
    content: '在设置中可以完善和修改您的个人信息，包括姓名、年龄、身高体重等基本信息，以及过敏史、既往病史等医疗信息。',
    section: '个性化设置',
    order_index: 40,
    icon: 'User'
  },
  {
    id: 'settings-2',
    title: '偏好设置',
    content: '根据个人喜好调整应用的使用体验，包括界面主题、通知设置、数据显示偏好等，让应用更符合您的使用习惯。',
    section: '个性化设置',
    order_index: 41,
    icon: 'Sliders'
  },
  {
    id: 'settings-3',
    title: '药物管理',
    content: '维护您的常用药物清单，设置用药提醒，管理药物库存。这个功能帮助您更好地管理日常用药，避免漏服或重复服药。',
    section: '个性化设置',
    order_index: 42,
    icon: 'Pill'
  }
];
