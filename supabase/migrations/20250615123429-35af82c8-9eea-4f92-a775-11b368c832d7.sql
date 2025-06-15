
-- 创建医疗记录表
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT NOT NULL, -- 'visit', 'diagnosis', 'prescription'
  date DATE NOT NULL,
  hospital TEXT,
  doctor TEXT,
  department TEXT,
  diagnosis TEXT,
  symptoms TEXT,
  prescribed_medications TEXT[],
  notes TEXT,
  next_appointment DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建科普文章表
CREATE TABLE public.education_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'basics', 'symptoms', 'treatment', 'lifestyle', 'psychology'
  content TEXT NOT NULL,
  summary TEXT,
  reading_time INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 为医疗记录表启用行级安全
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的医疗记录
CREATE POLICY "Users can view own medical records" ON public.medical_records
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的医疗记录
CREATE POLICY "Users can create own medical records" ON public.medical_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的医疗记录
CREATE POLICY "Users can update own medical records" ON public.medical_records
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的医疗记录
CREATE POLICY "Users can delete own medical records" ON public.medical_records
  FOR DELETE USING (auth.uid() = user_id);

-- 科普文章对所有用户可读
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read education articles" ON public.education_articles
  FOR SELECT TO authenticated USING (true);

-- 插入一些科普文章示例数据
INSERT INTO public.education_articles (title, category, content, summary, reading_time) VALUES
('什么是梅尼埃病？', 'basics', '梅尼埃病是一种内耳疾病，主要特征是反复发作的眩晕、听力下降、耳鸣和耳闷胀感。这种疾病是由内耳膜迷路积水引起的，会影响平衡和听觉功能。梅尼埃病通常只影响一只耳朵，但约15%的患者双耳都会受到影响。病情发作时，患者会感到天旋地转的眩晕，通常持续20分钟到几小时不等。', '了解梅尼埃病的基本概念和主要症状', 5),

('梅尼埃病的典型症状', 'symptoms', '梅尼埃病的四大典型症状包括：1. 发作性眩晕：突然出现的旋转性眩晕，常伴有恶心呕吐；2. 波动性听力下降：听力在发作时明显下降，缓解期可能部分恢复；3. 耳鸣：持续性的嗡嗡声或其他噪音；4. 耳闷胀感：耳朵有堵塞或压迫感。这些症状可能同时出现，也可能先后出现。', '梅尼埃病的四大典型症状详解', 4),

('梅尼埃病的治疗方法', 'treatment', '梅尼埃病的治疗主要包括：1. 药物治疗：倍他司汀、利尿剂、镇静剂等；2. 饮食调节：低盐饮食，避免咖啡因和酒精；3. 生活方式调整：规律作息，减少压力；4. 物理治疗：前庭康复训练；5. 手术治疗：在保守治疗无效时考虑。大多数患者通过药物和生活方式调整可以有效控制症状。', '了解梅尼埃病的各种治疗选择', 6),

('如何应对眩晕发作', 'lifestyle', '当眩晕发作时：1. 立即坐下或躺下，选择安全的地方；2. 保持头部稳定，避免突然转动；3. 闭上眼睛或注视固定物体；4. 深呼吸，保持冷静；5. 避免开车或操作机器；6. 如果症状严重，及时就医。平时要避免可能的诱发因素，如疲劳、压力、高盐饮食等。', '学会正确应对眩晕发作的方法', 4),

('心理调适与情绪管理', 'psychology', '患有梅尼埃病可能会带来焦虑和恐惧，这是完全正常的反应。重要的是：1. 接受疾病：了解这是一种可以控制的慢性疾病；2. 保持积极心态：大多数患者可以过上正常生活；3. 寻求支持：与家人朋友分享感受，必要时寻求专业心理帮助；4. 坚持治疗：按医嘱用药和定期复查；5. 培养兴趣：参与适合的活动，保持生活质量。记住，你不是一个人在战斗。', '学会管理疾病带来的心理压力', 5);

-- 预设常用梅尼埃药物
INSERT INTO public.user_medications (user_id, name, frequency) 
SELECT auth.uid(), medication.name, medication.frequency
FROM (VALUES 
  ('倍他司汀', 'three_times_daily'),
  ('地西泮', 'as_needed'),
  ('异丙嗪', 'as_needed'),
  ('氢氯噻嗪', 'daily'),
  ('维生素B6', 'daily'),
  ('甲磺酸倍他司汀', 'twice_daily'),
  ('盐酸氟桂利嗪', 'daily'),
  ('茶苯海明', 'as_needed')
) AS medication(name, frequency)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
