
-- 创建用户自定义信息表
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  age INTEGER CHECK (age > 0 AND age < 150),
  height INTEGER, -- 身高(cm)
  weight DECIMAL(5,2), -- 体重(kg)
  medical_history TEXT[], -- 病史
  allergies TEXT[], -- 过敏史
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_language TEXT DEFAULT 'zh-CN',
  timezone TEXT DEFAULT 'Asia/Shanghai',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 启用行级安全
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
  ON public.user_preferences 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 管理员可以查看所有用户偏好设置
CREATE POLICY "Admins can view all user preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- 创建用户手册表
CREATE TABLE public.user_manual (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section TEXT NOT NULL, -- 章节分类
  order_index INTEGER DEFAULT 0, -- 排序
  icon TEXT, -- 图标名称
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用行级安全 - 所有用户都可以查看
ALTER TABLE public.user_manual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view user manual" 
  ON public.user_manual 
  FOR SELECT 
  TO authenticated
  USING (true);

-- 只有管理员可以管理用户手册
CREATE POLICY "Admins can manage user manual" 
  ON public.user_manual 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- 插入默认的用户手册内容
INSERT INTO public.user_manual (title, content, section, order_index, icon) VALUES
('欢迎使用梅尼埃症生活伴侣', '欢迎使用梅尼埃症生活伴侣！这是一个专门为梅尼埃症患者设计的健康管理应用。通过记录症状、生活习惯和用药情况，帮助您更好地管理病情。', '入门指南', 1, 'Heart'),
('如何开始每日打卡', '每日打卡是记录您每天健康状况的重要功能。点击首页的"每日打卡"按钮，您可以记录今天的心情、症状和备注。建议每天坚持打卡，形成健康记录习惯。', '基础功能', 2, 'Calendar'),
('记录眩晕症状', '当出现眩晕症状时，及时记录非常重要。点击"眩晕记录"，选择症状类型、严重程度和持续时间。详细的记录有助于医生了解您的病情变化。', '症状管理', 3, 'Activity'),
('生活记录功能', '记录日常生活习惯对病情管理很有帮助。在"生活记录"中，您可以记录睡眠、饮食、运动和心情状况。良好的生活习惯有助于减少发作频率。', '生活管理', 4, 'Sun'),
('用药记录管理', '准确记录用药情况很重要。在"用药记录"中记录药物名称、剂量和服用时间。您也可以在药物管理中添加常用药物，方便快速记录。', '用药管理', 5, 'Pill'),
('数据导出功能', '您可以导出所有的健康记录数据。点击"数据导出"，选择需要导出的数据类型和时间范围，生成详细的健康报告，方便就医时提供给医生参考。', '数据管理', 6, 'Download'),
('紧急求助功能', '如果遇到紧急情况，点击红色的"紧急求助"按钮。系统会自动向您的紧急联系人发送求助短信，包含您的位置信息。请事先在设置中配置紧急联系人。', '安全功能', 7, 'AlertTriangle'),
('个人设置管理', '在设置页面，您可以修改个人信息、管理紧急联系人、设置用药提醒等。建议完善个人资料，以便获得更个性化的健康建议。', '设置管理', 8, 'Settings');

-- 创建用户账号删除记录表（用于审计）
CREATE TABLE public.account_deletions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  deletion_reason TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_by UUID REFERENCES auth.users(id) -- 可能是管理员删除
);

-- 只有管理员可以查看删除记录
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view deletion records" 
  ON public.account_deletions 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));
