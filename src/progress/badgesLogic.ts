// src/progress/badgesLogic.ts
// Pure logic for evaluating astronaut badge unlock criteria.
// Conforms to SPEC.md section 6:
// - Steady Observer: 5-day streak
// - Flawless Pilot: 3 wins in a row with no loss
// - Space Veteran: 7 wins in a row
// - Ice Cold: 10 timed decisions won with no critical failure
// - Complete Constellation: 3 stars on easy, medium and hard of the same mission

import { BADGES } from '../content/badges';
import type { Difficulty, SaveV1 } from '../engine/types';

const REQUIRED_DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const;

export interface BadgeEvaluationResult {
  unlockedBadges: string[];
  newlyUnlockedBadges: string[];
}

export function evaluateBadges(save: SaveV1): BadgeEvaluationResult {
  const currentBadges = new Set<string>(save.badges);
  const newlyUnlockedBadges: string[] = [];

  function checkBadge(badgeId: string, condition: boolean) {
    if (condition && !currentBadges.has(badgeId)) {
      currentBadges.add(badgeId);
      newlyUnlockedBadges.push(badgeId);
    }
  }

  // 1. Steady Observer: 5-day streak
  checkBadge('steady-observer', save.streak.count >= 5);

  // 2. Flawless Pilot: 3 wins in a row with no loss
  checkBadge('flawless-pilot', save.stats.winStreak >= 3);

  // 3. Space Veteran: 7 wins in a row
  checkBadge('space-veteran', save.stats.winStreak >= 7);

  // 4. Ice Cold: 10 clean pressure wins without critical failures
  checkBadge('ice-cold', save.stats.pressureWinsClean >= 10);

  // 5. Complete Constellation: 3 stars on easy, medium, and hard of the same mission
  let hasCompleteConstellation = false;
  if (save.best) {
    for (const missionRecords of Object.values(save.best)) {
      if (
        missionRecords &&
        REQUIRED_DIFFICULTIES.every((diff) => missionRecords[diff] === 3)
      ) {
        hasCompleteConstellation = true;
        break;
      }
    }
  }
  checkBadge('complete-constellation', hasCompleteConstellation);

  // Filter only to valid known badges
  const validIds = new Set(BADGES.map((b) => b.id));
  const finalUnlocked = Array.from(currentBadges).filter((id) => validIds.has(id));

  return {
    unlockedBadges: finalUnlocked,
    newlyUnlockedBadges,
  };
}
