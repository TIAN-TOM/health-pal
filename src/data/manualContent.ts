
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
    title: '欢迎使用健康生活助手',
    content: '这是一个全面的健康管理应用，帮助您记录和追踪日常健康状况。无论您是想要管理特定的健康问题，还是想要养成良好的健康习惯，这个应用都能为您提供专业的记录和分析工具。',
    section: '入门指南',
    order_index: 1,
    icon: 'Heart'
  },
  {
    id: 'getting-started-2',
    title: '首次使用设置',
    content: '首次使用时，建议您先完善个人资料，包括基本信息和健康状况。然后设置紧急联系人，确保在需要时能够及时获得帮助。接下来可以开始您的第一次每日打卡，建立健康记录习惯。',
    section: '入门指南',
    order_index: 2,
    icon: 'Settings'
  },
  {
    id: 'getting-started-3',
    title: '主界面导航',
    content: '主界面采用简洁的卡片式设计，包含每日打卡、各种健康记录功能、紧急帮助按钮和个人设置入口。每个功能都配有直观的图标和描述，让您能够快速找到所需的功能。',
    section: '入门指南',
    order_index: 3,
    icon: 'Layout'
  },

  // 日常记录功能
  {
    id: 'daily-1',
    title: '每日打卡功能',
    content: '每日打卡是建立健康习惯的核心功能。您可以记录当天的整体状态、心情评分（1-5分）、特殊事件或感受。坚持每日打卡能够帮助您更好地了解自己的健康规律。',
    section: '日常记录功能',
    order_index: 10,
    icon: 'Calendar'
  },
  {
    id: 'daily-2',
    title: '眩晕症状记录',
    content: '专门用于记录眩晕、头晕等症状的详细信息。包括症状的持续时间、严重程度、触发因素、伴随症状等。这些详细记录有助于您和医生分析症状的规律和可能的原因。',
    section: '日常记录功能',
    order_index: 11,
    icon: 'Activity'
  },
  {
    id: 'daily-3',
    title: '血糖情况记录',
    content: '全面记录血糖监测数据，包括测量时间（餐前/餐后/空腹/睡前）、血糖数值、用药情况、饮食和运动信息。支持数据趋势分析，帮助您更好地管理血糖水平。',
    section: '日常记录功能',
    order_index: 12,
    icon: 'TrendingUp'
  },
  {
    id: 'daily-4',
    title: '生活方式记录',
    content: '记录日常生活的各个方面，包括饮食习惯、睡眠质量、运动情况、压力水平等。通过长期记录，您可以发现生活方式与健康状况之间的关联，从而做出更好的健康选择。',
    section: '日常记录功能',
    order_index: 13,
    icon: 'Home'
  },
  {
    id: 'daily-5',
    title: '用药情况记录',
    content: '详细记录各种药物的服用情况，包括药物名称、剂量、服用时间、效果评价等。可以设置用药提醒，确保按时按量服药，为医生诊疗提供准确的用药记录。',
    section: '日常记录功能',
    order_index: 14,
    icon: 'Pill'
  },

  // 数据管理与分析
  {
    id: 'data-1',
    title: '历史记录查看',
    content: '提供强大的历史记录查询功能，支持按日期、记录类型、关键词等条件筛选。您可以查看详细的记录内容，分析健康趋势，发现规律和模式。',
    section: '数据管理与分析',
    order_index: 20,
    icon: 'History'
  },
  {
    id: 'data-2',
    title: '日历视图',
    content: '以直观的日历形式展示您的健康记录，可以快速查看某个时间段的记录情况，识别特定日期的健康状况，方便进行时间序列分析。',
    section: '数据管理与分析',
    order_index: 21,
    icon: 'Calendar'
  },
  {
    id: 'data-3',
    title: '数据导出功能',
    content: '支持将您的健康数据导出为多种格式（文本、JSON等），方便与医生分享、个人分析或备份。导出内容包括所有记录类型的完整信息，确保数据的完整性。',
    section: '数据管理与分析',
    order_index: 22,
    icon: 'Download'
  },
  {
    id: 'data-4',
    title: '每日数据中心',
    content: '集中展示您的每日健康数据，包括各种记录的汇总信息、趋势图表、统计分析等。帮助您从整体角度了解自己的健康状况。',
    section: '数据管理与分析',
    order_index: 23,
    icon: 'BarChart'
  },

  // 医疗与健康管理
  {
    id: 'medical-1',
    title: '医疗记录管理',
    content: '集中管理您的就诊记录、诊断结果、处方信息、检查报告等重要医疗文档。支持添加照片、扫描件等多媒体内容，建立完整的电子健康档案。',
    section: '医疗与健康管理',
    order_index: 30,
    icon: 'FileText'
  },
  {
    id: 'medical-2',
    title: '药物管理系统',
    content: '维护您的常用药物清单，设置用药提醒，管理药物库存。包括药物信息录入、服用记录、效果评价、副作用记录等完整的药物管理功能。',
    section: '医疗与健康管理',
    order_index: 31,
    icon: 'Pill'
  },
  {
    id: 'medical-3',
    title: '健康教育中心',
    content: '提供丰富的健康知识和教育资源，包括疾病预防、健康生活方式、急救知识等。定期更新的内容帮助您提高健康素养，做出明智的健康决策。',
    section: '医疗与健康管理',
    order_index: 32,
    icon: 'BookOpen'
  },

  // 紧急与安全功能
  {
    id: 'emergency-1',
    title: '紧急帮助功能',
    content: '当您感到身体不适需要帮助时，可以使用"我需要帮助"功能。系统会提供紧急应对指南，显示您的重要医疗信息，并提供快速联系紧急联系人的方式。',
    section: '紧急与安全功能',
    order_index: 40,
    icon: 'AlertCircle'
  },
  {
    id: 'emergency-2',
    title: '紧急联系人设置',
    content: '设置家人、朋友或医生的联系方式，在紧急情况下可以快速拨打电话或发送求助信息。建议设置2-3个可靠的紧急联系人，并定期更新他们的联系方式。',
    section: '紧急与安全功能',
    order_index: 41,
    icon: 'Phone'
  },
  {
    id: 'emergency-3',
    title: '数据隐私保护',
    content: '您的所有健康数据都经过严格的加密存储，只有您本人可以访问。我们遵循最高的隐私保护标准，绝不会向第三方泄露您的任何个人健康信息。',
    section: '紧急与安全功能',
    order_index: 42,
    icon: 'Shield'
  },

  // 个性化与娱乐功能
  {
    id: 'personal-1',
    title: '个人资料管理',
    content: '完善和管理您的个人信息，包括基本资料、健康状况、过敏史、家族病史等。详细的个人资料有助于获得更准确的健康建议和医疗服务。',
    section: '个性化与娱乐功能',
    order_index: 50,
    icon: 'User'
  },
  {
    id: 'personal-2',
    title: '个性化设置',
    content: '根据个人喜好调整应用的使用体验，包括界面主题、通知设置、数据显示偏好、语言选择等。让应用更符合您的使用习惯和需求。',
    section: '个性化与娱乐功能',
    order_index: 51,
    icon: 'Sliders'
  },
  {
    id: 'personal-3',
    title: '解压小游戏',
    content: '内置多种轻松有趣的小游戏，如飞鸟游戏、五子棋等，帮助您在记录健康数据的间隙放松心情，缓解压力。适度的娱乐有助于保持良好的心理健康。',
    section: '个性化与娱乐功能',
    order_index: 52,
    icon: 'Gamepad2'
  },
  {
    id: 'personal-4',
    title: '每日励志语录',
    content: '每天为您提供精选的励志语录和健康小贴士，激励您坚持健康的生活方式。积极的心态是健康生活的重要组成部分。',
    section: '个性化与娱乐功能',
    order_index: 53,
    icon: 'Quote'
  }
];
