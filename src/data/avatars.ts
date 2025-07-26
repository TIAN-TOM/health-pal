
// 预设头像数据管理
export interface PresetAvatar {
  id: string;
  name: string;
  url: string;
  category: 'person' | 'animal' | 'zodiac';
}

// 人物头像
const personAvatars: PresetAvatar[] = [
  { id: 'person_1', name: '男性1', url: '👨', category: 'person' },
  { id: 'person_2', name: '女性1', url: '👩', category: 'person' },
  { id: 'person_3', name: '老人1', url: '👴', category: 'person' },
  { id: 'person_4', name: '老人2', url: '👵', category: 'person' },
  { id: 'person_5', name: '男孩', url: '👦', category: 'person' },
  { id: 'person_6', name: '女孩', url: '👧', category: 'person' },
  { id: 'person_7', name: '婴儿', url: '👶', category: 'person' },
  { id: 'person_8', name: '商务男性', url: '👨‍💼', category: 'person' },
  { id: 'person_9', name: '商务女性', url: '👩‍💼', category: 'person' },
  { id: 'person_10', name: '医生', url: '👨‍⚕️', category: 'person' },
];

// 动物头像
const animalAvatars: PresetAvatar[] = [
  { id: 'animal_1', name: '猫咪', url: '🐱', category: 'animal' },
  { id: 'animal_2', name: '小狗', url: '🐶', category: 'animal' },
  { id: 'animal_3', name: '熊猫', url: '🐼', category: 'animal' },
  { id: 'animal_4', name: '兔子', url: '🐰', category: 'animal' },
  { id: 'animal_5', name: '小鸡', url: '🐥', category: 'animal' },
  { id: 'animal_6', name: '企鹅', url: '🐧', category: 'animal' },
  { id: 'animal_7', name: '青蛙', url: '🐸', category: 'animal' },
  { id: 'animal_8', name: '猴子', url: '🐵', category: 'animal' },
];

// 十二生肖头像
const zodiacAvatars: PresetAvatar[] = [
  { id: 'zodiac_rat', name: '鼠', url: '🐭', category: 'zodiac' },
  { id: 'zodiac_ox', name: '牛', url: '🐂', category: 'zodiac' },
  { id: 'zodiac_tiger', name: '虎', url: '🐅', category: 'zodiac' },
  { id: 'zodiac_rabbit', name: '兔', url: '🐇', category: 'zodiac' },
  { id: 'zodiac_dragon', name: '龙', url: '🐉', category: 'zodiac' },
  { id: 'zodiac_snake', name: '蛇', url: '🐍', category: 'zodiac' },
  { id: 'zodiac_horse', name: '马', url: '🐎', category: 'zodiac' },
  { id: 'zodiac_goat', name: '羊', url: '🐑', category: 'zodiac' },
  { id: 'zodiac_monkey', name: '猴', url: '🐒', category: 'zodiac' },
  { id: 'zodiac_rooster', name: '鸡', url: '🐓', category: 'zodiac' },
  { id: 'zodiac_dog', name: '狗', url: '🐕', category: 'zodiac' },
  { id: 'zodiac_pig', name: '猪', url: '🐷', category: 'zodiac' },
];

// 合并所有预设头像
export const presetAvatars: PresetAvatar[] = [
  ...personAvatars,
  ...animalAvatars,
  ...zodiacAvatars,
];

// 获取头像URL（这里使用emoji作为头像）
export const getAvatarUrl = (avatar: PresetAvatar): string => {
  return avatar.url;
};

// 按类别获取头像
export const getAvatarsByCategory = (category: PresetAvatar['category']): PresetAvatar[] => {
  return presetAvatars.filter(avatar => avatar.category === category);
};

// 获取所有分类
export const getAvatarCategories = (): { key: PresetAvatar['category']; name: string }[] => {
  return [
    { key: 'person', name: '人物' },
    { key: 'animal', name: '动物' },
    { key: 'zodiac', name: '生肖' },
  ];
};

// 根据ID获取头像
export const getAvatarById = (id: string): PresetAvatar | undefined => {
  return presetAvatars.find(avatar => avatar.id === id);
};
