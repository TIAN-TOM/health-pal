import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';
import { MODES } from './modes';
import { CHARACTERS } from './characters';
import type { CharacterId, GameMode } from './types';

interface Props {
  bestScore: number;
  maxLevelReached: number;
  bestSurvivalSec: number;
  battleWins: number;
  defaultCharacter: CharacterId;
  onStart: (mode: GameMode, characterId: CharacterId) => void;
}

const StartScreen: React.FC<Props> = ({
  bestScore,
  maxLevelReached,
  bestSurvivalSec,
  battleWins,
  defaultCharacter,
  onStart,
}) => {
  const [step, setStep] = useState<'mode' | 'character'>('mode');
  const [mode, setMode] = useState<GameMode>('arcade');
  const [characterId, setCharacterId] = useState<CharacterId>(defaultCharacter);

  if (step === 'mode') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-2 text-5xl">
              <span>💣</span><span>🐰</span><span>👾</span>
            </div>
            <h2 className="text-2xl font-bold">Q版泡泡堂</h2>
            <p className="text-muted-foreground text-sm">
              选择你的游戏模式，开始一场炸弹冒险
            </p>
          </div>

          <div className="grid gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setStep('character'); }}
                className="w-full text-left p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl shrink-0">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.description}</div>
                  </div>
                  <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground text-center pt-2">
            <div>
              <div className="font-bold text-foreground">{bestScore}</div>
              <div>最高分</div>
            </div>
            <div>
              <div className="font-bold text-foreground">第 {maxLevelReached} 关</div>
              <div>街机进度</div>
            </div>
            <div>
              <div className="font-bold text-foreground">{battleWins}</div>
              <div>对战胜场</div>
            </div>
          </div>
          {bestSurvivalSec > 0 && (
            <div className="text-center text-xs text-muted-foreground">
              生存模式最佳：{Math.floor(bestSurvivalSec / 60)}:{String(bestSurvivalSec % 60).padStart(2, '0')}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setStep('mode')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> 重选模式
          </Button>
          <div className="text-sm text-muted-foreground">
            模式：{MODES.find((m) => m.id === mode)?.name}
          </div>
        </div>

        <h3 className="text-lg font-bold text-center">选择角色</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCharacterId(c.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                characterId === c.id
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-4xl text-center mb-1">{c.emoji}</div>
              <div className="font-bold text-sm text-center">{c.name}</div>
              <div className="text-[11px] text-muted-foreground text-center mt-1">{c.passive}</div>
            </button>
          ))}
        </div>

        <Button
          onClick={() => onStart(mode, characterId)}
          size="lg"
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" /> 开始游戏
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartScreen;
