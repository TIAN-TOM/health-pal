
import { supabase } from '@/integrations/supabase/client';

export interface EducationArticle {
  id: string;
  title: string;
  category: 'basics' | 'symptoms' | 'treatment' | 'lifestyle' | 'psychology';
  content: string;
  summary?: string;
  reading_time?: number;
}

const defaultArticles: EducationArticle[] = [
  {
    id: '1',
    title: '什么是梅尼埃症？',
    category: 'basics',
    summary: '了解梅尼埃症的基本概念、发病机制和主要特征',
    content: `梅尼埃症是一种影响内耳的慢性疾患，主要特征包括：

• 反复发作的眩晕
• 波动性感音神经性听力损失
• 耳鸣
• 耳胀满感

发病机制：
内耳膜迷路积水是梅尼埃症的主要病理基础。当内淋巴系统压力增高时，会导致膜迷路扩张，从而影响内耳的平衡和听觉功能。

流行病学：
- 发病率约为0.2-0.5%
- 多发于30-50岁中年人
- 女性略多于男性
- 大多数为单侧发病

诊断标准：
根据美国听力言语学会(AAO-HNS)标准，确诊梅尼埃症需要：
1. 至少2次持续20分钟以上的眩晕发作
2. 听力学证实的波动性低中频感音神经性听力损失
3. 伴随症状如耳鸣、耳胀感
4. 排除其他原因`,
    reading_time: 5
  },
  {
    id: '2',
    title: '眩晕发作时的应对策略',
    category: 'symptoms',
    summary: '学习如何在眩晕发作时正确应对，减轻症状影响',
    content: `眩晕发作时的即时处理：

立即行动：
1. 保持冷静，避免恐慌
2. 立即坐下或躺下，避免跌倒
3. 闭眼或注视固定物体
4. 避免突然转头或起身

体位管理：
• 采用舒适的体位，通常侧卧较好
• 头部略微抬高
• 避免完全平躺，可能加重症状

呼吸调节：
• 深呼吸，保持规律
• 避免过度换气
• 可以进行简单的冥想或放松练习

环境控制：
• 选择安静、光线柔和的环境
• 避免噪音和强光刺激
• 保持室内空气流通

药物使用：
• 按医嘱使用止晕药物
• 常用药物包括：倍他司汀、敏使朗等
• 严重时可使用地西泮等镇静药物

何时就医：
- 症状持续超过24小时
- 伴有严重头痛、发热
- 出现神经系统症状
- 首次发作或症状明显加重`,
    reading_time: 4
  },
  {
    id: '3',
    title: '饮食管理与生活方式调整',
    category: 'lifestyle',
    summary: '通过饮食和生活方式的调整来减少梅尼埃症发作',
    content: `饮食原则：

低盐饮食：
• 每日钠摄入量控制在1.5-2克以下
• 避免高盐食物：咸菜、腌制品、方便面
• 选择新鲜食材，减少加工食品
• 使用香料代替盐调味

限制咖啡因：
• 减少咖啡、茶、可乐的摄入
• 咖啡因可能影响内耳血流
• 可选择无咖啡因替代品

避免酒精：
• 酒精可能加重眩晕症状
• 影响药物效果
• 干扰睡眠质量

充足水分：
• 每日饮水1.5-2升
• 均匀分布，避免一次大量饮水
• 选择白开水或淡茶

生活方式调整：

规律作息：
• 保证充足睡眠（7-8小时）
• 固定的睡眠时间
• 睡前避免刺激性活动

压力管理：
• 学习放松技巧
• 适当运动，如散步、瑜伽
• 培养兴趣爱好

环境适应：
• 避免噪音环境
• 减少头部快速运动
• 注意天气变化的影响`,
    reading_time: 6
  },
  {
    id: '4',
    title: '心理调适与情绪管理',
    category: 'psychology',
    summary: '学习如何应对梅尼埃症带来的心理挑战，保持积极心态',
    content: `心理影响认知：

常见心理反应：
• 焦虑：对下次发作的担忧
• 抑郁：因症状限制生活质量
• 恐惧：害怕在公共场所发作
• 挫折感：疾患的不可预测性

心理调适策略：

接受现实：
• 认识到梅尼埃症是可管理的慢性疾患
• 学会与症状共存
• 关注能够控制的因素

建立支持系统：
• 家人朋友的理解和支持
• 加入患者互助群体
• 寻求专业心理咨询

认知重构：
• 挑战消极思维模式
• 培养积极的应对策略
• 关注生活中的积极面

放松技巧：
• 深呼吸练习
• 渐进性肌肉放松
• 冥想和正念练习
• 瑜伽和太极

应对发作恐惧：
• 制定应急计划
• 随身携带必要药物
• 告知亲友疾患情况
• 选择合适的外出时间和地点

保持生活质量：
• 适当调整但不过度限制活动
• 培养新的兴趣爱好
• 保持社交联系
• 设定现实的目标

专业帮助：
当出现以下情况时，建议寻求心理专业帮助：
- 持续的焦虑或抑郁
- 避免日常活动
- 影响工作和人际关系
- 出现睡眠问题`,
    reading_time: 5
  },
  {
    id: '5',
    title: '药物治疗选择与注意事项',
    category: 'treatment',
    summary: '了解梅尼埃症的主要药物治疗方案及其使用要点',
    content: `药物治疗分类：

急性期治疗：
1. 前庭抑制剂
   • 地西泮：快速缓解眩晕
   • 异丙嗪：止吐效果好
   • 使用时间：短期使用，避免依赖

2. 止吐药物
   • 胃复安：促进胃肠蠕动
   • 昂丹司琼：5-HT3受体拮抗剂
   • 注意：避免长期使用

预防性治疗：
1. 倍他司汀
   • 机制：改善内耳微循环
   • 剂量：每次8-16mg，每日3次
   • 疗程：通常3-6个月

2. 利尿剂
   • 氢氯噻嗪：减少内淋巴积水
   • 螺内酯：保钾利尿剂
   • 监测：电解质平衡

3. 糖皮质激素
   • 泼尼松：抗炎作用
   • 适应症：急性期或听力快速下降
   • 注意：短期使用，逐渐减量

用药注意事项：
• 按医嘱服药，不自行调整剂量
• 观察药物副作用
• 定期复查听力和肝肾功能
• 避免药物相互作用
• 记录用药效果

非药物治疗：
1. 鼓室内注射
   • 庆大霉素：化学迷路切除术
   • 糖皮质激素：保守治疗
   • 适应症：药物治疗无效

2. 手术治疗
   • 内淋巴囊减压术
   • 前庭神经切断术
   • 迷路切除术
   • 适应症：严重病例

治疗目标：
• 减少眩晕发作频率和强度
• 保护和改善听力
• 提高生活质量
• 减少心理负担`,
    reading_time: 7
  }
];

export const getEducationArticles = async (): Promise<EducationArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('education_articles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.log('数据库暂无内容，使用默认文章');
      return defaultArticles;
    }
    
    // 如果数据库中没有文章，返回默认文章
    if (!data || data.length === 0) {
      return defaultArticles;
    }
    
    return data as EducationArticle[];
  } catch (error) {
    console.log('使用默认科普内容');
    return defaultArticles;
  }
};

export const getArticlesByCategory = async (category: string): Promise<EducationArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('education_articles')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });

    if (error) {
      return defaultArticles.filter(article => article.category === category);
    }
    
    if (!data || data.length === 0) {
      return defaultArticles.filter(article => article.category === category);
    }
    
    return data as EducationArticle[];
  } catch (error) {
    return defaultArticles.filter(article => article.category === category);
  }
};
