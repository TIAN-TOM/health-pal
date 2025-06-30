
-- 创建每日英语相关表

-- 英语名言表
CREATE TABLE public.english_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  quote_translation TEXT NOT NULL,
  author TEXT NOT NULL,
  author_translation TEXT,
  category TEXT DEFAULT 'motivational',
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 英语单词表
CREATE TABLE public.english_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  pronunciation TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  example_translation TEXT NOT NULL,
  word_type TEXT DEFAULT 'noun' CHECK (word_type IN ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction')),
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  frequency_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 英语短语表
CREATE TABLE public.english_phrases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase_english TEXT NOT NULL,
  phrase_chinese TEXT NOT NULL,
  meaning_explanation TEXT NOT NULL,
  example_sentence TEXT,
  example_translation TEXT,
  category TEXT DEFAULT 'idiom' CHECK (category IN ('idiom', 'colloquial', 'business', 'academic')),
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 英语听力文本表
CREATE TABLE public.english_listening (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  translation TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  topic TEXT DEFAULT 'general' CHECK (topic IN ('general', 'business', 'health', 'technology', 'education', 'travel')),
  word_count INTEGER,
  estimated_duration INTEGER, -- 预计听力时长（秒）
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 积分商城商品表
CREATE TABLE public.points_store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('game_skin', 'game_power', 'virtual_badge', 'unlock_feature')),
  price_points INTEGER NOT NULL CHECK (price_points > 0),
  icon_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT -1, -- -1 表示无限库存
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 用户购买记录表
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.points_store_items(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 启用RLS
ALTER TABLE public.english_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.english_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.english_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.english_listening ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- 英语学习内容的RLS策略（所有用户可查看）
CREATE POLICY "Anyone can view english quotes" ON public.english_quotes FOR SELECT USING (true);
CREATE POLICY "Anyone can view english words" ON public.english_words FOR SELECT USING (true);
CREATE POLICY "Anyone can view english phrases" ON public.english_phrases FOR SELECT USING (true);
CREATE POLICY "Anyone can view english listening" ON public.english_listening FOR SELECT USING (true);

-- 积分商城的RLS策略
CREATE POLICY "Anyone can view store items" ON public.points_store_items FOR SELECT USING (is_available = true);

-- 用户购买记录的RLS策略
CREATE POLICY "Users can view their own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchases" ON public.user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建更新触发器
CREATE TRIGGER update_english_quotes_updated_at BEFORE UPDATE ON public.english_quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_english_words_updated_at BEFORE UPDATE ON public.english_words FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_english_phrases_updated_at BEFORE UPDATE ON public.english_phrases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_english_listening_updated_at BEFORE UPDATE ON public.english_listening FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_points_store_items_updated_at BEFORE UPDATE ON public.points_store_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 插入示例数据
INSERT INTO public.english_quotes (quote_text, quote_translation, author, author_translation, category) VALUES
('The only way to do great work is to love what you do.', '做伟大工作的唯一方法就是热爱你所做的事。', 'Steve Jobs', '史蒂夫·乔布斯', 'motivational'),
('Innovation distinguishes between a leader and a follower.', '创新区分了领导者和追随者。', 'Steve Jobs', '史蒂夫·乔布斯', 'business'),
('Life is what happens to you while you are busy making other plans.', '生活就是当你忙于制定其他计划时发生在你身上的事情。', 'John Lennon', '约翰·列侬', 'life'),
('The future belongs to those who believe in the beauty of their dreams.', '未来属于那些相信梦想之美的人。', 'Eleanor Roosevelt', '埃莉诺·罗斯福', 'inspirational'),
('It is during our darkest moments that we must focus to see the light.', '正是在我们最黑暗的时刻，我们必须专注于看到光明。', 'Aristotle', '亚里士多德', 'philosophy');

INSERT INTO public.english_words (word, pronunciation, meaning, example_sentence, example_translation, word_type, difficulty_level) VALUES
('Resilience', '/rɪˈzɪljəns/', '韧性；恢复力', 'Her resilience helped her overcome many challenges.', '她的韧性帮助她克服了许多挑战。', 'noun', 'intermediate'),
('Perseverance', '/ˌpɜːrsəˈvɪrəns/', '坚持不懈；毅力', 'Success requires perseverance and dedication.', '成功需要坚持不懈和奉献精神。', 'noun', 'intermediate'),
('Eloquent', '/ˈeləkwənt/', '雄辩的；有说服力的', 'She gave an eloquent speech at the conference.', '她在会议上发表了一场雄辩的演讲。', 'adjective', 'advanced'),
('Serendipity', '/ˌserənˈdɪpəti/', '意外发现；机缘巧合', 'Meeting my best friend was pure serendipity.', '遇见我最好的朋友纯属机缘巧合。', 'noun', 'advanced'),
('Ubiquitous', '/juːˈbɪkwɪtəs/', '无处不在的；普遍存在的', 'Smartphones have become ubiquitous in modern society.', '智能手机在现代社会中已经无处不在。', 'adjective', 'advanced');

INSERT INTO public.english_phrases (phrase_english, phrase_chinese, meaning_explanation, example_sentence, example_translation, category) VALUES
('Break the ice', '打破僵局', '在社交场合中开始对话或缓解紧张气氛', 'He told a joke to break the ice at the meeting.', '他在会议上讲了个笑话来打破僵局。', 'idiom'),
('Hit the nail on the head', '一针见血；说中要害', '准确地指出问题或说出真相', 'Your analysis really hit the nail on the head.', '你的分析真是一针见血。', 'idiom'),
('Go the extra mile', '付出额外努力', '做超出期望或要求的事情', 'She always goes the extra mile for her customers.', '她总是为顾客付出额外的努力。', 'business'),
('Think outside the box', '跳出固有思维模式', '用创新或非传统的方式思考问题', 'We need to think outside the box to solve this problem.', '我们需要跳出固有思维模式来解决这个问题。', 'business'),
('Keep your chin up', '保持乐观；别灰心', '鼓励某人在困难时期保持积极态度', 'Keep your chin up, things will get better.', '保持乐观，事情会好转的。', 'colloquial');

INSERT INTO public.english_listening (title, content, translation, difficulty_level, topic, word_count, estimated_duration) VALUES
('Morning Routine', 'Every morning, I wake up at 6 AM and start my day with a cup of coffee. Then I read the news for about 15 minutes before getting ready for work.', '每天早上，我6点起床，喝杯咖啡开始新的一天。然后我会看大约15分钟的新闻，再准备上班。', 'beginner', 'general', 32, 20),
('Healthy Living Tips', 'Maintaining a healthy lifestyle requires balance. Regular exercise, a nutritious diet, and adequate sleep are fundamental. Additionally, managing stress through meditation or hobbies can significantly improve your overall well-being.', '保持健康的生活方式需要平衡。规律运动、营养饮食和充足睡眠是基础。此外，通过冥想或爱好来管理压力可以显著改善你的整体健康。', 'intermediate', 'health', 45, 35),
('Technology Innovation', 'Artificial intelligence is revolutionizing various industries, from healthcare to finance. Machine learning algorithms can analyze vast amounts of data, providing insights that were previously impossible to obtain. However, ethical considerations regarding AI implementation remain crucial.', '人工智能正在革命性地改变各个行业，从医疗保健到金融。机器学习算法可以分析大量数据，提供以前无法获得的洞察。然而，关于AI实施的伦理考虑仍然至关重要。', 'advanced', 'technology', 52, 40);

INSERT INTO public.points_store_items (item_name, item_description, item_type, price_points, icon_url) VALUES
('五子棋经典皮肤', '为五子棋游戏解锁经典木质棋盘皮肤', 'game_skin', 50, '🎨'),
('记忆翻牌加时道具', '为记忆翻牌游戏增加30秒时间', 'game_power', 30, '⏰'),
('打卡达人徽章', '连续打卡30天专属徽章', 'virtual_badge', 100, '🏆'),
('呼吸练习增强版', '解锁更多呼吸练习模式', 'unlock_feature', 80, '🧘'),
('飞鸟游戏护盾', '为飞鸟游戏提供一次碰撞保护', 'game_power', 25, '🛡️'),
('英语学习进阶', '解锁高难度英语学习内容', 'unlock_feature', 120, '📚');
