-- 添加更多英语名言
INSERT INTO english_quotes (quote_text, quote_translation, author, author_translation, category, difficulty_level) VALUES
('The only way to do great work is to love what you do.', '做出伟大工作的唯一方法就是热爱你所做的。', 'Steve Jobs', '史蒂夫·乔布斯', 'motivational', 'intermediate'),
('Life is what happens to you while you''re busy making other plans.', '生活就是在你忙于制定其他计划时发生在你身上的事情。', 'John Lennon', '约翰·列侬', 'life', 'advanced'),
('The future belongs to those who believe in the beauty of their dreams.', '未来属于那些相信自己梦想之美的人。', 'Eleanor Roosevelt', '埃莉诺·罗斯福', 'motivational', 'intermediate'),
('It is during our darkest moments that we must focus to see the light.', '正是在我们最黑暗的时刻，我们必须专注于看到光明。', 'Aristotle', '亚里士多德', 'inspirational', 'advanced'),
('Be yourself; everyone else is already taken.', '做你自己；其他人都已经被占用了。', 'Oscar Wilde', '奥斯卡·王尔德', 'wisdom', 'beginner'),
('Two things are infinite: the universe and human stupidity; and I''m not sure about the universe.', '有两样东西是无限的：宇宙和人类的愚蠢；我不确定宇宙是否无限。', 'Albert Einstein', '阿尔伯特·爱因斯坦', 'wisdom', 'advanced'),
('A room without books is like a body without a soul.', '没有书籍的房间就像没有灵魂的身体。', 'Marcus Tullius Cicero', '马库斯·图利乌斯·西塞罗', 'wisdom', 'intermediate'),
('In the middle of difficulty lies opportunity.', '在困难中蕴含着机会。', 'Albert Einstein', '阿尔伯特·爱因斯坦', 'motivational', 'beginner'),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', '成功不是最终的，失败不是致命的：重要的是继续前进的勇气。', 'Winston Churchill', '温斯顿·丘吉尔', 'motivational', 'intermediate'),
('The greatest glory in living lies not in never falling, but in rising every time we fall.', '人生最大的荣耀不在于从不跌倒，而在于每次跌倒后都能重新站起来。', 'Nelson Mandela', '纳尔逊·曼德拉', 'inspirational', 'advanced');

-- 添加更多英语单词
INSERT INTO english_words (word, pronunciation, meaning, example_sentence, example_translation, word_type, difficulty_level, frequency_rank) VALUES
('journey', '/ˈdʒɜːni/', '旅程，旅行', 'Life is a journey, not a destination.', '人生是一段旅程，而不是目的地。', 'noun', 'beginner', 500),
('challenge', '/ˈtʃælɪndʒ/', '挑战', 'Every challenge is an opportunity to grow.', '每个挑战都是成长的机会。', 'noun', 'intermediate', 800),
('accomplish', '/əˈkʌmplɪʃ/', '完成，实现', 'She accomplished her goals through hard work.', '她通过努力工作实现了目标。', 'verb', 'intermediate', 1200),
('perspective', '/pərˈspektɪv/', '观点，视角', 'Different perspectives lead to better solutions.', '不同的观点能产生更好的解决方案。', 'noun', 'advanced', 1500),
('resilience', '/rɪˈzɪliəns/', '韧性，恢复力', 'Resilience is key to overcoming difficulties.', '韧性是克服困难的关键。', 'noun', 'advanced', 2000),
('innovative', '/ˈɪnəveɪtɪv/', '创新的', 'The company is known for its innovative products.', '这家公司以其创新产品而闻名。', 'adjective', 'intermediate', 1800),
('collaborate', '/kəˈlæbəreɪt/', '合作', 'We need to collaborate to achieve success.', '我们需要合作才能获得成功。', 'verb', 'intermediate', 1600),
('enthusiastic', '/ɪnˌθuːziˈæstɪk/', '热情的', 'She is enthusiastic about learning English.', '她对学习英语很热情。', 'adjective', 'advanced', 2200),
('determine', '/dɪˈtɜːrmɪn/', '决定，确定', 'Hard work will determine your success.', '努力工作将决定你的成功。', 'verb', 'beginner', 600),
('appreciate', '/əˈpriːʃieɪt/', '欣赏，感激', 'I appreciate your help very much.', '我非常感激你的帮助。', 'verb', 'intermediate', 900);

