// src/content/badges.ts
// Badges and avatar rewards for junior astronaut progression.
// Conforms to SPEC.md section 6.

export interface BadgeDef {
  id: string;
  name: string;
  conditionText: string;
  avatarId: string;
  description: string;
  icon: string;
}

export const BADGES: readonly BadgeDef[] = [
  {
    id: 'steady-observer',
    name: 'Steady Observer',
    conditionText: 'Reach a 5-day mission training streak.',
    avatarId: 'avatar-1',
    description: 'Consistently logged in and trained 5 consecutive days.',
    icon: '🔭',
  },
  {
    id: 'flawless-pilot',
    name: 'Flawless Pilot',
    conditionText: 'Win 3 expeditions in a row without a loss.',
    avatarId: 'avatar-2',
    description: 'Executed 3 clean missions with 100% mission success.',
    icon: '🚀',
  },
  {
    id: 'space-veteran',
    name: 'Space Veteran',
    conditionText: 'Win 7 expeditions in a row.',
    avatarId: 'avatar-3',
    description: 'Demonstrated enduring endurance with 7 consecutive victories.',
    icon: '🎖️',
  },
  {
    id: 'ice-cold',
    name: 'Ice Cold',
    conditionText: 'Resolve 10 timed alerts cleanly without timer expiry.',
    avatarId: 'avatar-4',
    description: 'Handled critical pressure decisions under stress with zero timeouts.',
    icon: '❄️',
  },
  {
    id: 'complete-constellation',
    name: 'Complete Constellation',
    conditionText: 'Earn 3 stars on Easy, Medium, and Hard of the same mission.',
    avatarId: 'avatar-5',
    description: 'Mastered all difficulty levels of an expedition archetype.',
    icon: '✨',
  },
] as const;

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
