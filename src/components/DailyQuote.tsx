
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteData {
  text: string;
  english: string;
  author: string;
}

const DailyQuote = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dailyQuotes, setDailyQuotes] = useState<QuoteData[]>([]);

  const allQuotes: QuoteData[] = [
    // 原有的健康相关名言
    {
      text: "健康不是一切，但没有健康就没有一切。",
      english: "Health is not everything, but without health, everything is nothing.",
      author: "叔本华 (Schopenhauer)"
    },
    {
      text: "保持身体健康是一种义务，否则我们无法保持思想的清晰和坚强。",
      english: "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.",
      author: "佛陀 (Buddha)"
    },
    {
      text: "早睡早起使人健康、富有、明智。",
      english: "Early to bed and early to rise makes a man healthy, wealthy, and wise.",
      author: "本杰明·富兰克林 (Benjamin Franklin)"
    },
    {
      text: "快乐的心是最好的药。",
      english: "A merry heart doeth good like a medicine.",
      author: "《圣经》箴言 (Proverbs)"
    },
    {
      text: "身体是心灵的殿堂，要保持它的清洁和健康。",
      english: "The body is the temple of the soul. Keep it clean and healthy.",
      author: "印度谚语 (Indian Proverb)"
    },
    {
      text: "最好的医生是你自己，最好的药物是时间，最好的心情是宁静。",
      english: "The best doctor is yourself, the best medicine is time, and the best mood is tranquility.",
      author: "中国谚语 (Chinese Proverb)"
    },
    {
      text: "健康是智慧的条件，是愉快的标志。",
      english: "Health is a condition of wisdom, and a sign of happiness.",
      author: "爱默生 (Ralph Waldo Emerson)"
    },
    {
      text: "一个健康的身体是灵魂的客厅，一个病弱的身体是灵魂的监狱。",
      english: "A healthy body is a guest chamber for the soul; a sick body is a prison.",
      author: "弗朗西斯·培根 (Francis Bacon)"
    },
    {
      text: "治疗最佳方法是预防。",
      english: "The best way to cure is to prevent.",
      author: "希波克拉底 (Hippocrates)"
    },
    {
      text: "积极的心态是健康的良药。",
      english: "A positive attitude is good medicine for health.",
      author: "现代格言 (Modern Saying)"
    },
    {
      text: "生命在于运动。",
      english: "Life is movement.",
      author: "伏尔泰 (Voltaire)"
    },
    {
      text: "有规律的生活是健康与长寿的秘诀。",
      english: "A regular life is the secret of health and longevity.",
      author: "巴尔扎克 (Balzac)"
    },
    {
      text: "锻炼身体要经常，要坚持，人和机器一样，经常运动才不能生锈。",
      english: "Exercise should be regular and persistent. Like machines, people need regular movement to avoid rust.",
      author: "朱德"
    },
    {
      text: "健全的心智寓于健全的身体。",
      english: "A sound mind in a sound body.",
      author: "古罗马格言 (Ancient Roman Saying)"
    },
    {
      text: "忧愁、顾虑和悲观，可以使人得病；积极、愉快和坚强的意志和乐观的情绪，可以战胜疾病。",
      english: "Worry, anxiety and pessimism can make people sick; positive, happy and strong will and optimistic mood can overcome disease.",
      author: "巴甫洛夫 (Pavlov)"
    },
    // 新增的50句名言
    {
      text: "成就一番伟业的唯一途径就是热爱自己的事业。",
      english: "The only way to do great work is to love what you do.",
      author: "史蒂夫·乔布斯 (Steve Jobs)"
    },
    {
      text: "千里之行，始于足下。",
      english: "The journey of a thousand miles begins with a single step.",
      author: "老子 (Lao Tzu)"
    },
    {
      text: "相信自己能做到，你就已经成功了一半。",
      english: "Believe you can and you're halfway there.",
      author: "西奥多·罗斯福 (Theodore Roosevelt)"
    },
    {
      text: "只要你不停止，走得再慢也无妨。",
      english: "It does not matter how slowly you go as long as you do not stop.",
      author: "孔子 (Confucius)"
    },
    {
      text: "生活，要像明天你就会死去一样；学习，要像你将会永生一样。",
      english: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
      author: "莫罕达斯·甘地 (Mahatma Gandhi)"
    },
    {
      text: "成功不是终点，失败也非末日：重要的是继续前进的勇气。",
      english: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "温斯顿·丘吉尔 (Winston Churchill)"
    },
    {
      text: "我没有失败。我只是找到了一万种行不通的方法。",
      english: "I have not failed. I've just found 10,000 ways that won't work.",
      author: "托马斯·爱迪生 (Thomas Edison)"
    },
    {
      text: "未来属于那些相信梦想之美的人。",
      english: "The future belongs to those who believe in the beauty of their dreams.",
      author: "埃莉诺·罗斯福 (Eleanor Roosevelt)"
    },
    {
      text: "不要努力成为一个成功的人，而要努力成为一个有价值的人。",
      english: "Strive not to be a success, but rather to be of value.",
      author: "阿尔伯特·爱因斯坦 (Albert Einstein)"
    },
    {
      text: "预测未来的最好方法就是去创造未来。",
      english: "The best way to predict the future is to create it.",
      author: "彼得·德鲁克 (Peter Drucker)"
    },
    {
      text: "你没投的球，命中率是百分之百的零。",
      english: "You miss 100% of the shots you don't take.",
      author: "韦恩·格雷茨基 (Wayne Gretzky)"
    },
    {
      text: "我们唯一需要恐惧的，是恐惧本身。",
      english: "The only thing we have to fear is fear itself.",
      author: "富兰克林·D·罗斯福 (Franklin D. Roosevelt)"
    },
    {
      text: "每个困难的中间都隐藏着机遇。",
      english: "In the middle of every difficulty lies opportunity.",
      author: "阿尔伯特·爱因斯坦 (Albert Einstein)"
    },
    {
      text: "成为你本可以成为的人，永远不会太晚。",
      english: "It is never too late to be what you might have been.",
      author: "乔治·艾略特 (George Eliot)"
    },
    {
      text: "无论你认为自己能或不能，你都是对的。",
      english: "Whether you think you can, or you think you can't – you're right.",
      author: "亨利·福特 (Henry Ford)"
    },
    {
      text: "我们最大的光荣不在于永不跌倒，而在于每次跌倒后都能重新站起来。",
      english: "Our greatest glory is not in never falling, but in rising every time we fall.",
      author: "孔子 (Confucius)"
    },
    {
      text: "天才是百分之一的灵感，加上百分之九十九的汗水。",
      english: "Genius is one percent inspiration, ninety-nine percent perspiration.",
      author: "托马斯·爱迪生 (Thomas Edison)"
    },
    {
      text: "我们人生的目的在于获得幸福。",
      english: "The purpose of our lives is to be happy.",
      author: "达赖喇嘛 (Dalai Lama)"
    },
    {
      text: "如果你想提升自己，先去提升别人。",
      english: "If you want to lift yourself up, lift up someone else.",
      author: "布克·T·华盛顿 (Booker T. Washington)"
    },
    {
      text: "我们身后的事和我们面前的事，与我们内心的事相比，都是微不足道的。",
      english: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
      author: "拉尔夫·瓦尔多·爱默生 (Ralph Waldo Emerson)"
    },
    {
      text: "我走得很慢，但我从不后退。",
      english: "I am a slow walker, but I never walk back.",
      author: "亚伯拉罕·林肯 (Abraham Lincoln)"
    },
    {
      text: "领先的秘诀在于开始行动。",
      english: "The secret of getting ahead is getting started.",
      author: "马克·吐温 (Mark Twain)"
    },
    {
      text: "我们所有的梦想都能成真，只要我们有勇气去追求。",
      english: "All our dreams can come true, if we have the courage to pursue them.",
      author: "沃尔特·迪士尼 (Walt Disney)"
    },
    {
      text: "要这样行动，就好像你做的事会产生影响。它确实如此。",
      english: "Act as if what you do makes a difference. It does.",
      author: "威廉·詹姆斯 (William James)"
    },
    {
      text: "想象力的力量让我们无所不能。",
      english: "The power of imagination makes us infinite.",
      author: "约翰·缪尔 (John Muir)"
    },
    {
      text: "告诉我，我会忘记；教导我，我会记住；让我参与，我才能学会。",
      english: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
      author: "本杰明·富兰克林 (Benjamin Franklin)"
    },
    {
      text: "投资于知识，收益最佳。",
      english: "An investment in knowledge pays the best interest.",
      author: "本杰明·富兰克林 (Benjamin Franklin)"
    },
    {
      text: "努力成为某人乌云中的一道彩虹。",
      english: "Try to be a rainbow in someone's cloud.",
      author: "玛雅·安吉罗 (Maya Angelou)"
    },
    {
      text: "你必须成为你在世上希望看到的改变。",
      english: "You must be the change you wish to see in the world.",
      author: "莫罕达斯·甘地 (Mahatma Gandhi)"
    },
    {
      text: "教育的根是苦的，但果实是甜的。",
      english: "The roots of education are bitter, but the fruit is sweet.",
      author: "亚里士多德 (Aristotle)"
    },
    {
      text: "求知若饥，虚心若愚。",
      english: "Stay hungry, stay foolish.",
      author: "史蒂夫·乔布斯 (Steve Jobs)"
    },
    {
      text: "心之所向，身之所往。",
      english: "What we think, we become.",
      author: "佛陀 (Buddha)"
    },
    {
      text: "逻辑会带你从A点到B点，想象力将带你到任何地方。",
      english: "Logic will get you from A to B. Imagination will take you everywhere.",
      author: "阿尔伯特·爱因斯坦 (Albert Einstein)"
    },
    {
      text: "梦想远大，敢于失败。",
      english: "Dream big and dare to fail.",
      author: "诺曼·沃恩 (Norman Vaughan)"
    },
    {
      text: "成功的武者是拥有激光般专注力的普通人。",
      english: "The successful warrior is the average man, with laser-like focus.",
      author: "李小龙 (Bruce Lee)"
    },
    {
      text: "一个从未犯过错的人，从未尝试过任何新事物。",
      english: "A person who never made a mistake never tried anything new.",
      author: "阿尔伯特·爱因斯坦 (Albert Einstein)"
    },
    {
      text: "如果你不愿学习，没人能帮你。如果你决心学习，没人能挡你。",
      english: "If you are not willing to learn, no one can help you. If you are determined to learn, no one can stop you.",
      author: "齐格·金克拉 (Zig Ziglar)"
    },
    {
      text: "在你所在之处，用你所拥有的一切，做你力所能及的事。",
      english: "Do what you can, with what you have, where you are.",
      author: "西奥多·罗斯福 (Theodore Roosevelt)"
    },
    {
      text: "你永远不会老到不能再定一个目标，或拥有一个新的梦想。",
      english: "You are never too old to set another goal or to dream a new dream.",
      author: "C.S.刘易斯 (C.S. Lewis)"
    },
    {
      text: "要成就大事，我们不仅要行动，还要有梦想；不仅要有计划，还要有信念。",
      english: "To accomplish great things, we must not only act, but also dream; not only plan, but also believe.",
      author: "阿纳托尔·法朗士 (Anatole France)"
    },
    {
      text: "我可以接受失败，每个人都会在某些事上失败。但我不能接受不去尝试。",
      english: "I can accept failure, everyone fails at something. But I can't accept not trying.",
      author: "迈克尔·乔丹 (Michael Jordan)"
    },
    {
      text: "平凡与非凡之间的区别，就在于那一点点的额外努力。",
      english: "The difference between ordinary and extraordinary is that little extra.",
      author: "吉米·约翰逊 (Jimmy Johnson)"
    },
    {
      text: "你的时间有限，不要浪费时间活在别人的生活里。",
      english: "Your time is limited, don't waste it living someone else's life.",
      author: "史蒂夫·乔布斯 (Steve Jobs)"
    },
    {
      text: "唯一不可能的旅程，是你从未开始的那一个。",
      english: "The only impossible journey is the one you never begin.",
      author: "托尼·罗宾斯 (Tony Robbins)"
    },
    {
      text: "改变你的思想，你就改变了你的世界。",
      english: "Change your thoughts and you change your world.",
      author: "诺曼·文森特·皮尔 (Norman Vincent Peale)"
    },
    {
      text: "重要的不是你活了多少岁，而是你岁月中生活的品质。",
      english: "It's not the years in your life that count. It's the life in your years.",
      author: "亚伯拉罕·林肯 (Abraham Lincoln)"
    },
    {
      text: "知晓生命意义之所在，方能忍耐一切。",
      english: "He who has a why to live can bear almost any how.",
      author: "弗里德里希·尼采 (Friedrich Nietzsche)"
    },
    {
      text: "伟大的事情不是单凭冲动就能做成的，它是一系列小事汇集而成的结果。",
      english: "For the great doesn't happen through impulse alone, and is a succession of little things that are brought together.",
      author: "文森特·梵高 (Vincent van Gogh)"
    },
    {
      text: "要么你掌控今天，要么今天掌控你。",
      english: "Either you run the day, or the day runs you.",
      author: "吉姆·罗恩 (Jim Rohn)"
    },
    {
      text: "种一棵树最好的时间是二十年前，其次是现在。",
      english: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "中国谚语 (Chinese Proverb)"
    }
  ];

  // 洗牌算法 - Fisher-Yates shuffle
  const shuffleArray = (array: QuoteData[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 从所有名言中随机选择5句作为今日名言
  const selectDailyQuotes = () => {
    const shuffled = shuffleArray(allQuotes);
    return shuffled.slice(0, 5);
  };

  // 初始化时选择今日的5句名言
  useEffect(() => {
    const todayQuotes = selectDailyQuotes();
    setDailyQuotes(todayQuotes);
  }, []);

  // 20秒自动切换
  useEffect(() => {
    if (dailyQuotes.length === 0) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 20000);

    return () => clearInterval(interval);
  }, [dailyQuotes]);

  const handleNext = () => {
    if (isAnimating || dailyQuotes.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % dailyQuotes.length);
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevious = () => {
    if (isAnimating || dailyQuotes.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev === 0 ? dailyQuotes.length - 1 : prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  // 如果还没有选择完成今日名言，显示加载状态
  if (dailyQuotes.length === 0) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Quote className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuote = dailyQuotes[currentIndex];

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Quote className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className={`transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
              <div className="text-gray-800 text-lg leading-relaxed mb-2 font-medium">
                {currentQuote.text}
              </div>
              <div className="text-gray-600 text-base leading-relaxed mb-3 italic">
                {currentQuote.english}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-blue-600 font-medium">
                  — {currentQuote.author}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                    disabled={isAnimating}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-500">
                    {currentIndex + 1}/{dailyQuotes.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                    disabled={isAnimating}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
