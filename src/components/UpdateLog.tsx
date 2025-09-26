import React from 'react';
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
