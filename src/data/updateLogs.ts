
export interface UpdateLog {
  id: string;
  version: string;
  date: string;
  title: string;
  changes: {
    type: 'new' | 'improved' | 'fixed';
    description: string;
  }[];
}

export const updateLogs: UpdateLog[] = [
  {
    id: '2025-06-29-v1.3.0',
    version: 'v1.3.0',
    date: '2025-06-29',
    title: '游戏体验大幅提升',
    changes: [
      {
        type: 'new',
        description: '新增更新日志功能，用户可随时查看版本更新内容'
      },
      {
        type: 'improved',
        description: '记忆翻牌游戏优化：使用高对比度图标和背景色，更适合老花眼用户'
      },
      {
        type: 'improved',
        description: '打砖块游戏新增多种道具：激光、穿透球、护盾等'
      },
      {
        type: 'improved',
        description: '小鸟飞行游戏优化护盾效果，现在真正具有保护作用'
      },
      {
        type: 'fixed',
        description: '修复登录后跳转错误页面的问题，现在统一跳转到首页'
      }
    ]
  },
  {
    id: '2025-06-28-v1.2.5',
    version: 'v1.2.5',
    date: '2025-06-28',
    title: '中国大陆用户体验优化',
    changes: [
      {
        type: 'new',
        description: '添加百度地图、高德地图、腾讯地图支持，更好适配中国大陆用户'
      },
      {
        type: 'improved',
        description: '登录注册页面增加详细引导和动画效果'
      },
      {
        type: 'improved',
        description: '睡眠记录优化：移除默认睡眠时间，避免误导性显示'
      },
      {
        type: 'fixed',
        description: '修复五子棋游戏标题显示问题'
      }
    ]
  },
  {
    id: '2025-06-27-v1.2.0',
    version: 'v1.2.0',
    date: '2025-06-27',
    title: '基础功能完善',
    changes: [
      {
        type: 'new',
        description: '新增记忆翻牌游戏，支持多种难度和道具系统'
      },
      {
        type: 'new',
        description: '新增打砖块游戏，经典怀旧体验'
      },
      {
        type: 'new',
        description: '新增小鸟飞行游戏，挑战反应速度'
      },
      {
        type: 'improved',
        description: '优化用户界面，提升整体视觉体验'
      },
      {
        type: 'improved',
        description: '完善健康记录功能，支持多种生活方式追踪'
      }
    ]
  }
];
