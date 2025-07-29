-- 添加更多英语内容，使用正确的topic值
INSERT INTO english_quotes (quote_text, quote_translation, author, author_translation, category, difficulty_level) VALUES
('The only way to do great work is to love what you do.', '做出伟大工作的唯一方法就是热爱你所做的。', 'Steve Jobs', '史蒂夫·乔布斯', 'motivational', 'intermediate'),
('Life is what happens to you while you''re busy making other plans.', '生活就是在你忙于制定其他计划时发生在你身上的事情。', 'John Lennon', '约翰·列侬', 'life', 'advanced'),
('The future belongs to those who believe in the beauty of their dreams.', '未来属于那些相信自己梦想之美的人。', 'Eleanor Roosevelt', '埃莉诺·罗斯福', 'motivational', 'intermediate'),
('It is during our darkest moments that we must focus to see the light.', '正是在我们最黑暗的时刻，我们必须专注于看到光明。', 'Aristotle', '亚里士多德', 'inspirational', 'advanced'),
('Be yourself; everyone else is already taken.', '做你自己；其他人都已经被占用了。', 'Oscar Wilde', '奥斯卡·王尔德', 'wisdom', 'beginner')
ON CONFLICT (quote_text) DO NOTHING;

-- 添加更多英语单词（使用ON CONFLICT避免重复）
INSERT INTO english_words (word, pronunciation, meaning, example_sentence, example_translation, word_type, difficulty_level, frequency_rank) VALUES
('challenge', '/ˈtʃælɪndʒ/', '挑战', 'Every challenge is an opportunity to grow.', '每个挑战都是成长的机会。', 'noun', 'intermediate', 800),
('accomplish', '/əˈkʌmplɪʃ/', '完成，实现', 'She accomplished her goals through hard work.', '她通过努力工作实现了目标。', 'verb', 'intermediate', 1200),
('perspective', '/pərˈspektɪv/', '观点，视角', 'Different perspectives lead to better solutions.', '不同的观点能产生更好的解决方案。', 'noun', 'advanced', 1500),
('resilience', '/rɪˈzɪliəns/', '韧性，恢复力', 'Resilience is key to overcoming difficulties.', '韧性是克服困难的关键。', 'noun', 'advanced', 2000),
('innovative', '/ˈɪnəveɪtɪv/', '创新的', 'The company is known for its innovative products.', '这家公司以其创新产品而闻名。', 'adjective', 'intermediate', 1800),
('collaborate', '/kəˈlæbəreɪt/', '合作', 'We need to collaborate to achieve success.', '我们需要合作才能获得成功。', 'verb', 'intermediate', 1600),
('enthusiastic', '/ɪnˌθuːziˈæstɪk/', '热情的', 'She is enthusiastic about learning English.', '她对学习英语很热情。', 'adjective', 'advanced', 2200),
('magnificent', '/mægˈnɪfɪsənt/', '壮丽的，宏伟的', 'The view from the mountain was magnificent.', '从山上看到的景色很壮丽。', 'adjective', 'intermediate', 2500)
ON CONFLICT (word) DO NOTHING;

-- 添加更多英语短语
INSERT INTO english_phrases (phrase_english, phrase_chinese, meaning_explanation, example_sentence, example_translation, category, difficulty_level) VALUES
('break the ice', '打破僵局', '用来开始谈话或让人们感到放松的行为', 'He told a joke to break the ice at the meeting.', '他在会议上讲了个笑话来打破僵局。', 'idiom', 'intermediate'),
('piece of cake', '小菜一碟', '表示某事非常容易', 'The math test was a piece of cake for her.', '数学考试对她来说是小菜一碟。', 'idiom', 'beginner'),
('hit the nail on the head', '一针见血', '准确地指出问题或说对了', 'You hit the nail on the head with that comment.', '你那个评论真是一针见血。', 'idiom', 'advanced'),
('burn the midnight oil', '熬夜工作', '工作或学习到很晚', 'Students often burn the midnight oil before exams.', '学生们经常在考试前熬夜。', 'idiom', 'intermediate'),
('spill the beans', '泄露秘密', '意外地透露信息', 'Don''t spill the beans about the surprise party.', '不要泄露惊喜聚会的秘密。', 'idiom', 'intermediate')
ON CONFLICT (phrase_english) DO NOTHING;

-- 添加更多英语听力文本（使用标准topic值）
INSERT INTO english_listening (title, content, translation, difficulty_level, topic, word_count, estimated_duration) VALUES
('Daily Life Story', 'Every morning, Sarah wakes up at 6:30 AM. She starts her day with a cup of coffee and reads the news for 15 minutes. Then she exercises for 30 minutes before taking a shower. After breakfast, she leaves for work at 8:00 AM. Sarah works as a teacher at a local school.', '每天早上，莎拉6:30起床。她以一杯咖啡开始新的一天，并花15分钟阅读新闻。然后她锻炼30分钟，之后洗澡。早餐后，她8:00出门上班。莎拉在当地一所学校当老师。', 'beginner', 'general', 85, 60),
('Technology Today', 'Technology has dramatically changed how we communicate and work. Smartphones allow us to stay connected with friends and family anywhere in the world. Social media platforms help us share our experiences and stay updated with current events.', '科技极大地改变了我们的交流和工作方式。智能手机让我们能够与世界各地的朋友和家人保持联系。社交媒体平台帮助我们分享经历并了解时事。', 'intermediate', 'general', 120, 90),
('Healthy Lifestyle', 'Maintaining good health requires a combination of proper nutrition, regular exercise, and adequate sleep. Eating a balanced diet with plenty of fruits and vegetables provides essential nutrients. Exercise helps strengthen muscles and improve cardiovascular health.', '保持健康需要适当的营养、定期锻炼和充足睡眠的结合。均衡饮食，多吃水果和蔬菜，能提供必需的营养素。锻炼有助于增强肌肉和改善心血管健康。', 'intermediate', 'general', 110, 85)
ON CONFLICT (title) DO NOTHING;