-- 添加更多英语短语
INSERT INTO english_phrases (phrase_english, phrase_chinese, meaning_explanation, example_sentence, example_translation, category, difficulty_level) VALUES
('break the ice', '打破僵局', '用来开始谈话或让人们感到放松的行为', 'He told a joke to break the ice at the meeting.', '他在会议上讲了个笑话来打破僵局。', 'idiom', 'intermediate'),
('piece of cake', '小菜一碟', '表示某事非常容易', 'The math test was a piece of cake for her.', '数学考试对她来说是小菜一碟。', 'idiom', 'beginner'),
('hit the nail on the head', '一针见血', '准确地指出问题或说对了', 'You hit the nail on the head with that comment.', '你那个评论真是一针见血。', 'idiom', 'advanced'),
('burn the midnight oil', '熬夜工作', '工作或学习到很晚', 'Students often burn the midnight oil before exams.', '学生们经常在考试前熬夜。', 'idiom', 'intermediate'),
('spill the beans', '泄露秘密', '意外地透露信息', 'Don''t spill the beans about the surprise party.', '不要泄露惊喜聚会的秘密。', 'idiom', 'intermediate'),
('cost an arm and a leg', '非常昂贵', '花费很多钱', 'That new car cost him an arm and a leg.', '那辆新车花了他很多钱。', 'idiom', 'intermediate'),
('once in a blue moon', '千载难逢', '很少发生', 'He visits his hometown once in a blue moon.', '他很少回家乡。', 'idiom', 'advanced'),
('go the extra mile', '额外努力', '比要求的做得更多', 'She always goes the extra mile for her students.', '她总是为学生付出额外的努力。', 'idiom', 'intermediate'),
('think outside the box', '跳出思维定式', '用创新的方式思考', 'We need to think outside the box to solve this problem.', '我们需要跳出思维定式来解决这个问题。', 'idiom', 'advanced'),
('get the ball rolling', '开始行动', '开始某个过程或活动', 'Let''s get the ball rolling on this project.', '让我们开始这个项目吧。', 'idiom', 'intermediate');

-- 添加更多英语听力文本
INSERT INTO english_listening (title, content, translation, difficulty_level, topic, word_count, estimated_duration) VALUES
('Daily Routine', 'Every morning, Sarah wakes up at 6:30 AM. She starts her day with a cup of coffee and reads the news for 15 minutes. Then she exercises for 30 minutes before taking a shower. After breakfast, she leaves for work at 8:00 AM. Sarah works as a teacher at a local school. She enjoys her job because she loves working with children.', '每天早上，莎拉6:30起床。她以一杯咖啡开始新的一天，并花15分钟阅读新闻。然后她锻炼30分钟，之后洗澡。早餐后，她8:00出门上班。莎拉在当地一所学校当老师。她喜欢这份工作，因为她喜欢和孩子们一起工作。', 'beginner', 'daily_life', 85, 60),
('Technology and Life', 'Technology has dramatically changed how we communicate and work. Smartphones allow us to stay connected with friends and family anywhere in the world. Social media platforms help us share our experiences and stay updated with current events. However, it''s important to find a balance between digital and real-world interactions.', '科技极大地改变了我们的交流和工作方式。智能手机让我们能够与世界各地的朋友和家人保持联系。社交媒体平台帮助我们分享经历并了解时事。然而，在数字互动和现实世界互动之间找到平衡很重要。', 'intermediate', 'technology', 120, 90),
('Environmental Protection', 'Climate change is one of the most pressing issues of our time. Scientists warn that global temperatures are rising due to greenhouse gas emissions. To combat this problem, individuals can make small changes in their daily lives. These include using public transportation, reducing energy consumption, and supporting renewable energy sources. Every action counts in protecting our planet.', '气候变化是我们这个时代最紧迫的问题之一。科学家警告说，由于温室气体排放，全球气温正在上升。为了解决这个问题，个人可以在日常生活中做出小的改变。这包括使用公共交通、减少能源消耗和支持可再生能源。保护地球的每一个行动都很重要。', 'advanced', 'environment', 150, 120),
('Healthy Living', 'Maintaining good health requires a combination of proper nutrition, regular exercise, and adequate sleep. Eating a balanced diet with plenty of fruits and vegetables provides essential nutrients. Exercise helps strengthen muscles and improve cardiovascular health. Getting 7-8 hours of sleep each night allows the body to recover and regenerate.', '保持健康需要适当的营养、定期锻炼和充足睡眠的结合。均衡饮食，多吃水果和蔬菜，能提供必需的营养素。锻炼有助于增强肌肉和改善心血管健康。每晚7-8小时的睡眠让身体得以恢复和再生。', 'intermediate', 'health', 110, 85),
('Travel and Culture', 'Traveling to different countries offers opportunities to experience diverse cultures and traditions. Each destination has its unique customs, cuisine, and historical landmarks. Learning about local traditions helps travelers develop cultural awareness and appreciation. Whether exploring ancient temples or trying new foods, travel broadens our understanding of the world.', '到不同国家旅行提供了体验多元文化和传统的机会。每个目的地都有其独特的习俗、美食和历史地标。了解当地传统有助于旅行者培养文化意识和欣赏能力。无论是探索古代寺庙还是尝试新食物，旅行都能拓宽我们对世界的理解。', 'intermediate', 'travel', 125, 95);