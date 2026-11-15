// src/progress/badges.ts
// Badge evaluation logic and unlocking checks.
// Follows SPEC.md section 6 and docs/fr/01-implementation.md section 7.2.

import type { BadgeId } from '../content/badges';
import type { SaveV1 } from './types';

/**
 * Checks whether a specific badge condition is met based on the player save state.
 */
export function isBadgeConditionMet(badgeId: BadgeId, save: SaveV1): boolean {
  switch (badgeId) {
    case 'steady-observer':
      // 5-day streak
      return save.streak.count >= 5;

    case 'flawless-pilot':
      // 3 wins in a row without defeat
      return save.stats.winStreak >= 3;

    case 'space-veteran':
      // 7 wins in a row (tier 1)
      return save.stats.winStreak >= 7;

    case 'ice-cold':
      // 10 timed decisions won with no critical failure
      return save.stats.pressureWinsClean >= 10;

    case 'complete-constellation': {
      // 3 stars on easy, medium and hard of the same mission
      for (const record of Object.values(save.best)) {
        if (
          record.easy === 3 &&
          record.medium === 3 &&
          record.hard === 3
        ) {
          return true;
        }
      }
      return false;
    }

    default:
      return false;
  }
}

/**
 * Evaluates all badges and returns the list of newly unlocked badge IDs.
 */
export function evaluateNewBadges(save: SaveV1): BadgeId[] {
  const currentBadges = new Set(save.badges);
  const candidates: BadgeId[] = [
    'steady-observer',
    'flawless-pilot',
    'space-veteran',
    'ice-cold',
    'complete-constellation',
  ];

  const newlyUnlocked: BadgeId[] = [];
  for (const b of candidates) {
    if (!currentBadges.has(b) && isBadgeConditionMet(b, save)) {
      newlyUnlocked.push(b);
    }
  }
  return newlyUnlocked;
}
