import React from 'react';
import type { FloatingText as FloatingTextType } from './types';
import { FLOATING_TEXT_TTL_MS } from './types';

interface Props {
  texts: FloatingTextType[];
  cellSize: number;
  /** 网格容器内的 padding 像素，用来对齐定位 */
  offsetX?: number;
  offsetY?: number;
}

const FloatingTextLayer: React.FC<Props> = ({ texts, cellSize, offsetX = 0, offsetY = 0 }) => {
  const now = Date.now();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {texts.map((t) => {
        const age = now - t.bornAt;
        const progress = Math.min(1, age / FLOATING_TEXT_TTL_MS);
        const opacity = 1 - progress;
        const translateY = -progress * 24;
        return (
          <span
            key={t.id}
            className="absolute font-bold text-xs sm:text-sm select-none"
            style={{
              left: offsetX + (t.x + 0.5) * cellSize,
              top: offsetY + (t.y + 0.2) * cellSize,
              transform: `translate(-50%, ${translateY}px)`,
              color: t.color,
              opacity,
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              transition: 'transform 60ms linear, opacity 60ms linear',
            }}
          >
            {t.text}
          </span>
        );
      })}
    </div>
  );
};

export default FloatingTextLayer;
