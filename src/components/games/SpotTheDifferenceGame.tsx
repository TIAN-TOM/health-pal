
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, CheckCircle, XCircle, Trophy, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpotTheDifferenceGameProps {
  onBack: () => void;
  soundEnabled: boolean;
}

interface Difference {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
}

interface GameLevel {
  id: number;
  name: string;
  image1: string;
  image2: string;
  differences: Difference[];
  timeLimit: number;
  description: string;
}

const SpotTheDifferenceGame = ({ onBack, soundEnabled }: SpotTheDifferenceGameProps) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [foundDifferences, setFoundDifferences] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'menu'>('menu');
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState<number | null>(null);
  const { toast } = useToast();

  // 使用更加精美的真实风景和场景图片
  const levels: GameLevel[] = [
    {
      id: 1,
      name: '城市街景',
      description: '繁忙的都市街道，藏着细微的差别',
      image1: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFNreSBncmFkaWVudCAtLT4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic2t5IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4N0NFRkE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZERkZGRjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzUwIiBmaWxsPSJ1cmwoI3NreSkiLz4KICA8IS0tIFJvYWQgLS0+CiAgPHJlY3QgeT0iMjgwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNEE0QTRBIi8+CiAgPCEtLSBSb2FkIGxpbmVzIC0tPgogIDxyZWN0IHg9IjAiIHk9IjMxMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjEyMCIgeT0iMzEwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMjQwIiB5PSIzMTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNCIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIzNjAiIHk9IjMxMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgogIDwhLS0gQnVpbGRpbmdzIC0tPgogIDxyZWN0IHg9IjIwIiB5PSIxMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxODAiIGZpbGw9IiM2Qjc5ODAiLz4KICA8cmVjdCB4PSIxMjAiIHk9IjgwIiB3aWR0aD0iNzAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNTA2Mzc1Ii8+CiAgPHJlY3QgeD0iMjEwIiB5PSIxMjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiM3NjhEOTYiLz4KICA8cmVjdCB4PSIzMjAiIHk9IjkwIiB3aWR0aD0iODAiIGhlaWdodD0iMTkwIiBmaWxsPSIjNTQ3Mzg1Ii8+CiAgPHJlY3QgeD0iNDIwIiB5PSIxMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxNzAiIGZpbGw9IiM2MTc3ODgiLz4KICA8IS0tIFdpbmRvd3MgLS0+CiAgPHJlY3QgeD0iMzAiIHk9IjEzMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iNTUiIHk9IjEzMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iMzAiIHk9IjE2MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iNTUiIHk9IjE2MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iMTMwIiB5PSIxMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjE1NSIgeT0iMTEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiNGRkRCMDAiLz4KICA8cmVjdCB4PSIxMzAiIHk9IjE0MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iMTU1IiB5PSIxNDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjIyMCIgeT0iMTUwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiNGRkRCMDAiLz4KICA8cmVjdCB4PSIyNDUiIHk9IjE1MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iMjcwIiB5PSIxNTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjMzMCIgeT0iMTIwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiNGRkRCMDAiLz4KICA8cmVjdCB4PSIzNTUiIHk9IjEyMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iNDMwIiB5PSIxNDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg0ND0iNDU1IiB5PSIxNDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDwhLS0gQ2FyIC0tPgogIDxyZWN0IHg9IjE4MCIgeT0iMjkwIiB3aWR0aD0iODAiIGhlaWdodD0iMjUiIGZpbGw9IiNEQzI2MjYiLz4KICA8Y2lyY2xlIGN4PSIxOTUiIGN5PSIzMjAiIHI9IjEwIiBmaWxsPSIjMUExQTFBIi8+CiAgPGNpcmNsZSBjeD0iMjQ1IiBjeT0iMzIwIiByPSIxMCIgZmlsbD0iIzFBMUExQSIvPgogIDwhLS0gVHJhZmZpYyBsaWdodCAtLT4KICA8cmVjdCB4PSI0NzAiIHk9IjIwMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjQwIiBmaWxsPSIjM0EzQTNBIi8+CiAgPGNpcmNsZSBjeD0iNDc3LjUiIGN5PSIyMTAiIHI9IjUiIGZpbGw9IiNEQzI2MjYiLz4KICA8Y2lyY2xlIGN4PSI0NzcuNSIgY3k9IjIyMCIgcj0iNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxjaXJjbGUgY3g9IjQ3Ny41IiBjeT0iMjMwIiByPSI1IiBmaWxsPSIjMjJDNTVFIi8+CiAgPCEtLSBUcmVlIC0tPgogIDxjaXJjbGUgY3g9IjcwIiBjeT0iMjcwIiByPSIyNSIgZmlsbD0iIzIyQzU1RSIvPgogIDxyZWN0IHg9IjY1IiB5PSIyOTUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzg5MjUwNCIvPgo8L3N2Zz4=',
      image2: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFNreSBncmFkaWVudCAtLT4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic2t5IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4N0NFRkE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZERkZGRjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzUwIiBmaWxsPSJ1cmwoI3NreSkiLz4KICA8IS0tIFJvYWQgLS0+CiAgPHJlY3QgeT0iMjgwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNEE0QTRBIi8+CiAgPCEtLSBSb2FkIGxpbmVzIC0tPgogIDxyZWN0IHg9IjAiIHk9IjMxMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjEyMCIgeT0iMzEwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMjQwIiB5PSIzMTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNCIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIzNjAiIHk9IjMxMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgogIDwhLS0gQnVpbGRpbmdzIC0tPgogIDxyZWN0IHg9IjIwIiB5PSIxMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxODAiIGZpbGw9IiM2Qjc5ODAiLz4KICA8cmVjdCB4PSIxMjAiIHk9IjgwIiB3aWR0aD0iNzAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNTA2Mzc1Ii8+CiAgPHJlY3QgeD0iMjEwIiB5PSIxMjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiM3NjhEOTYiLz4KICA8cmVjdCB4PSIzMjAiIHk9IjkwIiB3aWR0aD0iODAiIGhlaWdodD0iMTkwIiBmaWxsPSIjNTQ3Mzg1Ii8+CiAgPHJlY3QgeD0iNDIwIiB5PSIxMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxNzAiIGZpbGw9IiM2MTc3ODgiLz4KICA8IS0tIFdpbmRvd3MgKGZld2VyIHdpbmRvd3MpIC0tPgogIDxyZWN0IHg9IjMwIiB5PSIxMzAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjU1IiB5PSIxMzAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjMwIiB5PSIxNjAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjU1IiB5PSIxNjAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjEzMCIgeT0iMTEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiNGRkRCMDAiLz4KICA8IS0tIE1pc3Npbmcgb25lIHdpbmRvdyAtLT4KICA8cmVjdCB4PSIxMzAiIHk9IjE0MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPCEtLSBNaXNzaW5nIG9uZSB3aW5kb3cgLS0+CiAgPHJlY3QgeD0iMjIwIiB5PSIxNTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjI0NSIgeT0iMTUwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiNGRkRCMDAiLz4KICA8cmVjdCB4PSIzMzAiIHk9IjEyMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPHJlY3QgeD0iMzU1IiB5PSIxMjAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGREIwMCIvPgogIDxyZWN0IHg9IjQzMCIgeT0iMTQwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiNGRkRCMDAiLz4KICA8cmVjdCB4PSI0NTUiIHk9IjE0MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEQjAwIi8+CiAgPCEtLSBDYXIgKGRpZmZlcmVudCBjb2xvcikgLS0+CiAgPHJlY3QgeD0iMTgwIiB5PSIyOTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIyNSIgZmlsbD0iIzJENzJENCIvPgogIDxjaXJjbGUgY3g9IjE5NSIgY3k9IjMyMCIgcj0iMTAiIGZpbGw9IiMxQTFBMUEiLz4KICA8Y2lyY2xlIGN4PSIyNDUiIGN5PSIzMjAiIHI9IjEwIiBmaWxsPSIjMUExQTFBIi8+CiAgPCEtLSBUcmFmZmljIGxpZ2h0IChkaWZmZXJlbnQgc3RhdGUpIC0tPgogIDxyZWN0IHg9IjQ3MCIgeT0iMjAwIiB3aWR0aD0iMTUiIGhlaWdodD0iNDAiIGZpbGw9IiMzQTNBM0EiLz4KICA8Y2lyY2xlIGN4PSI0NzcuNSIgY3k9IjIxMCIgcj0iNSIgZmlsbD0iIzM3NDE0OSIvPgogIDxjaXJjbGUgY3g9IjQ3Ny41IiBjeT0iMjIwIiByPSI1IiBmaWxsPSIjMzc0MTQ5Ii8+CiAgPGNpcmNsZSBjeD0iNDc3LjUiIGN5PSIyMzAiIHI9IjUiIGZpbGw9IiMyMkM1NUUiLz4KICA8IS0tIFRyZWUgLS0+CiAgPGNpcmNsZSBjeD0iNzAiIGN5PSIyNzAiIHI9IjI1IiBmaWxsPSIjMjJDNTVFIi8+CiAgPHJlY3QgeD0iNjUiIHk9IjI5NSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjODkyNTA0Ii8+CiAgPCEtLSBOZXcgYmlyZCAtLT4KICA8Y2lyY2xlIGN4PSI0MDAiIGN5PSI4MCIgcj0iNiIgZmlsbD0iIzFFMjMzQSIvPgo8L3N2Zz4=',
      differences: [
        { id: 1, x: 150, y: 105, width: 20, height: 20, found: false }, // 缺少一个窗户
        { id: 2, x: 265, y: 145, width: 20, height: 20, found: false }, // 缺少一个窗户
        { id: 3, x: 175, y: 285, width: 85, height: 30, found: false }, // 汽车颜色不同
        { id: 4, x: 470, y: 205, width: 20, height: 30, found: false }, // 红绿灯状态不同
        { id: 5, x: 395, y: 75, width: 15, height: 15, found: false }, // 新增小鸟
      ],
      timeLimit: 180
    },
    {
      id: 2,
      name: '花园咖啡厅',
      description: '温馨的咖啡厅花园，注意观察细节',
      image1: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZEQjQ0O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgZmlsbD0idXJsKCNza3kpIi8+CiAgPCEtLSBHcm91bmQgLS0+CiAgPHJlY3QgeT0iMjgwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNkJBNjUzIi8+CiAgPCEtLSBDYWZlIGJ1aWxkaW5nIC0tPgogIDxyZWN0IHg9IjUwIiB5PSIxNDAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTQwIiBmaWxsPSIjRDJCNDhDIi8+CiAgPCEtLSBSb29mIC0tPgogIDxwb2x5Z29uIHBvaW50cz0iNDAsMTQwIDIyMCwxNDAgMTMwLDEwMCIgZmlsbD0iI0I4NDYwNCIvPgogIDwhLS0gV2luZG93cyAtLT4KICA8cmVjdCB4PSI3MCIgeT0iMTcwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiNBREQ4RTYiLz4KICA8cmVjdCB4PSIxNDAiIHk9IjE3MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQUREOEU2Ii8+CiAgPCEtLSBEb29yIC0tPgogIDxyZWN0IHg9IjExMCIgeT0iMjIwIiB3aWR0aD0iMjUiIGhlaWdodD0iNjAiIGZpbGw9IiM4QjQ1MTMiLz4KICA8IS0tIFNpZ24gLS0+CiAgPHJlY3QgeD0iMjQwIiB5PSIxNjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzMzNzNEQyIvPgogIDx0ZXh0IHg9IjI4MCIgeT0iMTg1IiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q0FGRTwvdGV4dD4KICA8IS0tIFRhYmxlcyBhbmQgY2hhaXJzIC0tPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjMwMCIgcj0iMjAiIGZpbGw9IiM5QTU0MjgiLz4KICA8cmVjdCB4PSI4NSIgeT0iMjkwIiB3aWR0aD0iMzAiIGhlaWdodD0iNSIgZmlsbD0iIzlBNTQyOCIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjMwMCIgcj0iMjAiIGZpbGw9IiM5QTU0MjgiLz4KICA8cmVjdCB4PSIxODUiIHk9IjI5MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjUiIGZpbGw9IiM5QTU0MjgiLz4KICA8IS0tIENoYWlycyAtLT4KICA8cmVjdCB4PSI4NSIgeT0iMzE1IiB3aWR0aD0iOCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzlBNTQyOCIvPgogIDxyZWN0IHg9IjEwNyIgeT0iMzE1IiB3aWR0aD0iOCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzlBNTQyOCIvPgogIDxyZWN0IHg9IjE4NSIgeT0iMzE1IiB3aWR0aD0iOCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzlBNTQyOCIvPgogIDxyZWN0IHg9IjIwNyIgeT0iMzE1IiB3aWR0aD0iOCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzlBNTQyOCIvPgogIDwhLS0gRmxvd2VycyAtLT4KICA8Y2lyY2xlIGN4PSIzNTAiIGN5PSIzMDAiIHI9IjgiIGZpbGw9IiNGRjY5QjQiLz4KICA8Y2lyY2xlIGN4PSIzNzAiIGN5PSIyOTAiIHI9IjgiIGZpbGw9IiNGRkVCQ0IiLz4KICA8Y2lyY2xlIGN4PSIzOTAiIGN5PSIzMDAiIHI9IjgiIGZpbGw9IiNGRjY5QjQiLz4KICA8Y2lyY2xlIGN4PSI0MTAiIGN5PSIzMTAiIHI9IjgiIGZpbGw9IiNFRjQ0NDQiLz4KICA8IS0tIFRyZWUgLS0+CiAgPGNpcmNsZSBjeD0iNDUwIiBjeT0iMjQwIiByPSI0MCIgZmlsbD0iIzIyQzU1RSIvPgogIDxyZWN0IHg9IjQ0NSIgeT0iMjgwIiB3aWR0aD0iMTAiIGhlaWdodD0iMjAiIGZpbGw9IiM4OTI1MDQiLz4KICA8IS0tIFVtYnJlbGxhIC0tPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjI0MCIgcj0iMzAiIGZpbGw9IiNGRjU3MjIiLz4KICA8cmVjdCB4PSIyOTciIHk9IjI0MCIgd2lkdGg9IjYiIGhlaWdodD0iNDAiIGZpbGw9IiMzQTNBM0EiLz4KICA8IS0tIENsb3VkcyAtLT4KICA8Y2lyY2xlIGN4PSI4MCIgY3k9IjYwIiByPSIyMCIgZmlsbD0iI0ZGRiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjRkZGIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxMjAiIGN5PSI2MCIgcj0iMjAiIGZpbGw9IiNGRkYiIG9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4=',
      image2: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZEQjQ0O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgZmlsbD0idXJsKCNza3kpIi8+CiAgPCEtLSBHcm91bmQgLS0+CiAgPHJlY3QgeT0iMjgwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNkJBNjUzIi8+CiAgPCEtLSBDYWZlIGJ1aWxkaW5nIC0tPgogIDxyZWN0IHg9IjUwIiB5PSIxNDAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTQwIiBmaWxsPSIjRDJCNDhDIi8+CiAgPCEtLSBSb29mIC0tPgogIDxwb2x5Z29uIHBvaW50cz0iNDAsMTQwIDIyMCwxNDAgMTMwLDEwMCIgZmlsbD0iI0I4NDYwNCIvPgogIDwhLS0gV2luZG93cyAob25lIGRpZmZlcmVudCBjb2xvcikgLS0+CiAgPHJlY3QgeD0iNzAiIHk9IjE3MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjRkY2OUI0Ii8+CiAgPHJlY3QgeD0iMTQwIiB5PSIxNzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iI0FERDhFNiIvPgogIDwhLS0gRG9vciAtLT4KICA8cmVjdCB4PSIxMTAiIHk9IjIyMCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIi8+CiAgPCEtLSBTaWduIC0tPgogIDxyZWN0IHg9IjI0MCIgeT0iMTYwIiB3aWR0aD0iODAiIGhlaWdodD0iNDAiIGZpbGw9IiMzMzczREMiLz4KICA8dGV4dCB4PSIyODAiIHk9IjE4NSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNBRkU8L3RleHQ+CiAgPCEtLSBUYWJsZXMgYW5kIGNoYWlycyAob25lIHRhYmxlIG1pc3NpbmcpIC0tPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjMwMCIgcj0iMjAiIGZpbGw9IiM5QTU0MjgiLz4KICA8cmVjdCB4PSI4NSIgeT0iMjkwIiB3aWR0aD0iMzAiIGhlaWdodD0iNSIgZmlsbD0iIzlBNTQyOCIvPgogIDwhLS0gT25lIHRhYmxlIGlzIG1pc3NpbmcgLS0+CiAgPCEtLSBDaGFpcnMgKGZld2VyIGNoYWlycykgLS0+CiAgPHJlY3QgeD0iODUiIHk9IjMxNSIgd2lkdGg9IjgiIGhlaWdodD0iMTUiIGZpbGw9IiM5QTU0MjgiLz4KICA8cmVjdCB4PSIxMDciIHk9IjMxNSIgd2lkdGg9IjgiIGhlaWdodD0iMTUiIGZpbGw9IiM5QTU0MjgiLz4KICA8IS0tIEZsb3dlcnMgKGRpZmZlcmVudCBjb2xvciBmbG93ZXIpIC0tPgogIDxjaXJjbGUgY3g9IjM1MCIgY3k9IjMwMCIgcj0iOCIgZmlsbD0iI0ZGNjlCNCIvPgogIDxjaXJjbGUgY3g9IjM3MCIgY3k9IjI5MCIgcj0iOCIgZmlsbD0iIzk4NTVGRiIvPgogIDxjaXJjbGUgY3g9IjM5MCIgY3k9IjMwMCIgcj0iOCIgZmlsbD0iI0ZGNjlCNCIvPgogIDxjaXJjbGUgY3g9IjQxMCIgY3k9IjMxMCIgcj0iOCIgZmlsbD0iI0VGNDQ0NCIvPgogIDwhLS0gVHJlZSAtLT4KICA8Y2lyY2xlIGN4PSI0NTAiIGN5PSIyNDAiIHI9IjQwIiBmaWxsPSIjMjJDNTVFIi8+CiAgPHJlY3QgeD0iNDQ1IiB5PSIyODAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzg5MjUwNCIvPgogIDwhLS0gVW1icmVsbGEgLS0+CiAgPGNpcmNsZSBjeD0iMzAwIiBjeT0iMjQwIiByPSIzMCIgZmlsbD0iI0ZGNTcyMiIvPgogIDxyZWN0IHg9IjI5NyIgeT0iMjQwIiB3aWR0aD0iNiIgaGVpZ2h0PSI0MCIgZmlsbD0iIzNBM0EzQSIvPgogIDwhLS0gQ2xvdWRzICh3aXRoIGV4dHJhIGNsb3VkKSAtLT4KICA8Y2lyY2xlIGN4PSI4MCIgY3k9IjYwIiByPSIyMCIgZmlsbD0iI0ZGRiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjRkZGIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxMjAiIGN5PSI2MCIgcj0iMjAiIGZpbGw9IiNGRkYiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjQwIiByPSIxNSIgZmlsbD0iI0ZGRiIgb3BhY2l0eT0iMC44Ii8+CiAgPCEtLSBCaXJkIC0tPgogIDxjaXJjbGUgY3g9IjQwMCIgY3k9IjEwMCIgcj0iNSIgZmlsbD0iIzFBMUExQSIvPgo8L3N2Zz4=',
      differences: [
        { id: 1, x: 65, y: 165, width: 40, height: 40, found: false }, // 窗户颜色不同
        { id: 2, x: 185, y: 290, width: 40, height: 40, found: false }, // 缺少一张桌子
        { id: 3, x: 365, y: 285, width: 15, height: 15, found: false }, // 花的颜色不同
        { id: 4, x: 195, y: 35, width: 20, height: 20, found: false }, // 新增云朵
        { id: 5, x: 395, y: 95, width: 10, height: 10, found: false }, // 新增小鸟
      ],
      timeLimit: 200
    },
    {
      id: 3,
      name: '海滨度假村',
      description: '美丽的海滨风景，寻找隐藏的差异',
      image1: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFNreSBhbmQgU2VhIC0tPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJza3kiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM5Q0VGRDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQkJGN0Q0O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjc2t5KSIvPgogIDwhLS0gU2VhIC0tPgogIDxyZWN0IHk9IjIwMCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzM5Q0VGRCIvPgogIDwhLS0gQmVhY2ggLS0+CiAgPHJlY3QgeT0iMjgwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRjVGNUY1Ii8+CiAgPCEtLSBTdW4gLS0+CiAgPGNpcmNsZSBjeD0iNDUwIiBjeT0iNjAiIHI9IjMwIiBmaWxsPSIjRkZEQjAwIi8+CiAgPCEtLSBTdW4gcmF5cyAtLT4KICA8bGluZSB4MT0iNDUwIiB5MT0iMjAiIHgyPSI0NTAiIHkyPSI1IiBzdHJva2U9IiNGRkRCMDAiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxsaW5lIHgxPSI0ODUiIHkxPSI2MCIgeDI9IjUwMCIgeTI9IjYwIiBzdHJva2U9IiNGRkRCMDAiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxsaW5lIHgxPSI0NzUiIHkxPSIzMCIgeDI9IjQ4NSIgeTI9IjIwIiBzdHJva2U9IiNGRkRCMDAiIHN0cm9rZS13aWR0aD0iMyIvPgogIDwhLS0gUGFsbSB0cmVlcyAtLT4KICA8cmVjdCB4PSI1MCIgeT0iMjAwIiB3aWR0aD0iMTAiIGhlaWdodD0iODAiIGZpbGw9IiM4OTI1MDQiLz4KICA8ZWxsaXBzZSBjeD0iNTUiIGN5PSIxODAiIHJ4PSIyNSIgcnk9IjEwIiBmaWxsPSIjMjJDNTVFIi8+CiAgPGVsbGlwc2UgY3g9IjQ1IiBjeT0iMTcwIiByeD0iMjAiIHJ5PSI4IiBmaWxsPSIjMjJDNTVFIi8+CiAgPGVsbGlwc2UgY3g9IjY1IiBjeT0iMTcwIiByeD0iMjAiIHJ5PSI4IiBmaWxsPSIjMjJDNTVFIi8+CiAgPHJlY3QgeD0iNDAwIiB5PSIxODAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM4OTI1MDQiLz4KICA8ZWxsaXBzZSBjeD0iNDA1IiBjeT0iMTYwIiByeD0iMjUiIHJ5PSIxMCIgZmlsbD0iIzIyQzU1RSIvPgogIDxlbGxpcHNlIGN4PSIzOTUiIGN5PSIxNTAiIHJ4PSIyMCIgcnk9IjgiIGZpbGw9IiMyMkM1NUUiLz4KICA8ZWxsaXBzZSBjeD0iNDE1IiBjeT0iMTUwIiByeD0iMjAiIHJ5PSI4IiBmaWxsPSIjMjJDNTVFIi8+CiAgPCEtLSBIb3VzZSAtLT4KICA8cmVjdCB4PSIxNTAiIHk9IjE4MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGQkRCNDQiLz4KICA8IS0tIFJvb2YgLS0+CiAgPHBvbHlnb24gcG9pbnRzPSIxNDAsMTgwIDI2MCwxODAgMjAwLDE0MCIgZmlsbD0iI0VGNDQ0NCIvPgogIDwhLS0gRG9vciAtLT4KICA8cmVjdCB4PSIxODAiIHk9IjIzMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIi8+CiAgPCEtLSBXaW5kb3dzIC0tPgogIDxyZWN0IHg9IjE2MCIgeT0iMjAwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiNBREQ4RTYiLz4KICA8cmVjdCB4PSIyMTUiIHk9IjIwMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjQUREOEU2Ii8+CiAgPCEtLSBDb2NvbnV0cyAtLT4KICA8Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjYiIGZpbGw9IiM4OTI1MDQiLz4KICA8Y2lyY2xlIGN4PSIzMTUiIGN5PSIyOTUiIHI9IjYiIGZpbGw9IiM4OTI1MDQiLz4KICA8Y2lyY2xlIGN4PSIzMzAiIGN5PSIzMDAiIHI9IjYiIGZpbGw9IiM4OTI1MDQiLz4KICA8IS0tIFNlYWd1bGwgLS0+CiAgPGNpcmNsZSBjeD0iMTIwIiBjeT0iMTAwIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgogIDxlbGxpcHNlIGN4PSIxMTQiIGN5PSIxMDAiIHJ4PSIxMCIgcnk9IjMiIGZpbGw9IndoaXRlIi8+CiAgPGVsbGlwc2UgY3g9IjEyNiIgY3k9IjEwMCIgcng9IjEwIiByeT0iMyIgZmlsbD0id2hpdGUiLz4KICA8IS0tIFNhaWxib2F0IC0tPgogIDxyZWN0IHg9IjMyMCIgeT0iMjMwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTAiIGZpbGw9IiM4OTI1MDQiLz4KICA8bGluZSB4MT0iMzM1IiB5MT0iMjMwIiB4Mj0iMzM1IiB5Mj0iMjAwIiBzdHJva2U9IiNBM0EzQTMiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzM1LDIwMCAzNTAsMjE1IDMzNSwyMzAiIGZpbGw9IndoaXRlIi8+CiAgPCEtLSBDbG91ZHMgLS0+CiAgPGNpcmNsZSBjeD0iMTUwIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMTcwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMTkwIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAwIiBjeT0iNzAiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzE1IiBjeT0iNjUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPg==',
      image2: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFNreSBhbmQgU2VhIC0tPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJza3kiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM5Q0VGRDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQkJGN0Q0O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjc2t5KSIvPgogIDwhLS0gU2VhIC0tPgogIDxyZWN0IHk9IjIwMCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzM5Q0VGRCIvPgogIDwhLS0gQmVhY2ggLS0+CiAgPHJlY3QgeT0iMjgwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRjVGNUY1Ii8+CiAgPCEtLSBTdW4gKHNtYWxsZXIpIC0tPgogIDxjaXJjbGUgY3g9IjQ1MCIgY3k9IjYwIiByPSIyNSIgZmlsbD0iI0ZGREIwMCIvPgogIDwhLS0gU3VuIHJheXMgLS0+CiAgPGxpbmUgeDE9IjQ1MCIgeTE9IjI1IiB4Mj0iNDUwIiB5Mj0iMTAiIHN0cm9rZT0iI0ZGREIwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGxpbmUgeDE9IjQ4MCIgeTE9IjYwIiB4Mj0iNDk1IiB5Mj0iNjAiIHN0cm9rZT0iI0ZGREIwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGxpbmUgeDE9IjQ3MCIgeTE9IjM1IiB4Mj0iNDgwIiB5Mj0iMjUiIHN0cm9rZT0iI0ZGREIwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPCEtLSBQYWxtIHRyZWVzIC0tPgogIDxyZWN0IHg9IjUwIiB5PSIyMDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzg5MjUwNCIvPgogIDxlbGxpcHNlIGN4PSI1NSIgY3k9IjE4MCIgcng9IjI1IiByeT0iMTAiIGZpbGw9IiMyMkM1NUUiLz4KICA8ZWxsaXBzZSBjeD0iNDUiIGN5PSIxNzAiIHJ4PSIyMCIgcnk9IjgiIGZpbGw9IiMyMkM1NUUiLz4KICA8ZWxsaXBzZSBjeD0iNjUiIGN5PSIxNzAiIHJ4PSIyMCIgcnk9IjgiIGZpbGw9IiMyMkM1NUUiLz4KICA8cmVjdCB4PSI0MDAiIHk9IjE4MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzg5MjUwNCIvPgogIDxlbGxpcHNlIGN4PSI0MDUiIGN5PSIxNjAiIHJ4PSIyNSIgcnk9IjEwIiBmaWxsPSIjMjJDNTVFIi8+CiAgPGVsbGlwc2UgY3g9IjM5NSIgY3k9IjE1MCIgcng9IjIwIiByeT0iOCIgZmlsbD0iIzIyQzU1RSIvPgogIDxlbGxpcHNlIGN4PSI0MTUiIGN5PSIxNTAiIHJ4PSIyMCIgcnk9IjgiIGZpbGw9IiMyMkM1NUUiLz4KICA8IS0tIEhvdXNlIC0tPgogIDxyZWN0IHg9IjE1MCIgeT0iMTgwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZCREI0NCIvPgogIDwhLS0gUm9vZiAtLT4KICA8cG9seWdvbiBwb2ludHM9IjE0MCwxODAgMjYwLDE4MCAyMDAsMTQwIiBmaWxsPSIjRUY0NDQ0Ii8+CiAgPCEtLSBEb29yIC0tPgogIDxyZWN0IHg9IjE4MCIgeT0iMjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iNTAiIGZpbGw9IiM4QjQ1MTMiLz4KICA8IS0tIFdpbmRvd3MgKG9uZSBtaXNzaW5nKSAtLT4KICA8cmVjdCB4PSIxNjAiIHk9IjIwMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjQUREOEU2Ii8+CiAgPCEtLSBTZWNvbmQgd2luZG93IGlzIG1pc3NpbmcgLS0+CiAgPCEtLSBDb2NvbnV0cyAob25lIG1pc3NpbmcpIC0tPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjMwMCIgcj0iNiIgZmlsbD0iIzg5MjUwNCIvPgogIDxjaXJjbGUgY3g9IjMxNSIgY3k9IjI5NSIgcj0iNiIgZmlsbD0iIzg5MjUwNCIvPgogIDwhLS0gVGhpcmQgY29jb251dCBpcyBtaXNzaW5nIC0tPgogIDwhLS0gU2VhZ3VsbCAtLT4KICA8Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMDAiIHI9IjQiIGZpbGw9IndoaXRlIi8+CiAgPGVsbGlwc2UgY3g9IjExNCIgY3k9IjEwMCIgcng9IjEwIiByeT0iMyIgZmlsbD0id2hpdGUiLz4KICA8ZWxsaXBzZSBjeD0iMTI2IiBjeT0iMTAwIiByeD0iMTAiIHJ5PSIzIiBmaWxsPSJ3aGl0ZSIvPgogIDwhLS0gU2FpbGJvYXQgKGRpZmZlcmVudCBzYWlsIGNvbG9yKSAtLT4KICA8cmVjdCB4PSIzMjAiIHk9IjIzMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjODkyNTA0Ii8+CiAgPGxpbmUgeDE9IjMzNSIgeTE9IjIzMCIgeDI9IjMzNSIgeTI9IjIwMCIgc3Ryb2tlPSIjQTNBM0EzIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cG9seWdvbiBwb2ludHM9IjMzNSwyMDAgMzUwLDIxNSAzMzUsMjMwIiBmaWxsPSIjRkZEQjAwIi8+CiAgPCEtLSBDbG91ZHMgKHdpdGggZXh0cmEgY2xvdWQpIC0tPgogIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjE5MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjcwIiByPSIxMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjMxNSIgY3k9IjY1IiByPSIxNSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjI1MCIgY3k9IjMwIiByPSIxMCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4=',
      differences: [
        { id: 1, x: 440, y: 50, width: 20, height: 20, found: false }, // 太阳大小不同
        { id: 2, x: 210, y: 195, width: 20, height: 20, found: false }, // 缺少一个窗户
        { id: 3, x: 325, y: 295, width: 15, height: 15, found: false }, // 缺少一个椰子
        { id: 4, x: 330, y: 200, width: 20, height: 35, found: false }, // 帆船帆的颜色不同
        { id: 5, x: 245, y: 25, width: 15, height: 15, found: false }, // 新增云朵
      ],
      timeLimit: 220
    }
  ];

  // 游戏计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('lost');
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const startGame = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    setTimeLeft(levels[levelIndex].timeLimit);
    setFoundDifferences([]);
    setGameState('playing');
    setScore(0);
    setHints(3);
    setShowHint(null);
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>, imageIndex: number) => {
    if (gameState !== 'playing') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const level = levels[currentLevel];
    const clickedDifference = level.differences.find(diff => 
      !foundDifferences.includes(diff.id) &&
      x >= diff.x && x <= diff.x + diff.width &&
      y >= diff.y && y <= diff.y + diff.height
    );

    if (clickedDifference) {
      const newFound = [...foundDifferences, clickedDifference.id];
      setFoundDifferences(newFound);
      setScore(score + 100 + timeLeft);
      
      if (soundEnabled) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLRJHkBQo7Xd8O3wVbO6/pKrjC6Fm8a5/zk8Wd/x8/Eaff3VNJkNJIXM8tXNNw/V8cXxNLX2');
        audio.play().catch(() => {});
      }

      toast({
        title: "找到了！",
        description: `获得 ${100 + timeLeft} 分`,
      });

      if (newFound.length === level.differences.length) {
        setGameState('won');
        toast({
          title: "恭喜通关！",
          description: `总分：${score + 100 + timeLeft} 分`,
        });
      }
    } else {
      setScore(Math.max(0, score - 20));
      if (soundEnabled) {
        const audio = new Audio('data:audio/wav;base64,UklGRvQEAABXQVZFZm1kIBAAAAAAEAACAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAGAAZAAAAD0AAABGAAAABAABAG');
        audio.play().catch(() => {});
      }
    }
  };

  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;
    
    const level = levels[currentLevel];
    const unfoundDifference = level.differences.find(diff => !foundDifferences.includes(diff.id));
    
    if (unfoundDifference) {
      setShowHint(unfoundDifference.id);
      setHints(hints - 1);
      setTimeout(() => setShowHint(null), 3000);
    }
  };

  const restartGame = () => {
    startGame(currentLevel);
  };

  const backToMenu = () => {
    setGameState('menu');
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回游戏列表
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold flex items-center justify-center">
              <Eye className="h-6 w-6 mr-2 text-purple-600" />
              找不同
            </CardTitle>
            <p className="text-center text-gray-600">仔细观察两张图片，找出它们之间的不同之处</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {levels.map((level, index) => (
                <Card key={level.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <img 
                        src={level.image1} 
                        alt={`${level.name} 预览`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{level.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {level.timeLimit}秒
                      </Badge>
                      <Badge variant="outline">
                        {level.differences.length} 处不同
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => startGame(index)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      开始挑战
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">游戏说明</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 仔细比较两张图片，找出所有不同之处</li>
                <li>• 点击你认为不同的地方</li>
                <li>• 找对加分，点错扣分</li>
                <li>• 可以使用提示，但次数有限</li>
                <li>• 在时间用完前找到所有不同即可获胜</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const level = levels[currentLevel];
  const progress = (foundDifferences.length / level.differences.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={backToMenu}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回关卡选择
        </Button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-red-600" />
            <span className="font-mono text-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center">
            <Trophy className="h-4 w-4 mr-1 text-yellow-600" />
            <span className="font-bold">{score}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={useHint}
            disabled={hints <= 0}
          >
            <Zap className="h-4 w-4 mr-1" />
            提示 ({hints})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{level.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{level.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                已找到 {foundDifferences.length}/{level.differences.length}
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* 左图 */}
            <div className="relative">
              <h3 className="text-center mb-2 font-medium">图片 A</h3>
              <div 
                className="relative cursor-crosshair border-2 border-gray-300 rounded-lg overflow-hidden"
                onClick={(e) => handleImageClick(e, 0)}
              >
                <img 
                  src={level.image1} 
                  alt="图片 A"
                  className="w-full h-auto"
                  draggable={false}
                />
                
                {/* 显示已找到的不同点 */}
                {level.differences.map(diff => (
                  foundDifferences.includes(diff.id) && (
                    <div
                      key={`found-${diff.id}`}
                      className="absolute border-2 border-green-500 bg-green-200 bg-opacity-50 rounded-full animate-pulse"
                      style={{
                        left: diff.x,
                        top: diff.y,
                        width: diff.width,
                        height: diff.height
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  )
                ))}

                {/* 显示提示 */}
                {showHint && level.differences.find(d => d.id === showHint) && (
                  <div
                    className="absolute border-2 border-yellow-500 bg-yellow-200 bg-opacity-50 rounded-full animate-bounce"
                    style={{
                      left: level.differences.find(d => d.id === showHint)?.x,
                      top: level.differences.find(d => d.id === showHint)?.y,
                      width: level.differences.find(d => d.id === showHint)?.width,
                      height: level.differences.find(d => d.id === showHint)?.height
                    }}
                  />
                )}
              </div>
            </div>

            {/* 右图 */}
            <div className="relative">
              <h3 className="text-center mb-2 font-medium">图片 B</h3>
              <div 
                className="relative cursor-crosshair border-2 border-gray-300 rounded-lg overflow-hidden"
                onClick={(e) => handleImageClick(e, 1)}
              >
                <img 
                  src={level.image2} 
                  alt="图片 B"
                  className="w-full h-auto"
                  draggable={false}
                />
                
                {/* 显示已找到的不同点 */}
                {level.differences.map(diff => (
                  foundDifferences.includes(diff.id) && (
                    <div
                      key={`found-${diff.id}`}
                      className="absolute border-2 border-green-500 bg-green-200 bg-opacity-50 rounded-full animate-pulse"
                      style={{
                        left: diff.x,
                        top: diff.y,
                        width: diff.width,
                        height: diff.height
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  )
                ))}

                {/* 显示提示 */}
                {showHint && level.differences.find(d => d.id === showHint) && (
                  <div
                    className="absolute border-2 border-yellow-500 bg-yellow-200 bg-opacity-50 rounded-full animate-bounce"
                    style={{
                      left: level.differences.find(d => d.id === showHint)?.x,
                      top: level.differences.find(d => d.id === showHint)?.y,
                      width: level.differences.find(d => d.id === showHint)?.width,
                      height: level.differences.find(d => d.id === showHint)?.height
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 游戏结束状态 */}
          {gameState === 'won' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-green-800 mb-2">恭喜通关！</h3>
              <p className="text-green-700">最终得分: {score} 分</p>
              <div className="mt-3 space-x-2">
                <Button onClick={restartGame} variant="outline">
                  重新挑战
                </Button>
                <Button onClick={backToMenu}>
                  选择关卡
                </Button>
              </div>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-red-800 mb-2">时间到！</h3>
              <p className="text-red-700">已找到 {foundDifferences.length}/{level.differences.length} 个不同</p>
              <div className="mt-3 space-x-2">
                <Button onClick={restartGame} variant="outline">
                  重新挑战
                </Button>
                <Button onClick={backToMenu}>
                  选择关卡
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotTheDifferenceGame;
