import React from 'react';
import type { GameStrategy } from './types';

interface GameStrategyTooltipProps {
  gameName: string;
  strategy: GameStrategy;
}

/**
 * 卡片右上角的「?」按钮 + hover/active 弹出的攻略浮层。
 * 抽离自原 Games.tsx 中的重复 JSX，结构、样式、文案完全一致。
 */
const GameStrategyTooltip = ({ gameName, strategy }: GameStrategyTooltipProps) => {
  return (
    <div className="ml-auto relative group">
      <button className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-help hover:bg-blue-600 transition-colors">
        ?
      </button>
      <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-active:opacity-100 group-active:visible transition-all duration-200 z-10">
        <h4 className="font-semibold mb-3 text-gray-800">🎮 {gameName} - 游戏攻略</h4>
        <div className="space-y-3">
          <div>
            <p className="mb-2 font-medium text-gray-700">{strategy.heading}</p>
            <div className="text-xs text-gray-600 space-y-1">
              {strategy.bullets.map((bullet, idx) => (
                <p key={idx}>• {bullet}</p>
              ))}
              <p className="text-blue-600 font-medium">{strategy.highlight}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStrategyTooltip;
