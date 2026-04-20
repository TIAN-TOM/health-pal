import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Games from '../Games';
import { GAMES } from '@/components/games/registry';
import GameStrategyTooltip from '@/components/games/GameStrategyTooltip';

vi.mock('@/services/adminNotificationService', () => ({
  notifyAdminActivity: vi.fn().mockResolvedValue(undefined),
  ACTIVITY_TYPES: { GAME: 'game' },
  MODULE_NAMES: { GAMES: 'games' },
}));

describe('GAMES registry', () => {
  it('contains exactly 10 games', () => {
    expect(GAMES.length).toBe(10);
  });

  it('every game has required metadata and strategy', () => {
    for (const g of GAMES) {
      expect(g.id).toBeTruthy();
      expect(g.name).toBeTruthy();
      expect(g.description).toBeTruthy();
      expect(g.icon).toBeTruthy();
      expect(g.component).toBeTruthy();
      expect(g.strategy.heading).toBeTruthy();
      expect(Array.isArray(g.strategy.bullets)).toBe(true);
      expect(g.strategy.bullets.length).toBeGreaterThan(0);
      expect(g.strategy.highlight).toBeTruthy();
    }
  });

  it('game ids are unique', () => {
    const ids = GAMES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('preserves expected ids from before refactor', () => {
    const ids = GAMES.map((g) => g.id).sort();
    expect(ids).toEqual(
      [
        '2048',
        'bomber-pop',
        'breakout',
        'bubble-pop',
        'flappy-bird',
        'gomoku',
        'memory-cards',
        'multiplayer-gomoku',
        'snake',
        'tetris',
      ].sort()
    );
  });
});

describe('GameStrategyTooltip', () => {
  it('renders heading, bullets and highlight', () => {
    const strategy = {
      heading: '🧠 测试标题',
      bullets: ['第一条', '第二条', '第三条'],
      highlight: '💡 总结',
    };
    render(<GameStrategyTooltip gameName="测试游戏" strategy={strategy} />);
    expect(screen.getByText('🎮 测试游戏 - 游戏攻略')).toBeInTheDocument();
    expect(screen.getByText('🧠 测试标题')).toBeInTheDocument();
    for (const b of strategy.bullets) {
      expect(screen.getByText(`• ${b}`)).toBeInTheDocument();
    }
    expect(screen.getByText('💡 总结')).toBeInTheDocument();
  });
});

describe('Games component', () => {
  it('renders header and all 10 game cards', () => {
    render(<Games onBack={() => {}} />);
    expect(screen.getByText('解压小游戏')).toBeInTheDocument();
    for (const g of GAMES) {
      expect(screen.getByText(g.name)).toBeInTheDocument();
      expect(screen.getByText(g.description)).toBeInTheDocument();
    }
  });

  it('renders one start-game button per game', () => {
    render(<Games onBack={() => {}} />);
    const startButtons = screen.getAllByRole('button', { name: /开始游戏/ });
    expect(startButtons.length).toBe(GAMES.length);
  });
});
