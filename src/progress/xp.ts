// src/progress/xp.ts
// XP computation rules and breakdown according to SPEC.md section 6.
// Follows SPEC.md section 6:
// - Welcome: +50 (once)
// - Objective: +100
// - Crew healthy (health >= 60): +80
// - Each timed decision won: +50
// - Three stars: +60
// - Lost or ended early ("lesson learned"): +25
// - Streak of 3+ days: x1.2 on mission XP

export interface CalculateXpParams {
  isWon: boolean;
  finalHealth: number;
  timedDecisionsWon: number;
  stars: 0 | 1 | 2 | 3;
  giveWelcome: boolean;
  streakCount: number;
}

export interface XpBreakdownResult {
  welcome: number;
  objective: number;
  healthyCrew: number;
  timedBonus: number;
  threeStarBonus: number;
  lessonLearned: number;
  streakMultiplier: number;
  missionXp: number;
  total: number;
}

export function calculateProgressionXp(params: CalculateXpParams): XpBreakdownResult {
  const welcome = params.giveWelcome ? 50 : 0;
  const objective = params.isWon ? 100 : 0;
  const healthyCrew = params.isWon && params.finalHealth >= 60 ? 80 : 0;
  const timedBonus = Math.max(0, params.timedDecisionsWon) * 50;
  const threeStarBonus = params.stars === 3 ? 60 : 0;
  const lessonLearned = !params.isWon ? 25 : 0;

  const missionBase = objective + healthyCrew + timedBonus + threeStarBonus + lessonLearned;
  const streakMultiplier = params.streakCount >= 3 ? 1.2 : 1.0;
  const missionXp = Math.round(missionBase * streakMultiplier);
  const total = welcome + missionXp;

  return {
    welcome,
    objective,
    healthyCrew,
    timedBonus,
    threeStarBonus,
    lessonLearned,
    streakMultiplier,
    missionXp,
    total,
  };
}
