
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
    content: '主界面采用简洁的卡片式设计，包含每日签到、健康记录功能、呼吸训练、语音记录、家庭管理、解压小游戏、实时汇率、每日英语学习等丰富功能。每个功能都配有直观的图标和描述，让您能够快速找到所需的功能。',
    section: '入门指南',
    order_index: 3,
    icon: 'Layout'
  },

  // 基础功能
  {
    id: 'basic-1',
    title: '每日签到功能',
    content: '每日签到是建立健康习惯的核心功能。您可以记录当天的整体状态、心情评分（1-5分）、特殊事件或感受。坚持每日签到能够帮助您更好地了解自己的健康规律，建立连续的健康追踪记录。完成签到还可以获得积分奖励。',
    section: '基础功能',
    order_index: 10,
    icon: 'Calendar'
  },
  {
    id: 'basic-2',
    title: '健康记录中心',
    content: '点击"健康记录"可以进入统一的记录界面，您可以选择记录眩晕症状、血糖情况、饮食作息或用药情况。这个统一入口让记录更加便捷高效，所有健康数据都会被系统化管理。',
    section: '基础功能',
    order_index: 11,
    icon: 'FileText'
  },
  {
    id: 'basic-3',
    title: '呼吸训练功能',
    content: '呼吸训练功能提供多种呼吸模式，包括4-7-8放松法、平衡呼吸和深度放松等。通过可视化圆圈引导和背景音乐，帮助您进行正确的深呼吸练习，有效缓解压力、改善睡眠质量并提升专注力。界面采用沉浸式设计，提供冥想体验。',
    section: '基础功能',
    order_index: 12,
    icon: 'Wind'
  },
  {
    id: 'basic-4',
    title: '语音记录功能',
    content: '语音记录功能让您能够快速录制健康相关的语音笔记。支持高质量录音、30天云端存储、播放控制、进度调节和音量控制。可以为录音添加备注和标题，便于管理。所有录音都有隐私保护，只有您本人可以收听。',
    section: '基础功能',
    order_index: 13,
    icon: 'Mic'
  },
  {
    id: 'basic-5',
    title: '家庭管理系统',
    content: '温馨的家庭管理系统包含家庭日历、成员管理、消息交流、提醒事项、费用管理等功能。帮助您更好地组织家庭生活，与家人保持紧密联系，共同管理日常事务。',
    section: '基础功能',
    order_index: 14,
    icon: 'Home'
  },
  {
    id: 'basic-6',
    title: '解压小游戏',
    content: '内置丰富的轻松有趣的小游戏，包括"小鸟会飞"、智能五子棋、打砖块、贪吃蛇、2048、泡泡消消乐等多款游戏。还新增了多人在线五子棋功能，支持创建房间和实时对战。游戏支持音效开关，帮助您在记录健康数据的间隙放松心情。',
    section: '基础功能',
    order_index: 15,
    icon: 'Gamepad2'
  },
  {
    id: 'basic-7',
    title: '实时汇率查询',
    content: '提供澳币对人民币的实时汇率查询功能，帮助您及时了解汇率变动情况。界面简洁直观，数据准确可靠，是海外生活和投资的好帮手。',
    section: '基础功能',
    order_index: 16,
    icon: 'DollarSign'
  },
  {
    id: 'basic-8',
    title: '每日英语学习',
    content: '每日英语学习模块包含英语名言、单词学习、常用短语和听力练习。支持英语朗读功能，帮助您练习发音。内容丰富多样，难度分级，确保一个月内每日内容不重样。是提升英语水平的好伙伴。',
    section: '基础功能',
    order_index: 17,
    icon: 'BookOpen'
  },

  // 症状管理
  {
    id: 'symptoms-1',
    title: '眩晕症状记录',
    content: '专门用于记录眩晕、头晕等症状的详细信息。包括症状的持续时间、严重程度（轻微/中等/严重）、触发因素、伴随症状等。这些详细记录有助于您和医生分析症状的规律和可能的原因。',
    section: '症状管理',
    order_index: 20,
    icon: 'Activity'
  },
  {
    id: 'symptoms-2',
    title: '血糖情况记录',
    content: '全面记录血糖监测数据，包括测量时间（餐前/餐后/空腹/睡前）、血糖数值、用药情况、饮食和运动信息。支持数据趋势分析，帮助您更好地管理血糖水平，识别血糖波动规律。',
    section: '症状管理',
    order_index: 21,
    icon: 'TrendingUp'
  },
  {
    id: 'symptoms-3',
    title: '症状记录技巧',
    content: '记录症状时，建议详细描述症状的特点、持续时间、严重程度等。可以使用1-10的量表来评估症状严重性，这样有助于跟踪症状变化趋势。记录触发因素同样重要，有助于预防症状复发。',
    section: '症状管理',
    order_index: 22,
    icon: 'Target'
  },

  // 生活管理
  {
    id: 'lifestyle-1',
    title: '饮食记录管理',
    content: '记录日常饮食情况，包括食物种类、用餐时间、食量大小、饮水量等。通过饮食记录可以发现食物与症状之间的关联，为调整饮食结构提供科学依据，建立健康的饮食习惯。',
    section: '生活管理',
    order_index: 30,
    icon: 'Apple'
  },
  {
    id: 'lifestyle-2',
    title: '作息管理',
    content: '记录睡眠时间、睡眠质量、运动情况等生活作息信息。良好的作息习惯对健康状况有重要影响，通过记录可以发现作息与健康的关系，优化日常生活节奏。',
    section: '生活管理',
    order_index: 31,
    icon: 'Moon'
  },
  {
    id: 'lifestyle-3',
    title: '心理健康管理',
    content: '记录心理压力水平、情绪状态、压力来源等信息。结合呼吸训练功能，可以有效管理压力和焦虑。心理健康与身体健康密切相关，通过压力管理可以改善整体健康状况。',
    section: '生活管理',
    order_index: 32,
    icon: 'Brain'
  },

  // 用药管理
  {
    id: 'medication-1',
    title: '用药记录功能',
    content: '详细记录各种药物的服用情况，包括药物名称、剂量、服用时间、效果评价等。准确的用药记录有助于医生评估治疗效果和调整用药方案，确保用药安全和有效性。',
    section: '用药管理',
    order_index: 40,
    icon: 'Pill'
  },
  {
    id: 'medication-2',
    title: '药物管理系统',
    content: '维护您的常用药物清单，设置用药提醒，管理药物库存。包括药物信息录入、服用记录、效果评价、副作用记录等完整的药物管理功能。支持从用药记录页面直接进入药物管理。',
    section: '用药管理',
    order_index: 41,
    icon: 'Clock'
  },
  {
    id: 'medication-3',
    title: '用药安全管理',
    content: '记录药物过敏史、副作用反应等重要安全信息。在就医时及时向医生提供完整的用药记录，避免药物相互作用和重复用药。建议定期更新药物信息。',
    section: '用药管理',
    order_index: 42,
    icon: 'Shield'
  },

  // 积分系统
  {
    id: 'points-1',
    title: '积分系统介绍',
    content: '应用内置完整的积分系统，通过每日签到、完成健康记录等活动可以获得积分奖励。连续签到还有额外奖励机制，鼓励您坚持使用应用养成健康习惯。积分可以在积分商城中兑换虚拟物品。',
    section: '积分系统',
    order_index: 50,
    icon: 'Star'
  },
  {
    id: 'points-2',
    title: '积分商城',
    content: '积分商城提供各种虚拟物品可供兑换，包括头像框、称号、特殊功能等。通过积分兑换增加应用的趣味性和互动性，让健康管理变得更有动力。',
    section: '积分系统',
    order_index: 51,
    icon: 'ShoppingCart'
  },

  // 数据管理
  {
    id: 'data-1',
    title: '历史记录查看',
    content: '历史记录功能提供强大的数据检索和筛选功能。支持按类型、时间范围筛选，支持关键词搜索。从每日数据中心进入历史记录页面，可以查看所有健康数据的详细信息和趋势分析。',
    section: '数据管理',
    order_index: 60,
    icon: 'Database'
  },
  {
    id: 'data-2',
    title: '数据导出功能',
    content: '支持将健康数据导出为多种格式，包括JSON、文本格式等。导出的数据包含所有记录类型：每日签到、眩晕记录、血糖记录、生活方式记录、用药记录等，确保数据完整性和格式正确性。',
    section: '数据管理',
    order_index: 61,
    icon: 'Download'
  },
  {
    id: 'data-3',
    title: '日历视图功能',
    content: '日历视图以月历形式展示您的健康数据，不同类型的记录用不同颜色标识。可以快速查看某天的记录情况，点击日期可以查看当天的详细记录，帮助识别健康模式。',
    section: '数据管理',
    order_index: 62,
    icon: 'Calendar'
  },

  // 管理员功能
  {
    id: 'admin-1',
    title: '管理员系统',
    content: '应用提供完整的管理员权限系统，包括用户管理、数据统计、公告管理、通知中心、教育资源管理等功能。管理员可以监控用户活动、管理积分系统、发布公告等。',
    section: '管理员功能',
    order_index: 70,
    icon: 'Shield'
  },
  {
    id: 'admin-2',
    title: '实时通知系统',
    content: '管理员可以收到用户使用所有模块的实时通知，精确追踪各模块使用频率，深度了解用户行为。包括健康记录、游戏活动、英语学习、语音记录等全面的活动监控。',
    section: '管理员功能',
    order_index: 71,
    icon: 'Bell'
  }
];
