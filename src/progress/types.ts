// src/progress/types.ts
// Progression and save schema types.
// Strictly follows SPEC.md section 6 and docs/fr/01-implementation.md section 7.2.

import type { Difficulty } from '../engine/types';

export type RankId =
  | 'space-cadet'
  | 'mission-specialist'
  | 'expedition-pilot'
  | 'base-commander'
  | 'flight-director';

export interface RankDef {
  id: RankId;
  title: string;
  minXp: number;
  maxXp: number;
}

export interface PlayerProfile {
  codename: string;
  avatarId: string;
}

export interface PlayerStreak {
  count: number;
  lastDay: string; // "YYYY-MM-DD" local date format
  jokerReady: boolean;
}

export interface PlayerStats {
  winStreak: number;
  pressureWinsClean: number;
  welcomeGiven: boolean;
}

export interface GameSettings {
  muted: boolean;
  extraTime: boolean;
  speed: 1 | 2 | 3;
}

export interface SaveV1 {
  v: 1;
  profile: PlayerProfile;
  xp: number;
  streak: PlayerStreak;
  badges: string[];
  best: Record<string, Partial<Record<Difficulty, 0 | 1 | 2 | 3>>>;
  stats: PlayerStats;
  seen: string[];
  settings: GameSettings;
}
