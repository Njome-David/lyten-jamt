// src/progress/xp.ts
// Pure XP calculation and breakdown functions.
// Conforms to SPEC.md section 6:
// - Welcome +50 (once)
// - Objective +100 (won)
// - Crew healthy (health >= 60) +80
// - Each timed decision won +50
// - Three stars +60
// - Lost or ended early +25 ("lesson learned")
// - Streak of 3+ days: x1.2 on mission XP

import type { XpBreakdown } from '../engine/types';

export interface XpCalculationInput {
  won: boolean;
  health: number;
  pressureWins: number;
  stars: 0 | 1 | 2 | 3;
  streakDays: number;
  welcomeGiven: boolean;
}

export function calculateMissionXp(input: XpCalculationInput): XpBreakdown {
  const welcome = input.welcomeGiven ? 0 : 50;
  const objective = input.won ? 100 : 0;
  const healthyCrew = input.won && input.health >= 60 ? 80 : 0;
  const pressureBonus = Math.max(0, input.pressureWins) * 50;
  const threeStarBonus = input.won && input.stars === 3 ? 60 : 0;
  const lessonLearned = !input.won ? 25 : 0;

  const streakMultiplier = input.streakDays >= 3 ? 1.2 : 1.0;

  const baseTotal =
    welcome +
    objective +
    healthyCrew +
    pressureBonus +
    threeStarBonus +
    lessonLearned;

  const total = Math.round(baseTotal * streakMultiplier);

  return {
    welcome,
    objective,
    healthyCrew,
    pressureBonus,
    threeStarBonus,
    lessonLearned,
    streakMultiplier,
    total,
  };
}
