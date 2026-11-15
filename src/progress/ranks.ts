// src/progress/ranks.ts
// Rank definitions and calculation from total player XP.
// Follows SPEC.md section 6 and docs/fr/01-implementation.md section 7.2.

import type { RankId, RankDef } from './types';

export const RANKS: readonly RankDef[] = [
  {
    id: 'space-cadet',
    title: 'Space Cadet',
    minXp: 0,
    maxXp: 499,
  },
  {
    id: 'mission-specialist',
    title: 'Mission Specialist',
    minXp: 500,
    maxXp: 1499,
  },
  {
    id: 'expedition-pilot',
    title: 'Expedition Pilot',
    minXp: 1500,
    maxXp: 3499,
  },
  {
    id: 'base-commander',
    title: 'Base Commander',
    minXp: 3500,
    maxXp: 6999,
  },
  {
    id: 'flight-director',
    title: 'NASA Flight Director',
    minXp: 7000,
    maxXp: Infinity,
  },
] as const;

/**
 * Returns the player rank based on total XP.
 * Thresholds:
 * - 0 - 499: Space Cadet
 * - 500 - 1499: Mission Specialist
 * - 1500 - 3499: Expedition Pilot
 * - 3500 - 6999: Base Commander
 * - 7000+: NASA Flight Director
 */
export function getRankForXp(xp: number): RankDef {
  const safeXp = Math.max(0, xp);
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const rank = RANKS[i]!;
    if (safeXp >= rank.minXp) {
      return rank;
    }
  }
  return RANKS[0]!;
}

/**
 * Returns the next rank to reach, or null if highest rank achieved.
 */
export function getNextRank(rankId: RankId): RankDef | null {
  const index = RANKS.findIndex((r) => r.id === rankId);
  if (index >= 0 && index < RANKS.length - 1) {
    return RANKS[index + 1]!;
  }
  return null;
}
