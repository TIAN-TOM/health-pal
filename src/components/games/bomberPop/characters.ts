import type { CharacterId } from './types';

export interface CharacterMeta {
  id: CharacterId;
  name: string;
  emoji: string;
  /** 像素皮肤主色（用于 PixelPlayer.variant） */
  primary: string;
  /** 像素皮肤副色（耳朵/腮红等） */
  accent: string;
  /** 被动技能描述 */
  passive: string;
  /** 初始能力加成 */
  bonus: {
    bombs?: number;
    range?: number;
    speed?: number;
    hp?: number;
  };
}

export const CHARACTERS: CharacterMeta[] = [
  {
    id: 'rabbit',
    name: '兔奇',
    emoji: '🐰',
    primary: '#ffffff',
    accent: '#fbcfe8',
    passive: '初始 +1 速度',
    bonus: { speed: 1 },
  },
  {
    id: 'cat',
    name: '猫蛋',
    emoji: '🐱',
    primary: '#fb923c',
    accent: '#1f2937',
    passive: '初始 +1 炸弹数',
    bonus: { bombs: 1 },
  },
  {
    id: 'bear',
    name: '熊大',
    emoji: '🐻',
    primary: '#a16207',
    accent: '#fde68a',
    passive: '初始 HP 2 (额外护体)',
    bonus: { hp: 1 },
  },
  {
    id: 'fox',
    name: '狐狸阿凯',
    emoji: '🦊',
    primary: '#dc2626',
    accent: '#fde68a',
    passive: '初始 +1 爆炸范围',
    bonus: { range: 1 },
  },
];

export const getCharacter = (id: CharacterId): CharacterMeta =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
