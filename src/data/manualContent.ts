
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
    content: '这是一个综合性的健康管理应用，帮助您记录和追踪日常健康状况。无论您是想要管理特定的健康问题，还是想要养成良好的健康习惯，这个应用都能为您提供专业的记录和分析工具。',
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
    content: '主界面采用简洁的卡片式设计，包含每日打卡、健康记录功能、紧急帮助按钮、解压小游戏和个人设置入口。每个功能都配有直观的图标和描述，让您能够快速找到所需的功能。',
    section: '入门指南',
    order_index: 3,
    icon: 'Layout'
  },

  // 基础功能
  {
    id: 'basic-1',
    title: '每日打卡功能',
    content: '每日打卡是建立健康习惯的核心功能。您可以记录当天的整体状态、心情评分（1-5分）、特殊事件或感受。坚持每日打卡能够帮助您更好地了解自己的健康规律。',
    section: '基础功能',
    order_index: 10,
    icon: 'Calendar'
  },
  {
    id: 'basic-2',
    title: '健康记录入口',
    content: '点击"健康记录"可以进入统一的记录界面，您可以选择记录眩晕症状、血糖情况、饮食作息或用药情况。这个统一入口让记录更加便捷高效。',
    section: '基础功能',
    order_index: 11,
    icon: 'FileText'
  },
  {
    id: 'basic-3',
    title: '医疗记录管理',
    content: '集中管理您的就诊记录、诊断结果、处方信息、检查报告等重要医疗文档。支持添加照片、扫描件等多媒体内容，建立完整的电子健康档案。',
    section: '基础功能',
    order_index: 12,
    icon: 'Stethoscope'
  },
  {
    id: 'basic-4',
    title: '解压小游戏',
    content: '内置多种轻松有趣的小游戏，如飞鸟游戏、五子棋等，帮助您在记录健康数据的间隙放松心情，缓解压力。游戏难度经过优化，让您能够轻松获得成就感。',
    section: '基础功能',
    order_index: 13,
    icon: 'Gamepad2'
  },

  // 症状管理
  {
    id: 'symptoms-1',
    title: '眩晕症状记录',
    content: '专门用于记录眩晕、头晕等症状的详细信息。包括症状的持续时间、严重程度、触发因素、伴随症状等。这些详细记录有助于您和医生分析症状的规律和可能的原因。',
    section: '症状管理',
    order_index: 20,
    icon: 'Activity'
  },
  {
    id: 'symptoms-2',
    title: '血糖情况记录',
    content: '全面记录血糖监测数据，包括测量时间（餐前/餐后/空腹/睡前）、血糖数值、用药情况、饮食和运动信息。支持数据趋势分析，帮助您更好地管理血糖水平。',
    section: '症状管理',
    order_index: 21,
    icon: 'TrendingUp'
  },
  {
    id: 'symptoms-3',
    title: '症状记录技巧',
    content: '记录症状时，建议详细描述症状的特点、持续时间、严重程度等。可以使用1-10的量表来评估症状严重性，这样有助于跟踪症状变化趋势。',
    section: '症状管理',
    order_index: 22,
    icon: 'Target'
  },

  // 生活管理
  {
    id: 'lifestyle-1',
    title: '饮食记录',
    content: '记录日常饮食情况，包括食物种类、用餐时间、食量大小等。通过饮食记录可以发现食物与症状之间的关联，为调整饮食结构提供依据。',
    section: '生活管理',
    order_index: 30,
    icon: 'Apple'
  },
  {
    id: 'lifestyle-2',
    title: '作息管理',
    content: '记录睡眠时间、睡眠质量、运动情况等生活作息信息。良好的作息习惯对健康状况有重要影响，通过记录可以发现作息与健康的关系。',
    section: '生活管理',
    order_index: 31,
    icon: 'Moon'
  },
  {
    id: 'lifestyle-3',
    title: '压力管理',
    content: '记录心理压力水平、情绪状态、压力来源等信息。心理健康与身体健康密切相关，通过压力管理可以改善整体健康状况。',
    section: '生活管理',
    order_index: 32,
    icon: 'Brain'
  },

  // 用药管理
  {
    id: 'medication-1',
    title: '用药记录',
    content: '详细记录各种药物的服用情况，包括药物名称、剂量、服用时间、效果评价等。准确的用药记录有助于医生评估治疗效果和调整用药方案。',
    section: '用药管理',
    order_index: 40,
    icon: 'Pill'
  },
  {
    id: 'medication-2',
    title: '药物管理系统',
    content: '维护您的常用药物清单，设置用药提醒，管理药物库存。包括药物信息录入、服用记录、效果评价、副作用记录等完整的药物管理功能。',
    section: '用药管理',
    order_index: 41,
    icon: 'Clock'
  },
  {
    id: 'medication-3',
    title: '用药安全',
    content: '记录药物过敏史、副作用反应等重要安全信息。在就医时及时向医生提供用药记录，避免药物相互作用和重复用药。',
    section: '用药管理',
    order_index: 42,
    icon: 'Shield'
  }
];
