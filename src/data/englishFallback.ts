// 离线/请求失败时的每日英语兜底内容。
// 正式内容以 Supabase english_* 四张表为准（管理后台可维护）；
// 这里只保留让页面不至于空白的最小集合。

export const fallbackQuotes = [
  {
    quote_text: 'Every day is a new beginning.',
    quote_translation: '每一天都是新的开始。',
    author: 'Unknown',
    author_translation: '佚名',
    difficulty_level: 'beginner',
    category: 'motivational',
  },
  {
    quote_text: 'Practice makes perfect.',
    quote_translation: '熟能生巧。',
    author: 'Unknown',
    author_translation: '佚名',
    difficulty_level: 'beginner',
    category: 'motivational',
  },
  {
    quote_text: 'Where there is a will, there is a way.',
    quote_translation: '有志者事竟成。',
    author: 'Unknown',
    author_translation: '佚名',
    difficulty_level: 'beginner',
    category: 'motivational',
  },
  {
    quote_text: 'Actions speak louder than words.',
    quote_translation: '行动胜过言语。',
    author: 'Unknown',
    author_translation: '佚名',
    difficulty_level: 'beginner',
    category: 'motivational',
  },
  {
    quote_text: "Don't put off till tomorrow what you can do today.",
    quote_translation: '今日事今日毕。',
    author: 'Benjamin Franklin',
    author_translation: '本杰明·富兰克林',
    difficulty_level: 'beginner',
    category: 'motivational',
  },
  {
    quote_text: "Rome wasn't built in a day.",
    quote_translation: '罗马不是一天建成的。',
    author: 'Unknown',
    author_translation: '佚名',
    difficulty_level: 'beginner',
    category: 'motivational',
  },
];

export const fallbackWords = [
  {
    word: 'apple',
    pronunciation: '/ˈæpl/',
    meaning: '苹果',
    example_sentence: 'I eat an apple every day.',
    example_translation: '我每天吃一个苹果。',
    word_type: 'noun',
    difficulty_level: 'beginner',
  },
  {
    word: 'book',
    pronunciation: '/bʊk/',
    meaning: '书',
    example_sentence: 'This is a good book.',
    example_translation: '这是一本好书。',
    word_type: 'noun',
    difficulty_level: 'beginner',
  },
  {
    word: 'happy',
    pronunciation: '/ˈhæpi/',
    meaning: '快乐的',
    example_sentence: 'She looks very happy today.',
    example_translation: '她今天看起来很快乐。',
    word_type: 'adjective',
    difficulty_level: 'beginner',
  },
  {
    word: 'water',
    pronunciation: '/ˈwɔːtər/',
    meaning: '水',
    example_sentence: 'Please drink more water.',
    example_translation: '请多喝水。',
    word_type: 'noun',
    difficulty_level: 'beginner',
  },
  {
    word: 'health',
    pronunciation: '/helθ/',
    meaning: '健康',
    example_sentence: 'Health is more important than money.',
    example_translation: '健康比金钱更重要。',
    word_type: 'noun',
    difficulty_level: 'beginner',
  },
  {
    word: 'family',
    pronunciation: '/ˈfæməli/',
    meaning: '家庭',
    example_sentence: 'I love my family very much.',
    example_translation: '我非常爱我的家人。',
    word_type: 'noun',
    difficulty_level: 'beginner',
  },
];

export const fallbackPhrases = [
  {
    phrase_english: 'How are you?',
    phrase_chinese: '你好吗？',
    meaning_explanation: '用于问候别人的身体状况或近况的常用表达',
    example_sentence: 'Hello, how are you today?',
    example_translation: '你好，你今天怎么样？',
    difficulty_level: 'beginner',
  },
  {
    phrase_english: 'Thank you',
    phrase_chinese: '谢谢你',
    meaning_explanation: '表达感谢的基本礼貌用语',
    example_sentence: 'Thank you for your help.',
    example_translation: '谢谢你的帮助。',
    difficulty_level: 'beginner',
  },
  {
    phrase_english: 'Nice to meet you',
    phrase_chinese: '很高兴见到你',
    meaning_explanation: '初次见面时使用的礼貌表达',
    example_sentence: 'Nice to meet you, Mr. Wang.',
    example_translation: '很高兴见到你，王先生。',
    difficulty_level: 'beginner',
  },
  {
    phrase_english: 'Take care',
    phrase_chinese: '保重',
    meaning_explanation: '道别时表达关心的常用语',
    example_sentence: 'Goodbye, take care!',
    example_translation: '再见，保重！',
    difficulty_level: 'beginner',
  },
  {
    phrase_english: 'See you later',
    phrase_chinese: '回头见',
    meaning_explanation: '道别时表示之后还会见面',
    example_sentence: 'I have to go now. See you later!',
    example_translation: '我得走了。回头见！',
    difficulty_level: 'beginner',
  },
  {
    phrase_english: 'Good luck',
    phrase_chinese: '祝你好运',
    meaning_explanation: '祝愿对方顺利的表达',
    example_sentence: 'Good luck with your exam!',
    example_translation: '祝你考试顺利！',
    difficulty_level: 'beginner',
  },
];

export const fallbackListening = [
  {
    title: 'My Daily Routine',
    content:
      "I wake up at seven o'clock every morning. First, I brush my teeth and wash my face. Then I have breakfast with my family. I usually eat bread and drink milk. After breakfast, I go to work by bus. I work from nine to five. In the evening, I watch TV and read books. I go to bed at ten o'clock.",
    translation:
      '我每天早上七点起床。首先，我刷牙洗脸。然后我和家人一起吃早餐。我通常吃面包和喝牛奶。早餐后，我坐公交车去上班。我从九点工作到五点。晚上，我看电视和读书。我十点睡觉。',
    difficulty_level: 'beginner',
    topic: 'daily_life',
    estimated_duration: 45,
  },
  {
    title: 'At the Restaurant',
    content:
      'Welcome to our restaurant! What would you like to eat today? We have delicious pizza, pasta, and salad. Would you like something to drink? We have water, juice, and coffee. The pizza is very popular here. It costs ten dollars. Would you like to try it?',
    translation:
      '欢迎来到我们的餐厅！您今天想吃什么？我们有美味的披萨、意大利面和沙拉。您想喝点什么吗？我们有水、果汁和咖啡。披萨在这里很受欢迎。它十美元。您想试试吗？',
    difficulty_level: 'beginner',
    topic: 'food',
    estimated_duration: 40,
  },
];
