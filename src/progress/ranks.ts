// src/progress/ranks.ts
// Pure rank definitions and rank progression for junior astronauts.
// Conforms to SPEC.md section 6:
// Space Cadet 0-499, Mission Specialist 500-1499, Expedition Pilot 1500-3499,
// Base Commander 3500-6999, NASA Flight Director 7000+. Cosmetic only.

export type RankId =
  | 'space-cadet'
  | 'mission-specialist'
  | 'expedition-pilot'
  | 'base-commander'
  | 'flight-director';

export interface RankInfo {
  id: RankId;
  title: string;
  minXp: number;
  maxXp: number | null;
  nextXp: number | null;
  level: number;
  badge: string;
}

export const RANKS: readonly RankInfo[] = [
  {
    id: 'space-cadet',
    title: 'Space Cadet',
    minXp: 0,
    maxXp: 499,
    nextXp: 500,
    level: 1,
    badge: '🌱',
  },
  {
    id: 'mission-specialist',
    title: 'Mission Specialist',
    minXp: 500,
    maxXp: 1499,
    nextXp: 1500,
    level: 2,
    badge: '🛰️',
  },
  {
    id: 'expedition-pilot',
    title: 'Expedition Pilot',
    minXp: 1500,
    maxXp: 3499,
    nextXp: 3500,
    level: 3,
    badge: '🚀',
  },
  {
    id: 'base-commander',
    title: 'Base Commander',
    minXp: 3500,
    maxXp: 6999,
    nextXp: 7000,
    level: 4,
    badge: '⭐',
  },
  {
    id: 'flight-director',
    title: 'NASA Flight Director',
    minXp: 7000,
    maxXp: null,
    nextXp: null,
    level: 5,
    badge: '👑',
  },
] as const;

export function rankForXp(xp: number): RankInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const rank = RANKS[i];
    if (rank && safeXp >= rank.minXp) {
      return rank;
    }
  }
  return RANKS[0]!;
}

export function getRankProgress(xp: number): {
  currentRank: RankInfo;
  nextRank: RankInfo | null;
  progressPercent: number;
  xpRemaining: number;
} {
  const currentRank = rankForXp(xp);
  if (currentRank.nextXp === null) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      xpRemaining: 0,
    };
  }

  const nextRank = RANKS[currentRank.level] ?? null;
  const safeXp = Math.max(0, Math.floor(xp));
  const span = currentRank.nextXp - currentRank.minXp;
  const currentInRank = safeXp - currentRank.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInRank / span) * 100)));
  const xpRemaining = Math.max(0, currentRank.nextXp - safeXp);

  return {
    currentRank,
    nextRank,
    progressPercent,
    xpRemaining,
  };
}
