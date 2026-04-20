import type { ComponentType, LazyExoticComponent } from 'react';

export interface GameStrategy {
  /** 攻略标题，例如 "🧠 记忆力挑战游戏" */
  heading: string;
  /** 列表项（• 前缀的提示） */
  bullets: string[];
  /** 蓝色高亮的总结句 */
  highlight: string;
}

export interface GameComponentProps {
  onBack: () => void;
  soundEnabled?: boolean;
}

export interface GameMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: LazyExoticComponent<ComponentType<GameComponentProps>>;
  strategy: GameStrategy;
}

/**
 * 工厂函数：把懒加载的组件 + 元数据 + 攻略组装为一个 GameMeta。
 * 这里只负责返回结构，不负责渲染。
 */
export const buildGameMeta = (
  meta: Omit<GameMeta, 'strategy'> & { strategy: GameStrategy }
): GameMeta => meta;
