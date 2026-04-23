import { Calendar, Zap, Bug, Sparkles, Home, type LucideIcon } from 'lucide-react';

export interface UpdateItem {
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix' | string;
}

export interface UpdateEntry {
  version: string;
  date?: string;
  type: string;
  icon: LucideIcon;
  color: string;
  items: UpdateItem[];
}

export const updates: UpdateEntry[] = [
  {
    version: '2.9.15',
    date: '2026-04-23',
    type: '界面优化',
    icon: Home,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    items: [
      {
        title: '🖱️ 首页横幅悬浮显示手动切换箭头',
        description: '鼠标移到首页轮播横幅上时，左右两侧会浮现半透明小箭头，可手动切换天气与倒数日；同时鼠标悬停期间自动播放暂停，移开后恢复',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.9.14',
    date: '2026-04-22',
    type: '界面优化',
    icon: Home,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    items: [
      {
        title: '🎠 首页天气与倒数日合并为自动滚动横幅',
        description: '首页将原本上下两个 110px 高的「天气」和「倒数日」模块合并为一个全宽自动轮播横幅，高度减半至约 56px，每 5 秒自动切换；点击天气幻灯片仍可进入天气详情页',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.9.13',
    date: '2026-04-22',
    type: '安全加固',
    icon: Zap,
    color: 'bg-red-50 text-red-600 border-red-200',
    items: [
      {
        title: '🔐 修复管理员邮件接口身份冒用漏洞',
        description: 'admin-send-email 不再信任请求体中的 adminId,改为从 JWT 解析真实调用者并校验 admin 角色;邮件正文做 HTML 转义,主题/收件人/正文均加长度与格式校验',
        type: 'fix',
      },
      {
        title: '🛡️ 修复管理员通知内容可伪造问题',
        description: 'notify-admin-activity / notify-admin-checkin 忽略客户端传入的 user_id/user_name,改由 JWT 派生真实身份;activity_type 走白名单,描述/模块名做长度限制,mood_score / checkin_date 严格校验',
        type: 'fix',
      },
      {
        title: '🚫 修复用户角色提权风险',
        description: '删除缺少 WITH CHECK 的 user_roles 全权限策略,新增显式 INSERT/UPDATE 策略 (要求 admin),并补充用户读取自身角色的策略,杜绝普通用户给自己加 admin 的可能',
        type: 'fix',
      },
      {
        title: '👤 修复被停用用户无法读取自身资料',
        description: 'profiles SELECT 策略不再过滤 status=active,被暂停用户也能看到自己的资料;新增显式 INSERT WITH CHECK (auth.uid() = id) 作为 trigger 的纵深防御',
        type: 'fix',
      },
      {
        title: '📵 隐藏边缘函数内部错误',
        description: '4 个边缘函数不再向客户端返回 error.message 原文,统一返回通用错误信息,避免泄漏数据库 / 第三方 API 内部细节',
        type: 'fix',
      },
    ],
  },
  {
    version: '2.9.12',
    date: '2026-04-21',
    type: '代码重构',
    icon: Sparkles,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    items: [
      {
        title: '🎮 多人五子棋通信解耦',
        description: 'MultiplayerGomoku 从 850 行瘦身到约 470 行,Supabase Realtime 频道、presence 在线追踪、broadcast 落子、大厅 postgres_changes 全部抽到 useGomokuRoom hook,UI 与通信彻底分离',
        type: 'improvement',
      },
      {
        title: '✅ 重构等价性验证',
        description: '建房 / 加房 / 落子 / 在线状态 / 离线提示 / 游戏结算行为完全保持一致,channel 生命周期由 hook 自动管理',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.9.11',
    date: '2026-04-21',
    type: '代码重构',
    icon: Sparkles,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    items: [
      {
        title: '💣 泡泡堂模块化拆分',
        description: 'BomberPopGame 从 969 行瘦身到 694 行,地图生成 / 关卡配置 / 爆炸计算 / 像素美术 / 音效拆为 6 个独立模块,纯函数全部覆盖单元测试',
        type: 'improvement',
      },
      {
        title: '🎙️ 语音记录提取自定义 Hooks',
        description: 'VoiceRecord 从 809 行瘦身到 558 行,录音逻辑抽到 useVoiceRecorder(185 行),播放逻辑抽到 useVoicePlayback(95 行),主组件聚焦渲染',
        type: 'improvement',
      },
      {
        title: '✅ 28 个单元测试守护重构',
        description: '关卡难度、地图生成、爆炸传播、连环引爆、危险格判定均有覆盖,确保重构前后行为完全等价',
        type: 'feature',
      },
    ],
  },
  {
    version: '2.9.10',
    date: '2026-04-20',
    type: '代码重构',
    icon: Sparkles,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    items: [
      {
        title: '🧪 引入 Vitest 测试基础设施',
        description: '新增 vitest + @testing-library/react，覆盖更新日志和小游戏注册表，重构后行为零变化',
        type: 'feature',
      },
      {
        title: '📝 更新日志数据外移',
        description: 'UpdateLog 组件从 958 行瘦身到约 100 行，37 条版本数据迁至 src/data/updateLog.ts，渲染与数据彻底解耦',
        type: 'improvement',
      },
      {
        title: '🎮 小游戏注册表抽离',
        description: 'Games 组件从 363 行瘦身到约 144 行，10 个游戏的元数据 + 攻略下沉到 registry，攻略浮层抽成可复用子组件',
        type: 'improvement',
      },
    ],
  },
    {
      version: '2.9.9',
      date: '2026-04-20',
      type: '性能优化',
      icon: Zap,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      items: [
        {
          title: '🚀 解压小游戏改为按需加载',
          description: '将 11 个小游戏组件（约 7000 行）由静态导入改为懒加载，显著降低首次进入相关页面的下载和解析体积',
          type: 'feature'
        },
        {
          title: '⏱️ 首页时钟拆分独立组件',
          description: '将每秒滴答的时钟独立为子组件并对齐秒边界，避免每秒重渲染问候语、天气、倒数日等无关模块',
          type: 'feature'
        },
        {
          title: '🧹 清理高频日志',
          description: '移除 beijingTime 工具与认证流程中的高频 console.log（每秒数次），降低主线程开销',
          type: 'fix'
        }
      ]
    },
    {
      version: '2.9.8',
      date: '2026-04-18',
      type: '功能升级',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🎮 Q版泡泡堂全面升级',
          description: '新增多关卡 + 倒计时、道具系统（炸弹+1/范围+1/踢炸弹/加速）、智能敌人 AI（躲炸弹/追玩家）、像素风美术替换 emoji 占位',
          type: 'feature'
        },
        {
          title: '💰 游戏接入积分系统',
          description: '泡泡堂通关可获得真实积分奖励，关卡越高奖励越多，单次最多 50 分、每日累计上限 100 分（服务端原子校验防刷）',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.9.7',
      date: '2026-04-18',
      type: '新增功能',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '💣 新增 Q版泡泡堂小游戏',
          description: '可爱俯视角放炸弹玩法，移动小兔子放置泡泡炸弹炸毁箱子和敌人，支持键盘和移动端虚拟按键操作',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.9.6',
      date: '2026-04-17',
      type: '安全加固',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🛡️ 修复积分系统可被篡改的严重漏洞',
          description: '撤销客户端直接写入积分/库存/购买记录的权限，所有积分变动改由服务端原子函数处理，从根本上杜绝伪造',
          type: 'fix'
        },
        {
          title: '🔐 五子棋 Realtime 频道授权',
          description: '为 Realtime 订阅添加授权策略，仅房间参与者可订阅或广播，防止他人窃听对局数据',
          type: 'fix'
        },
        {
          title: '📦 存储桶策略补全',
          description: '为打卡照片、语音记录补全 UPDATE/DELETE 策略，用户可正常管理自己的文件',
          type: 'fix'
        },
        {
          title: '🎂 生日积分领取改为服务端校验',
          description: '由服务器原子校验生日并发放 666 积分，防止客户端伪造请求重复领取',
          type: 'fix'
        }
      ]
    },
    {
      version: '2.9.5',
      date: '2026-04-17',
      type: '性能优化',
      icon: Zap,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      items: [
        {
          title: '⚡ 全站响应速度大幅提升',
          description: '路由级和页面级代码分割，仅在访问对应页面时才加载所需代码，首屏加载体积显著减小',
          type: 'improvement'
        },
        {
          title: '📦 第三方依赖智能分包',
          description: '将 React、Supabase、Radix UI、图表、图标等大型依赖拆分为独立 chunk，提升缓存命中率',
          type: 'improvement'
        },
        {
          title: '🔁 数据请求缓存优化',
          description: 'React Query 默认 5 分钟缓存、关闭窗口聚焦自动刷新，减少重复请求',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.9.4',
      date: '2026-01-31',
      type: '问题修复',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🌤️ 修复天气城市记忆',
          description: '修复天气模块城市选择记忆功能，现在会正确记住并恢复您上次选择的城市',
          type: 'fix'
        }
      ]
    },
    {
      version: '2.9.3',
      date: '2026-01-30',
      type: '内容更新',
      icon: Sparkles,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      items: [
        {
          title: '📅 2026年节日更新',
          description: '更新农历节日和二十四节气到2026年，确保问候语准确显示',
          type: 'improvement'
        },
        {
          title: '🎉 新增彩蛋问候语',
          description: '添加程序员节、世界睡眠日、世界读书日、愚人节等更多特殊日期问候',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.9.2',
      date: '2025-11-24',
      type: '功能优化',
      icon: Sparkles,
      color: 'bg-green-50 text-green-600 border-green-200',
      items: [
        {
          title: '🎯 倒数日自动清理',
          description: '已结束的倒数日自动从首页隐藏，保持界面整洁',
          type: 'improvement'
        },
        {
          title: '🌤️ 天气城市记忆',
          description: '天气模块现在会记住您上次选择的城市，下次登录自动显示',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.9.1',
      date: '2025-11-24',
      type: '界面优化',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🎯 倒数日显示精简',
          description: '完全移除倒数日模块的小时显示，只保留天数信息，界面更加简洁清晰',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.9.0',
      date: '2025-11-23',
      type: '新功能',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🎨 倒数日个性化主题',
          description: '支持为每个倒数日设置自定义主题颜色（6种配色）和背景图片，打造专属纪念日视觉效果',
          type: 'feature'
        },
        {
          title: '⏰ 倒数日时间设置简化',
          description: '移除小时级精确设置，只需选择日期，自动设为当日结束时刻，简化操作流程',
          type: 'improvement'
        },
        {
          title: '🌤️ 天气预警系统',
          description: '自动监测极端天气（暴雨、台风、高温、低温、雷暴），实时推送预警横幅提醒用户注意安全',
          type: 'feature'
        },
        {
          title: '📊 天气预警记录',
          description: '保存历史天气预警记录，支持查看和管理，24小时内相同预警不重复推送',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.8.7',
      date: '2025-11-23',
      type: '性能优化',
      icon: Zap,
      color: 'bg-green-50 text-green-600 border-green-200',
      items: [
        {
          title: '⚡ 天气API性能大幅提升',
          description: '实现5分钟智能缓存机制，显著减少API请求次数，提升响应速度，降低服务器负载',
          type: 'improvement'
        },
        {
          title: '🎨 天气组件加载体验优化',
          description: '引入骨架屏加载效果，采用渐进式加载策略，切换城市时保持原数据可见，提升用户体验',
          type: 'improvement'
        },
        {
          title: '🧹 倒数日界面精简',
          description: '移除倒数日模块进度条，简化界面显示，突出核心倒计时信息',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.8.6',
      date: '2025-11-23',
      type: '问题修复',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🔧 天气和倒数日数据异常修复',
          description: '修复天气预报和倒数日模块数据加载失败导致的空白屏幕问题，增强所有数组访问的防御性检查，优化数据验证逻辑',
          type: 'fix'
        }
      ]
    },
    {
      version: '2.8.5',
      date: '2025-11-22',
      type: '新功能',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🗓️ 多倒数日轮播切换',
          description: '支持创建多个倒数日并通过左右箭头轮播切换显示，可同时追踪多个重要日期倒计时',
          type: 'feature'
        },
        {
          title: '🌤️ 天气详情页面',
          description: '新增独立的天气详情页面，点击天气模块可查看完整的7天天气预报和详细气象信息',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.8.4',
      date: '2025-11-22',
      type: '功能优化',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '⏰ 倒数日显示精简',
          description: '优化倒数日显示，移除分钟显示，仅保留天数和小时，使信息更清晰简洁',
          type: 'improvement'
        },
        {
          title: '📐 模块高度统一',
          description: '修复天气预报和倒数日模块高度不一致问题，统一为140px，提升视觉协调性',
          type: 'fix'
        }
      ]
    },
    {
      version: "2.8.3",
      date: "2025-11-21",
      type: "功能优化",
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '📦 首页模块布局优化',
          description: '优化天气预报和倒数日模块布局，减少内边距和字体大小，提升空间利用率，使界面更加紧凑',
          type: 'improvement'
        },
        {
          title: '⏰ 倒数日精度调整',
          description: '倒数日精确度调整为小时级别，移除秒级显示，优化管理界面支持设置精确到小时的目标时间',
          type: 'improvement'
        }
      ]
    },
    {
      version: "2.8.2",
      date: "2025-11-21",
      type: "功能增强",
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🌤️ 天气城市选择修复',
          description: '修复天气城市选择保存错误，添加数据库字段支持，确保用户选择的城市能够正确保存和恢复',
          type: 'fix'
        },
        {
          title: '⏰ 倒数日模块全面升级',
          description: '新增实时秒级倒计时、进度条显示、动态渐变配色，支持三种状态视觉（即将到来、就是今天、已结束）',
          type: 'feature'
        }
      ]
    },
    {
      version: "2.8.1",
      date: "2025-11-21",
      type: "功能优化",
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🌤️ 天气模块布局优化',
          description: '恢复为单城市显示模式，提升信息密度，移除双城市对比功能，简化交互流程',
          type: 'improvement'
        },
        {
          title: '📊 天气预报展示改进',
          description: '改进天气预报展示样式，支持展开查看完整7天预报，提升用户体验',
          type: 'improvement'
        }
      ]
    },
    {
      version: "2.8.0",
      date: "2025-11-20",
      type: "新功能",
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🌤️ 7天天气预报',
          description: '天气模块新增未来7天天气预报功能，展示温度趋势和降雨概率，帮助用户更好地规划行程',
          type: 'feature'
        },
        {
          title: '🏙️ 城市偏好保存',
          description: '支持保存用户选择的城市偏好，下次访问时自动显示上次选择的城市，提升使用便捷性',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.7.9',
      type: '功能优化',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🌤️ 实时天气模块 + 城市切换',
          description: '新增苹果风格的天气小组件，支持切换查看10个城市的天气（悉尼、北京、上海、广州、深圳、成都、杭州、纽约、伦敦、东京），默认显示悉尼天气，数据每30分钟自动更新',
          type: 'feature'
        },
        {
          title: '🆘 紧急帮助按钮优化',
          description: '将"我需要帮助"按钮移至顶部用户信息栏右侧，更加便捷且节省首页空间',
          type: 'improvement'
        },
        {
          title: '📱 首页布局优化',
          description: '调整首页整体布局，天气模块与倒数日并排显示，提升整体视觉一致性',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.7.8',
      type: '功能优化',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '📏 首页功能模块尺寸调整',
          description: '将所有功能卡片调整为更紧凑的统一尺寸（110px高度），以每日签到模块尺寸为标准，保持间距和对齐一致',
          type: 'improvement'
        },
        {
          title: '✨ 紧急帮助按钮流光效果优化',
          description: '"我需要帮助"模块升级为浮光掠过的渐变动态光影效果，每隔5秒自然流动，提升视觉体验',
          type: 'improvement'
        },
        {
          title: '⏰ 倒数日功能',
          description: '新增倒数日模块，管理员可自定义设置重要日期倒数，全体用户可查看',
          type: 'feature'
        },
        {
          title: '🎨 管理员面板布局优化',
          description: '改进管理员面板标签页排版，统一间距对齐，增强响应式设计和层级清晰度',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.7.7',
      type: '新功能',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🛍️ 积分商城"我的已购"功能',
          description: '在积分商城中新增"我的已购"页面，用户可以查看所有购买记录',
          type: 'feature'
        },
        {
          title: '📋 订单列表展示',
          description: '展示商品名称、图标、兑换时间、消耗积分、订单状态等完整信息',
          type: 'feature'
        },
        {
          title: '🔍 筛选与搜索功能',
          description: '支持按订单状态筛选（全部/生效中/已失效），支持商品名称搜索',
          type: 'feature'
        },
        {
          title: '📄 分页显示',
          description: '订单列表支持分页，每页显示10条记录，方便浏览大量购买记录',
          type: 'feature'
        },
        {
          title: '🔎 订单详情查看',
          description: '点击任意订单可查看详细信息，包括订单编号、商品描述、购买时间等',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.7.6',
      type: '重要修复',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🔧 修复管理员暂停账号功能',
          description: '解决管理员暂停用户账号后恢复按钮不显示的问题，添加管理员更新用户状态的RLS权限',
          type: 'fix'
        },
        {
          title: '📊 增强操作日志记录',
          description: '添加详细的暂停/恢复操作日志，便于问题排查和调试',
          type: 'improvement'
        },
        {
          title: '⏱️ 优化状态刷新机制',
          description: '改进暂停/恢复操作后的状态刷新，确保界面立即反映最新状态',
          type: 'improvement'
        },
        {
          title: '🛡️ 完善RLS安全策略',
          description: '为profiles表添加管理员更新权限，确保管理员操作的安全性和有效性',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.7.4',
      type: '功能完善',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🔓 账号恢复功能',
          description: '管理员可以手动恢复被暂停的用户账号，支持账号状态的双向管理',
          type: 'feature'
        },
        {
          title: '🎂 生日祝福优化',
          description: '生日祝福弹窗现在每年只显示一次，用户点击"谢谢"后不再重复弹出',
          type: 'improvement'
        },
        {
          title: '💾 数据记录优化',
          description: '优化生日祝福记录机制，改用用户偏好设置存储而非积分交易记录',
          type: 'improvement'
        },
        {
          title: '🔄 管理界面增强',
          description: '根据用户状态动态显示"暂停账号"或"恢复账号"按钮，提升管理体验',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.7.3',
      type: '功能完善',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🛡️ 管理员操作功能完善',
          description: '实现用户账号暂停功能，管理员可以禁止用户登录系统',
          type: 'feature'
        },
        {
          title: '📧 管理员邮件发送系统',
          description: '管理员可以直接向用户发送邮件，支持自定义主题和内容',
          type: 'feature'
        },
        {
          title: '🔄 密码重置功能增强',
          description: '完善管理员重置用户密码功能，自动发送密码重置邮件',
          type: 'improvement'
        },
        {
          title: '📊 用户状态可视化',
          description: '在用户管理界面显示用户状态标识（正常/已暂停），直观显示账号状态',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.7.2',
      type: '功能优化',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🎂 生日祝福功能优化',
          description: '生日祝福弹窗现在在首页显示，过了生日后首次登录即可收到祝福和666积分奖励',
          type: 'improvement'
        },
        {
          title: '🎁 生日积分奖励',
          description: '用户生日时自动赠送666积分，不限当天登录，错过生日也能收到祝福',
          type: 'feature'
        }
      ]
    },
    {
      version: '2.7.0',
      type: '功能增强',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '📝 个人资料功能整合',
          description: '整合个人偏好设置到个人资料页面，统一管理用户基本信息和健康偏好',
          type: 'improvement'
        },
        {
          title: '🎂 生日管理系统',
          description: '新增生日字段，支持年龄自动计算，生日当天弹出生日祝福弹窗',
          type: 'feature'
        },
        {
          title: '🧬 家族病史记录',
          description: '新增家族病史字段，完善个人健康档案信息',
          type: 'feature'
        },
        {
          title: '🔢 智能年龄计算',
          description: '基于生日自动计算年龄，移除手动年龄输入，提高数据准确性',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.6.1',
      type: '问题修复',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🔧 管理员积分购买权限修复',
          description: '修复管理员在积分商城购买道具时显示"积分不足"的问题，管理员现在拥有无限积分',
          type: 'fix'
        },
        {
          title: '👥 管理员查看用户记录权限修复',
          description: '修复管理员无法查看用户每日打卡记录和感想的问题，完善RLS策略',
          type: 'fix'
        },
        {
          title: '🎫 补签卡使用界面优化',
          description: '在日历页面显著位置增加补签卡使用按钮，提升用户体验',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.6.0',
      type: '功能增强',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      items: [
        {
          title: '🎫 补签卡功能完善',
          description: '完善积分商城补签卡功能，支持补签过去30天内错过的打卡记录，使用数据库存储道具库存',
          type: 'feature'
        },
        {
          title: '📅 智能补签系统',
          description: '新增补签卡使用界面，可选择可补签日期、设置心情评分和备注，完善前后端数据联通',
          type: 'feature'
        },
        {
          title: '🔧 道具系统优化',
          description: '将道具存储从localStorage迁移到数据库，增加用户道具库存表，提高数据安全性和一致性',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.5.0',
      type: '游戏增强',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🐍 贪吃蛇游戏重大升级',
          description: '新增特殊食物系统(金色、奖励、加速、减速)，道具系统(无敌、双倍得分、慢动作)，动态障碍和最高分记录',
          type: 'feature'
        },
        {
          title: '🫧 泡泡消消乐功能增强',
          description: '添加分层颜色系统、特殊气泡效果(冻结、双倍、时间奖励)、气泡移动动画和连击奖励机制',
          type: 'feature'
        },
        {
          title: '🎮 游戏工具提示优化',
          description: '在每个游戏卡片右上角添加说明图标，悬停或点击显示详细游戏操作指导',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.4.0',
      type: '功能增强',
      icon: Zap,
      color: 'bg-green-50 text-green-600 border-green-200',
      items: [
        {
          title: '💱 汇率计算器优化',
          description: '完善多币种转换功能，支持各币种间实时汇率计算',
          type: 'improvement'
        },
        {
          title: '📅 周末汇率提示',
          description: '汇率页面新增周末时间提示，提醒用户外汇市场休市状态',
          type: 'feature'
        },
        {
          title: '🔄 汇率数据源优化',
          description: '增加备用API接口，提高汇率数据获取的稳定性和准确性',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.3.0',
      type: '功能优化',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '🎮 俄罗斯方块游戏优化',
          description: '新增手机端触屏控制，优化游戏操作体验，修复旋转卡位bug',
          type: 'improvement'
        },
        {
          title: '📱 打卡弹窗手机端优化',
          description: '改进打卡完成弹窗在手机端的显示效果，添加6秒倒计时自动跳转',
          type: 'improvement'
        },
        {
          title: '⚙️ 管理员面板优化',
          description: '调整管理员面板标签页顺序，通知中心置于首位',
          type: 'improvement'
        }
      ]
    },
    {
      version: '2.2.0',
      type: '功能优化',
      icon: Bug,
      color: 'bg-red-50 text-red-600 border-red-200',
      items: [
        {
          title: '🔧 修复症状记录页面导航问题',
          description: '修复眩晕、血糖、生活方式、用药记录页面白屏崩溃问题，完善路由配置',
          type: 'fix'
        },
        {
          title: '📅 优化家庭日历功能',
          description: '移除旧版家庭日历，增强版日历重命名为"家庭日历"，扩大年限范围至2000-2050年',
          type: 'improvement'
        },
        {
          title: '🔧 完善页面路由配置',
          description: '补充缺失的症状记录页面路由，确保所有导航功能正常工作',
          type: 'fix'
        }
      ]
    },
    {
      version: '2.0.0',
      type: '重大更新',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      items: [
        {
          title: '✨ 增强版家庭日历',
          description: '全新的42格网格日历布局，支持农历显示、传统节日提醒和家庭成员生日管理',
          type: 'feature'
        },
        {
          title: '👥 完整家庭成员管理',
          description: '支持添加、编辑、删除家庭成员，自定义头像上传，生日提醒功能',
          type: 'feature'
        },
        {
          title: '🎨 优化用户界面',
          description: '全面改进卡片布局、响应式设计和交互体验',
          type: 'improvement'
        }
      ]
    },
    {
      version: '1.9.0',
      type: '功能增强',
      icon: Home,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      items: [
        {
          title: '🏠 家庭管理中心',
          description: '新增家庭管理功能模块，包括日历、账本、提醒、成员管理等',
          type: 'feature'
        },
        {
          title: '💰 家庭账本',
          description: '支持记录和统计家庭收支情况',
          type: 'feature'
        },
        {
          title: '⏰ 家庭提醒',
          description: '设置重要事项提醒功能',
          type: 'feature'
        }
      ]
    },
    {
      version: '1.8.0',
      type: '功能扩展',
      icon: Zap,
      color: 'bg-green-50 text-green-600 border-green-200',
      items: [
        {
          title: '💱 实时汇率查询',
          description: '新增澳币汇率实时查询功能，支持多种货币对比',
          type: 'feature'
        },
        {
          title: '📚 每日英语学习',
          description: '包含每日名言、单词学习和听力练习的英语学习模块',
          type: 'feature'
        },
        {
          title: '🎮 解压小游戏优化',
          description: '优化游戏性能，增加更多游戏选项',
          type: 'improvement'
        }
      ]
    },
    {
      version: '1.7.0',
      type: '用户体验',
      icon: Calendar,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      items: [
        {
          title: '📅 日历视图增强',
          description: '改进月度数据显示，增加打卡和症状记录的可视化',
          type: 'improvement'
        },
        {
          title: '🔍 数据导出功能',
          description: '支持将健康数据导出为多种格式，便于医生诊断',
          type: 'feature'
        },
        {
          title: '⚡ 性能优化',
          description: '优化应用加载速度和响应性能',
          type: 'improvement'
        }
      ]
    },
    {
      version: '1.6.0',
      type: '健康管理',
      icon: Calendar,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
      items: [
        {
          title: '🩺 症状记录优化',
          description: '改进眩晕、生活方式和用药记录的用户界面',
          type: 'improvement'
        },
        {
          title: '📊 数据统计增强',
          description: '新增更详细的健康数据分析和趋势图表',
          type: 'feature'
        },
        {
          title: '🔔 提醒系统',
          description: '智能提醒用户按时记录健康状况',
          type: 'feature'
        }
      ]
    }
];

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'improvement':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'fix':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getTypeText = (type: string): string => {
  switch (type) {
    case 'feature':
      return '新功能';
    case 'improvement':
      return '优化';
    case 'fix':
      return '修复';
    default:
      return '更新';
  }
};
