// src/content/badges.ts
// Badge definitions and unlocking conditions.
// Strictly follows SPEC.md section 6 and docs/fr/01-implementation.md section 7.2.

export type BadgeId =
  | 'steady-observer'
  | 'flawless-pilot'
  | 'space-veteran'
  | 'ice-cold'
  | 'complete-constellation';

export interface BadgeDef {
  id: BadgeId;
  name: string;
  description: string;
  unlockedAvatarId: string;
  conditionDescription: string;
}

export const BADGES: Record<BadgeId, BadgeDef> = {
  'steady-observer': {
    id: 'steady-observer',
    name: 'Steady Observer',
    description: 'Maintained a 5-day observation and mission streak.',
    unlockedAvatarId: 'avatar-1',
    conditionDescription: 'Reach a streak of 5 consecutive days',
  },
  'flawless-pilot': {
    id: 'flawless-pilot',
    name: 'Flawless Pilot',
    description: 'Completed 3 consecutive missions with zero failures.',
    unlockedAvatarId: 'avatar-2',
    conditionDescription: 'Achieve 3 wins in a row without defeat',
  },
  'space-veteran': {
    id: 'space-veteran',
    name: 'Space Veteran',
    description: 'Seasoned explorer with 7 consecutive mission victories.',
    unlockedAvatarId: 'avatar-3',
    conditionDescription: 'Win 7 consecutive missions (tier 2: 15)',
  },
  'ice-cold': {
    id: 'ice-cold',
    name: 'Ice Cold',
    description: 'Master of high-pressure decisions under emergency alerts.',
    unlockedAvatarId: 'avatar-4',
    conditionDescription: 'Win 10 timed decisions without critical failure',
  },
  'complete-constellation': {
    id: 'complete-constellation',
    name: 'Complete Constellation',
    description: 'Mastered easy, medium, and hard modes of the same mission.',
    unlockedAvatarId: 'avatar-5',
    conditionDescription: 'Earn 3 stars in easy, medium, and hard on one mission',
  },
};

export const ALL_BADGE_IDS: BadgeId[] = [
  'steady-observer',
  'flawless-pilot',
  'space-veteran',
  'ice-cold',
  'complete-constellation',
];
