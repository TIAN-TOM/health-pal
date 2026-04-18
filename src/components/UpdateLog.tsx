import React from 'react';

// 版本 2.9.5 更新日志 - 2025-01-31
// - 修复7天天气预报日期显示错误（跳过明天的问题）
// - 使用本地日期解析避免时区偏移
// - 新增昨日天气查看功能
// - 优化天气预报数据处理逻辑
import { ArrowLeft, Calendar, Zap, Bug, Sparkles, Home, Navigation, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpdateLogProps {
  onBack: () => void;
  source?: string;
}

const UpdateLog = ({ onBack, source }: UpdateLogProps) => {
  const updates = [
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

  const getTypeColor = (type: string) => {
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

  const getTypeText = (type: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            📝 更新日志
          </h1>
          <div className="w-16" />
        </div>

        {/* 更新列表 */}
        <div className="space-y-6">
          {updates.map((update, index) => {
            const IconComponent = update.icon;
            return (
              <Card key={update.version} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${update.color} border`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">版本 {update.version}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="secondary" className={update.color}>
                      {update.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {update.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(item.type)}`}
                          >
                            {getTypeText(item.type)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border">
            <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">
              持续优化中，感谢您的使用和反馈！
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLog;
